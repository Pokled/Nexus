/**
 * Nexus Voice — WebRTC P2P audio manager
 *
 * Architecture Phase 2 : mesh direct via Socket.IO signaling
 * Architecture Phase 3 : remplacer le transport Socket.IO par DHT/libp2p
 */
import { writable, derived, get } from 'svelte/store'
import type { Socket } from 'socket.io-client'

// ── ICE Configuration ─────────────────────────────────────────────

const BASE_STUN: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' },
]

// Nexus self-hosted TURN relay (no-auth — usage LAN + réseau local)
// TCP en premier : les mappings NAT TCP durent 30+ min vs ~3 min pour UDP
// → évite les micro-déconnexions liées au timeout NAT UDP de la BBOX
const FALLBACK_TURN: RTCIceServer = {
  urls: [
    'turn:pokled.ddns.net:3478?transport=tcp',
    'turn:192.168.1.100:3478?transport=tcp',
    'turn:pokled.ddns.net:3478',
    'turn:192.168.1.100:3478',
  ],
  username:   'guest',
  credential: 'guest',
}

let _extraIceServers: RTCIceServer[] = []

/** Call before joinVoice() to inject TURN credentials from env/settings */
export function configureICE(servers: RTCIceServer[]): void {
  _extraIceServers = servers
  console.debug('[voice] ICE configured with', servers.length, 'extra server(s)')
}

function getIceServers(): RTCIceServer[] {
  // Always include fallback TURN + any env-injected servers
  return [...BASE_STUN, FALLBACK_TURN, ..._extraIceServers]
}

// ── Types ─────────────────────────────────────────────────────────

export interface VoicePeer {
  socketId:  string
  userId:    string
  username:  string
  avatar:    string | null
  stream:    MediaStream | null
  speaking:  boolean
  iceState:  RTCIceConnectionState | null
  seatIndex: number
}

export interface VoiceState {
  active:       boolean
  channelId:    string | null
  muted:        boolean
  deafened:     boolean
  pttMode:      boolean
  peers:        VoicePeer[]
  mySpeaking:   boolean
  mySeatIndex:  number | null
}

// ── Stores ────────────────────────────────────────────────────────

export const voiceStore = writable<VoiceState>({
  active:       false,
  channelId:    null,
  muted:        false,
  deafened:     false,
  pttMode:      false,
  peers:        [],
  mySpeaking:   false,
  mySeatIndex:  null,
})

// Niveau micro 0–100, mis à jour par startLocalVAD
export const inputLevel = writable<number>(0)

export const isInVoice    = derived(voiceStore, s => s.active)
export const voicePeers   = derived(voiceStore, s => s.peers)
export const voiceChannel = derived(voiceStore, s => s.channelId)

// ── Peer stats ────────────────────────────────────────────────────

export interface PeerStats {
  rtt:            number | null  // ms — votre RTT vers ce peer
  theirRtt:       number | null  // ms — leur RTT (ils le broadcastent)
  packetLoss:     number | null  // %
  jitter:         number | null  // ms
  connectionType: 'relay' | 'direct' | 'unknown'
}

export type NetQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'unknown'

export const peerStatsStore = writable<Map<string, PeerStats>>(new Map())

// ── Screen share stores ────────────────────────────────────────────
export const screenShareStore  = writable<boolean>(false)
export const localScreenStore  = writable<MediaStream | null>(null)
export const remoteScreenStore = writable<Map<string, MediaStream>>(new Map())

export function getQuality(stats: PeerStats | undefined): NetQuality {
  if (!stats) return 'unknown'
  const rtt  = stats.rtt ?? stats.theirRtt
  const loss = stats.packetLoss ?? 0
  if (rtt === null) return 'unknown'
  if (rtt < 60  && loss < 1) return 'excellent'
  if (rtt < 120 && loss < 3) return 'good'
  if (rtt < 250 && loss < 8) return 'fair'
  return 'poor'
}

// ── Stats polling internals ───────────────────────────────────────

const _statsIntervals = new Map<string, ReturnType<typeof setInterval>>()
const _prevPackets    = new Map<string, { received: number; lost: number }>()

async function _pollStats(socketId: string, channelId: string): Promise<void> {
  const pc = _peerConns.get(socketId)
  if (!pc) return
  try {
    const stats = await pc.getStats()
    let rtt: number | null = null
    let packetLoss: number | null = null
    let jitter: number | null = null
    let connectionType: PeerStats['connectionType'] = 'unknown'

    for (const r of stats.values()) {
      // RTT + connexion type depuis la paire ICE active
      if (r.type === 'candidate-pair' && r.nominated) {
        if (r.currentRoundTripTime != null)
          rtt = Math.round(r.currentRoundTripTime * 1000)
        const local = stats.get(r.localCandidateId)
        if (local?.candidateType === 'relay') connectionType = 'relay'
        else if (local?.candidateType)        connectionType = 'direct'
      }
      // Perte de paquets + jitter depuis inbound-rtp audio
      if (r.type === 'inbound-rtp' && r.kind === 'audio') {
        if (r.jitter != null) jitter = Math.round(r.jitter * 1000)
        const prev = _prevPackets.get(socketId)
        const received = r.packetsReceived ?? 0
        const lost     = r.packetsLost     ?? 0
        if (prev) {
          const dRec  = received - prev.received
          const dLost = lost     - prev.lost
          const total = dRec + dLost
          if (total > 0) packetLoss = Math.round((dLost / total) * 1000) / 10
        }
        _prevPackets.set(socketId, { received, lost })
      }
    }

    peerStatsStore.update(map => {
      const cur = map.get(socketId) ?? { rtt: null, theirRtt: null, packetLoss: null, jitter: null, connectionType: 'unknown' }
      map.set(socketId, { ...cur, rtt, packetLoss, jitter, connectionType })
      return new Map(map)
    })

    // Broadcast notre propre RTT aux autres peers
    if (rtt !== null && _socket) {
      _socket.emit('voice:stats', { channelId, rtt })
    }
  } catch { /* peer déconnecté */ }
}

function _startStatsPolling(socketId: string, channelId: string): void {
  _stopStatsPolling(socketId)
  // Premier poll rapide, puis toutes les 2s
  _pollStats(socketId, channelId)
  _statsIntervals.set(socketId, setInterval(() => _pollStats(socketId, channelId), 2000))
}

function _stopStatsPolling(socketId: string): void {
  const t = _statsIntervals.get(socketId)
  if (t) { clearInterval(t); _statsIntervals.delete(socketId) }
  _prevPackets.delete(socketId)
  peerStatsStore.update(map => { map.delete(socketId); return new Map(map) })
}

// ── Internal state ────────────────────────────────────────────────

let _socket:        Socket | null = null
let _localStream:   MediaStream | null = null
let _screenStream:  MediaStream | null = null
let _peerConns:     Map<string, RTCPeerConnection> = new Map()
let _iceQueues:     Map<string, RTCIceCandidateInit[]> = new Map()

// Reconnect handler — stored as named ref so it can be properly removed
let _onSocketReconnect: (() => void) | null = null

// ── Peer audio chains ─────────────────────────────────────────────

interface PeerAudio {
  audioEl:     HTMLAudioElement
  analyserCtx: AudioContext
  analyser:    AnalyserNode
  vadInterval: ReturnType<typeof setInterval>
}

const _peerAudio = new Map<string, PeerAudio>()

function createPeerAudio(socketId: string, stream: MediaStream): void {
  destroyPeerAudio(socketId)
  try {
    // Playback via <audio> element — guaranteed to play regardless of AudioContext policy
    const audioEl = new Audio()
    audioEl.srcObject = stream
    audioEl.autoplay  = true
    audioEl.play().catch(() => { /* will autoplay on next user gesture */ })

    // Dedicated AudioContext for VAD only (never connected to destination)
    const analyserCtx = new AudioContext()
    const source      = analyserCtx.createMediaStreamSource(stream)
    const analyser    = analyserCtx.createAnalyser()
    analyser.fftSize  = 512
    source.connect(analyser)

    const data = new Uint8Array(analyser.frequencyBinCount)
    const vadInterval = setInterval(() => {
      analyser.getByteFrequencyData(data)
      const avg      = data.reduce((a, b) => a + b, 0) / data.length
      const speaking = avg > 12
      voiceStore.update(s => ({
        ...s,
        peers: s.peers.map(p => p.socketId === socketId ? { ...p, speaking } : p),
      }))
    }, 100)

    _peerAudio.set(socketId, { audioEl, analyserCtx, analyser, vadInterval })
  } catch { /* ignore */ }
}

function destroyPeerAudio(socketId: string): void {
  const node = _peerAudio.get(socketId)
  if (node) {
    clearInterval(node.vadInterval)
    node.audioEl.pause()
    node.audioEl.srcObject = null
    try { node.analyser.disconnect() } catch { /* already disconnected */ }
    node.analyserCtx.close().catch(() => {})
    _peerAudio.delete(socketId)
  }
  _stopStatsPolling(socketId)
}

export function setPeerVolume(socketId: string, value: number): void {
  const node = _peerAudio.get(socketId)
  if (node) node.audioEl.volume = Math.min(1, Math.max(0, value))
}

// ── Opus SDP tuning ───────────────────────────────────────────────

function applyOpusTuning(sdp: string): string {
  const rtpMatch = sdp.match(/a=rtpmap:(\d+) opus\/48000\/2/)
  if (!rtpMatch) return sdp
  const pt = rtpMatch[1]

  const existingFmtp = new RegExp(`a=fmtp:${pt} (.*)`)
  if (existingFmtp.test(sdp)) {
    return sdp.replace(existingFmtp, (_: string, params: string) => {
      const existing = Object.fromEntries(params.split(';').map((p: string) => {
        const idx = p.indexOf('=')
        return idx !== -1 ? [p.slice(0, idx), p.slice(idx + 1)] : [p, '']
      }))
      const merged = { ...existing, maxaveragebitrate: '40000', useinbandfec: '1', usedtx: '1' }
      return `a=fmtp:${pt} ${Object.entries(merged).map(([k, v]) => v ? `${k}=${v}` : k).join(';')}`
    })
  } else {
    return sdp.replace(
      `a=rtpmap:${pt} opus/48000/2\r\n`,
      `a=rtpmap:${pt} opus/48000/2\r\na=fmtp:${pt} maxaveragebitrate=40000;useinbandfec=1;usedtx=1\r\n`,
    )
  }
}

// ── Peer connection factory ───────────────────────────────────────

function createPeerConn(
  remoteSocketId: string,
  channelId: string,
  isInitiator: boolean,
): RTCPeerConnection {
  const pc = new RTCPeerConnection({ iceServers: getIceServers() })
  let _iceRestartCount = 0

  pc.oniceconnectionstatechange = () => {
    const state = pc.iceConnectionState
    console.debug(`[voice] ICE ${remoteSocketId.slice(0, 6)} → ${state}`)
    voiceStore.update(s => ({
      ...s,
      peers: s.peers.map(p =>
        p.socketId === remoteSocketId ? { ...p, iceState: state } : p
      ),
    }))
    if (state === 'connected' || state === 'completed') {
      _iceRestartCount = 0
      _startStatsPolling(remoteSocketId, channelId)
    }
    if (state === 'disconnected') {
      if (_iceRestartCount >= 2) {
        // Already tried twice — give up and rejoin
        _scheduleRejoin(channelId)
        return
      }
      setTimeout(() => {
        if (pc.iceConnectionState !== 'disconnected') return
        _iceRestartCount++
        console.warn(`[voice] ICE ${remoteSocketId.slice(0, 6)} still disconnected — restart attempt ${_iceRestartCount}`)
        try {
          if (isInitiator && pc.signalingState === 'stable') {
            pc.createOffer({ iceRestart: true })
              .then(offer => {
                if (pc.signalingState !== 'stable') return
                return pc.setLocalDescription(offer).then(() => {
                  _socket?.emit('voice:offer', { to: remoteSocketId, sdp: pc.localDescription, channelId })
                })
              })
              .catch(() => { _scheduleRejoin(channelId) })
          } else {
            // Non-initiator: wait for re-offer, escalate if nothing happens
            setTimeout(() => {
              if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
                _scheduleRejoin(channelId)
              }
            }, 5000)
          }
        } catch { _scheduleRejoin(channelId) }
      }, 4000)
    }
    if (state === 'failed') {
      console.warn('[voice] ICE failed — scheduling rejoin')
      _scheduleRejoin(channelId)
    }
  }

  pc.onicecandidate = ({ candidate }) => {
    if (candidate && _socket) {
      _socket.emit('voice:ice', { to: remoteSocketId, candidate, channelId })
    }
  }

  pc.ontrack = ({ track, streams }) => {
    const stream = (streams && streams.length > 0) ? streams[0] : new MediaStream([track])

    if (track.kind === 'audio') {
      voiceStore.update(s => ({
        ...s,
        peers: s.peers.map(p =>
          p.socketId === remoteSocketId ? { ...p, stream } : p
        ),
      }))
      createPeerAudio(remoteSocketId, stream)
    } else if (track.kind === 'video') {
      remoteScreenStore.update(map => {
        map.set(remoteSocketId, stream)
        return new Map(map)
      })
      track.onended = () => {
        remoteScreenStore.update(map => { map.delete(remoteSocketId); return new Map(map) })
      }
    }
  }

  if (isInitiator) {
    let makingOffer = false
    pc.onnegotiationneeded = async () => {
      if (makingOffer || pc.signalingState !== 'stable') return
      makingOffer = true
      try {
        const offer = await pc.createOffer()
        if (pc.signalingState !== 'stable') return
        const tunedSdp = applyOpusTuning(offer.sdp ?? '')
        await pc.setLocalDescription({ type: 'offer', sdp: tunedSdp })
        _socket?.emit('voice:offer', {
          to:  remoteSocketId,
          sdp: pc.localDescription,
          channelId,
        })
      } catch (e) {
        console.warn('[voice] createOffer error:', e)
      } finally {
        makingOffer = false
      }
    }
  }

  if (_localStream) {
    for (const track of _localStream.getTracks()) {
      pc.addTrack(track, _localStream)
    }
  }

  _peerConns.set(remoteSocketId, pc)
  return pc
}

// ── Rejoin scheduling (throttled) ─────────────────────────────────

let _rejoinTimer: ReturnType<typeof setTimeout> | null = null
function _scheduleRejoin(channelId: string): void {
  if (_rejoinTimer) return
  _rejoinTimer = setTimeout(() => {
    _rejoinTimer = null
    _doRejoin(channelId)
  }, 1500)
}

function _doRejoin(channelId: string): void {
  if (!_socket || !get(voiceStore).active) return
  console.debug('[voice] Rejoining voice room:', channelId)

  _socket.emit('voice:leave', channelId)

  for (const [sid, pc] of _peerConns) {
    destroyPeerAudio(sid)
    pc.close()
  }
  _peerConns.clear()
  _iceQueues.clear()

  voiceStore.update(s => ({ ...s, peers: [], mySeatIndex: null }))

  _socket.emit('voice:join', channelId)

  stopVAD('__local__')
  startLocalVAD(channelId)
}

// ── ICE candidate queue helpers ───────────────────────────────────

async function flushICEQueue(socketId: string, pc: RTCPeerConnection): Promise<void> {
  const queue = _iceQueues.get(socketId) ?? []
  _iceQueues.delete(socketId)
  for (const candidate of queue) {
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate))
    } catch { /* stale */ }
  }
}

// ── Local VAD (Voice Activity Detection) ─────────────────────────

type AudioEntry = { ctx: AudioContext; analyser: AnalyserNode; interval: ReturnType<typeof setInterval> }
const _audioCtxMap = new Map<string, AudioEntry>()

function startLocalVAD(channelId: string): void {
  stopVAD('__local__')
  if (!_localStream) return
  try {
    const ctx      = new AudioContext()
    const source   = ctx.createMediaStreamSource(_localStream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 512
    source.connect(analyser)
    const data = new Uint8Array(analyser.frequencyBinCount)
    let lastSpeaking = false
    const interval = setInterval(() => {
      analyser.getByteFrequencyData(data)
      const avg      = data.reduce((a, b) => a + b, 0) / data.length
      const level    = Math.min(100, Math.round(avg * 2.5))
      inputLevel.set(level)
      const speaking = avg > 12
      voiceStore.update(s => ({ ...s, mySpeaking: speaking }))
      if (speaking !== lastSpeaking) {
        lastSpeaking = speaking
        _socket?.emit('voice:speaking', { channelId, speaking })
      }
    }, 100)
    _audioCtxMap.set('__local__', { ctx, analyser, interval })
  } catch { /* ignore */ }
}

function stopVAD(key: string): void {
  const entry = _audioCtxMap.get(key)
  if (entry) {
    clearInterval(entry.interval)
    entry.ctx.close().catch(() => {})
    _audioCtxMap.delete(key)
  }
}

// ── Public API ────────────────────────────────────────────────────

export async function joinVoice(channelId: string, socket: Socket): Promise<void> {
  if (!window.isSecureContext) throw new Error('INSECURE')

  try {
    const perm = await navigator.permissions.query({ name: 'microphone' as PermissionName })
    if (perm.state === 'denied') throw new Error('DENIED')
  } catch (e: any) {
    if (e.message === 'DENIED') throw e
  }

  try {
    _localStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl:  true,
        channelCount:     1,
      },
      video: false,
    })
  } catch (e: any) {
    const name = e?.name ?? ''
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') throw new Error('DENIED')
    if (name === 'NotFoundError') throw new Error('NOTFOUND')
    if (name === 'NotReadableError') throw new Error('BUSY')
    throw new Error('DENIED')
  }

  _socket = socket

  socket.on('voice:init',        onVoiceInit)
  socket.on('voice:peer_joined', onPeerJoined)
  socket.on('voice:peer_left',   onPeerLeft)
  socket.on('voice:offer',       onOffer)
  socket.on('voice:answer',      onAnswer)
  socket.on('voice:ice',         onICE)
  socket.on('voice:speaking',    onSpeaking)
  socket.on('voice:stats',       onPeerStats)

  _onSocketReconnect = () => {
    console.debug('[voice] Socket reconnected — rejoining voice room')
    _doRejoin(channelId)
  }
  socket.on('connect', _onSocketReconnect)

  socket.emit('voice:join', channelId)

  voiceStore.set({
    active: true, channelId, muted: false, deafened: false,
    pttMode: false, peers: [], mySpeaking: false, mySeatIndex: null,
  })

  startLocalVAD(channelId)
}

export function leaveVoice(): void {
  const { channelId } = get(voiceStore)
  if (channelId && _socket) {
    _socket.emit('voice:leave', channelId)
  }

  if (_socket) {
    _socket.off('voice:init',        onVoiceInit)
    _socket.off('voice:peer_joined', onPeerJoined)
    _socket.off('voice:peer_left',   onPeerLeft)
    _socket.off('voice:offer',       onOffer)
    _socket.off('voice:answer',      onAnswer)
    _socket.off('voice:ice',         onICE)
    _socket.off('voice:speaking',    onSpeaking)
    _socket.off('voice:stats',       onPeerStats)
    if (_onSocketReconnect) {
      _socket.off('connect', _onSocketReconnect)
      _onSocketReconnect = null
    }
  }

  if (_rejoinTimer) { clearTimeout(_rejoinTimer); _rejoinTimer = null }

  for (const [sid, pc] of _peerConns) {
    destroyPeerAudio(sid)
    pc.close()
  }
  _peerConns.clear()
  _iceQueues.clear()

  stopVAD('__local__')

  _localStream?.getTracks().forEach(t => t.stop())
  _localStream = null

  _screenStream?.getTracks().forEach(t => t.stop())
  _screenStream = null
  screenShareStore.set(false)
  localScreenStore.set(null)
  remoteScreenStore.set(new Map())

  _socket = null

  inputLevel.set(0)
  voiceStore.set({
    active: false, channelId: null, muted: false, deafened: false,
    pttMode: false, peers: [], mySpeaking: false, mySeatIndex: null,
  })
}

export function toggleMute(): void {
  if (!_localStream) return
  const track = _localStream.getAudioTracks()[0]
  if (!track) return
  track.enabled = !track.enabled
  voiceStore.update(s => ({ ...s, muted: !track.enabled }))
}

export function toggleDeafen(): void {
  voiceStore.update(s => {
    const deafened = !s.deafened
    // Mute/unmute all peer audio elements
    for (const [, node] of _peerAudio) {
      node.audioEl.muted = deafened
    }
    return { ...s, deafened }
  })
}

export function togglePTTMode(): void {
  voiceStore.update(s => {
    const pttMode = !s.pttMode
    if (_localStream) {
      const track = _localStream.getAudioTracks()[0]
      if (track) track.enabled = !pttMode
    }
    return { ...s, pttMode, muted: pttMode }
  })
}

export function startPTT(): void {
  if (!_localStream) return
  const track = _localStream.getAudioTracks()[0]
  if (!track) return
  track.enabled = true
  voiceStore.update(s => ({ ...s, muted: false }))
}

export function stopPTT(): void {
  if (!_localStream) return
  const track = _localStream.getAudioTracks()[0]
  if (!track) return
  track.enabled = false
  voiceStore.update(s => ({ ...s, muted: true }))
}

// ── Screen sharing ────────────────────────────────────────────────

export async function startScreenShare(): Promise<void> {
  const { channelId } = get(voiceStore)
  if (!channelId || !_socket) return

  try {
    const displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: 'always' } as any,
      audio: false,
    })

    _screenStream = displayStream
    localScreenStore.set(displayStream)
    screenShareStore.set(true)

    const videoTrack = displayStream.getVideoTracks()[0]
    videoTrack.onended = () => stopScreenShare()

    for (const [socketId, pc] of _peerConns) {
      try {
        pc.addTrack(videoTrack, displayStream)
        if (pc.signalingState === 'stable') {
          const offer    = await pc.createOffer()
          const tunedSdp = applyOpusTuning(offer.sdp ?? '')
          await pc.setLocalDescription({ type: 'offer', sdp: tunedSdp })
          _socket?.emit('voice:offer', { to: socketId, sdp: pc.localDescription, channelId })
        }
      } catch (e) {
        console.warn('[voice] Screen share: addTrack failed for', socketId, e)
      }
    }
  } catch (err: any) {
    if (err.name !== 'NotAllowedError') {
      console.error('[voice] Screen share error:', err)
    }
    screenShareStore.set(false)
    localScreenStore.set(null)
  }
}

export function stopScreenShare(): void {
  const { channelId } = get(voiceStore)

  if (_screenStream) {
    _screenStream.getTracks().forEach(t => t.stop())
    _screenStream = null
  }

  screenShareStore.set(false)
  localScreenStore.set(null)

  if (!channelId) return

  for (const [socketId, pc] of _peerConns) {
    const videoSenders = pc.getSenders().filter(s => s.track?.kind === 'video')
    for (const sender of videoSenders) {
      try { pc.removeTrack(sender) } catch { /* ignore */ }
    }
    if (pc.signalingState === 'stable') {
      pc.createOffer()
        .then(offer => pc.setLocalDescription({ type: 'offer', sdp: applyOpusTuning(offer.sdp ?? '') }))
        .then(() => { _socket?.emit('voice:offer', { to: socketId, sdp: pc.localDescription, channelId }) })
        .catch(() => { /* peer may have disconnected */ })
    }
  }
}

// ── Socket event handlers ─────────────────────────────────────────

function onVoiceInit({ channelId, peers, mySeatIndex }: {
  channelId:   string
  peers:       { socketId: string; userId: string; username: string; avatar: string | null; seatIndex: number }[]
  mySeatIndex: number
}): void {
  for (const [sid, pc] of _peerConns) {
    destroyPeerAudio(sid)
    pc.close()
  }
  _peerConns.clear()
  _iceQueues.clear()

  const peerList: VoicePeer[] = peers.map(p => ({ ...p, stream: null, speaking: false, iceState: null }))
  voiceStore.update(s => ({ ...s, peers: peerList, mySeatIndex }))

  for (const peer of peers) {
    createPeerConn(peer.socketId, channelId, true)
  }
}

function onPeerJoined({ channelId, peer }: {
  channelId: string
  peer: { socketId: string; userId: string; username: string; avatar: string | null; seatIndex: number }
}): void {
  voiceStore.update(s => {
    if (s.peers.some(p => p.socketId === peer.socketId)) return s
    return { ...s, peers: [...s.peers, { ...peer, stream: null, speaking: false, iceState: null }] }
  })
  if (!_peerConns.has(peer.socketId)) {
    createPeerConn(peer.socketId, channelId, false)
  }
}

function onPeerLeft({ socketId }: { channelId: string; socketId: string }): void {
  destroyPeerAudio(socketId)
  const pc = _peerConns.get(socketId)
  pc?.close()
  _peerConns.delete(socketId)
  _iceQueues.delete(socketId)
  remoteScreenStore.update(map => { map.delete(socketId); return new Map(map) })
  voiceStore.update(s => ({ ...s, peers: s.peers.filter(p => p.socketId !== socketId) }))
}

async function onOffer({ from, sdp, channelId }: { from: string; sdp: RTCSessionDescriptionInit; channelId: string }): Promise<void> {
  let pc = _peerConns.get(from)
  if (!pc) pc = createPeerConn(from, channelId, false)

  await pc.setRemoteDescription(new RTCSessionDescription(sdp))
  await flushICEQueue(from, pc)

  const answer    = await pc.createAnswer()
  const tunedSdp  = applyOpusTuning(answer.sdp ?? '')
  await pc.setLocalDescription({ type: 'answer', sdp: tunedSdp })
  _socket?.emit('voice:answer', { to: from, sdp: pc.localDescription, channelId })
}

async function onAnswer({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }): Promise<void> {
  const pc = _peerConns.get(from)
  if (!pc) return
  await pc.setRemoteDescription(new RTCSessionDescription(sdp))
  await flushICEQueue(from, pc)
}

async function onICE({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }): Promise<void> {
  const pc = _peerConns.get(from)
  if (!pc || !pc.remoteDescription) {
    const queue = _iceQueues.get(from) ?? []
    queue.push(candidate)
    _iceQueues.set(from, queue)
    return
  }
  try {
    await pc.addIceCandidate(new RTCIceCandidate(candidate))
  } catch { /* stale */ }
}

function onSpeaking({ socketId, speaking }: { socketId: string; speaking: boolean }): void {
  voiceStore.update(s => ({
    ...s,
    peers: s.peers.map(p => p.socketId === socketId ? { ...p, speaking } : p),
  }))
}

function onPeerStats({ from, rtt }: { from: string; rtt: number | null }): void {
  peerStatsStore.update(map => {
    const cur = map.get(from) ?? { rtt: null, theirRtt: null, packetLoss: null, jitter: null, connectionType: 'unknown' as const }
    map.set(from, { ...cur, theirRtt: rtt })
    return new Map(map)
  })
}
