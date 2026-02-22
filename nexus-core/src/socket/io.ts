import { Server } from 'socket.io'

export let io: Server | null = null

export function setIO(instance: Server): void {
  io = instance
}
