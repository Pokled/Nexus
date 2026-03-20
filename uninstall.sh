#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
#  Nodyx — Uninstaller complet
#  Supprime Nodyx, PM2, Caddy, PostgreSQL (DB nodyx), Redis, services systemd
#  Usage : sudo bash uninstall.sh
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

ok()   { echo -e "${GREEN}✔${RESET}  $*"; }
info() { echo -e "${CYAN}→${RESET}  $*"; }
warn() { echo -e "${YELLOW}⚠${RESET}  $*"; }
skip() { echo -e "  ${CYAN}↷${RESET}  $* ${CYAN}(ignoré)${RESET}"; }
step() { echo ""; echo -e "${BOLD}━━━  $*  ━━━${RESET}"; }
die()  { echo -e "${RED}✘  $*${RESET}" >&2; exit 1; }

confirm() {
  local msg="$1"
  local ans
  read -rp "$(echo -e "  ${YELLOW}?${RESET} ${msg} [o/N] ")" ans
  [[ "${ans,,}" == "o" ]]
}

# ═══════════════════════════════════════════════════════════════════════════════
#  PREFLIGHT
# ═══════════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${RED}${BOLD}╔══════════════════════════════════════════════════════════╗${RESET}"
echo -e "${RED}${BOLD}║          ⚠   DÉSINSTALLATION NODYX   ⚠                  ║${RESET}"
echo -e "${RED}${BOLD}║                                                          ║${RESET}"
echo -e "${RED}${BOLD}║  Ce script va supprimer :                                ║${RESET}"
echo -e "${RED}${BOLD}║  • Les processus PM2 et l'app Nodyx (/opt/nodyx)         ║${RESET}"
echo -e "${RED}${BOLD}║  • La base de données PostgreSQL « nodyx »               ║${RESET}"
echo -e "${RED}${BOLD}║  • Les services Caddy, Redis, nodyx-turn, nodyx-relay    ║${RESET}"
echo -e "${RED}${BOLD}║  • Les fichiers de configuration générés                 ║${RESET}"
echo -e "${RED}${BOLD}║                                                          ║${RESET}"
echo -e "${RED}${BOLD}║  TOUTES LES DONNÉES SERONT PERDUES DÉFINITIVEMENT.       ║${RESET}"
echo -e "${RED}${BOLD}╚══════════════════════════════════════════════════════════╝${RESET}"
echo ""

[[ $EUID -ne 0 ]] && die "Lance ce script en root : sudo bash uninstall.sh"

confirm "Tu es sûr de vouloir désinstaller Nodyx complètement ?" \
  || { echo -e "\n  ${GREEN}Annulé.${RESET}\n"; exit 0; }

echo ""
warn "Dernière chance — toutes les données (messages, forums, fichiers) seront supprimées."
confirm "Confirme la suppression définitive" \
  || { echo -e "\n  ${GREEN}Annulé.${RESET}\n"; exit 0; }

# Détecter NODYX_DIR
NODYX_DIR="/opt/nodyx"
if [[ ! -d "$NODYX_DIR" ]]; then
  # Chercher dans ecosystem.config.js ou pm2
  _alt=$(pm2 list 2>/dev/null | grep nodyx-core | grep -oE '/[^ ]+nodyx[^ ]+' | head -1 | xargs dirname 2>/dev/null || true)
  [[ -n "$_alt" ]] && NODYX_DIR="$_alt"
fi

# ═══════════════════════════════════════════════════════════════════════════════
#  PM2 — arrêt et suppression des processus
# ═══════════════════════════════════════════════════════════════════════════════
step "Arrêt et suppression des processus PM2"

if command -v pm2 &>/dev/null; then
  pm2 stop nodyx-core     2>/dev/null || true
  pm2 stop nodyx-frontend 2>/dev/null || true
  pm2 delete nodyx-core     2>/dev/null || true
  pm2 delete nodyx-frontend 2>/dev/null || true
  pm2 save --force 2>/dev/null || true
  ok "Processus PM2 nodyx-core + nodyx-frontend supprimés"

  if confirm "Désinstaller PM2 complètement (npm uninstall -g pm2) ?"; then
    npm uninstall -g pm2 --silent 2>/dev/null || true
    ok "PM2 désinstallé"
  else
    skip "PM2 conservé"
  fi
else
  skip "PM2 non installé"
fi

# ═══════════════════════════════════════════════════════════════════════════════
#  SERVICES SYSTEMD — nodyx-turn, nodyx-relay-client
# ═══════════════════════════════════════════════════════════════════════════════
step "Suppression des services Nodyx (systemd)"

for _svc in nodyx-turn nodyx-relay-client; do
  if systemctl list-unit-files 2>/dev/null | grep -q "^${_svc}.service"; then
    systemctl stop    "$_svc" 2>/dev/null || true
    systemctl disable "$_svc" 2>/dev/null || true
    rm -f "/etc/systemd/system/${_svc}.service"
    ok "Service $_svc supprimé"
  else
    skip "Service $_svc non trouvé"
  fi
done

for _bin in /usr/local/bin/nodyx-turn /usr/local/bin/nodyx-relay; do
  [[ -f "$_bin" ]] && { rm -f "$_bin"; ok "Binaire $_bin supprimé"; } || skip "$_bin non trouvé"
done

[[ -f /etc/nodyx-turn.env ]] && { rm -f /etc/nodyx-turn.env; ok "/etc/nodyx-turn.env supprimé"; }

systemctl daemon-reload 2>/dev/null || true

# ═══════════════════════════════════════════════════════════════════════════════
#  CADDY
# ═══════════════════════════════════════════════════════════════════════════════
step "Caddy"

if command -v caddy &>/dev/null; then
  if confirm "Arrêter et désinstaller Caddy ?"; then
    systemctl stop    caddy 2>/dev/null || true
    systemctl disable caddy 2>/dev/null || true
    apt-get remove -y caddy 2>/dev/null || true
    rm -f /etc/caddy/Caddyfile
    ok "Caddy désinstallé"
  else
    # Juste vider le Caddyfile pour ne plus servir Nodyx
    info "Caddy conservé — remise à zéro du Caddyfile"
    echo "# Nodyx désinstallé" > /etc/caddy/Caddyfile
    systemctl reload caddy 2>/dev/null || true
    ok "Caddyfile vidé"
  fi
else
  skip "Caddy non installé"
fi

# ═══════════════════════════════════════════════════════════════════════════════
#  REDIS
# ═══════════════════════════════════════════════════════════════════════════════
step "Redis"

if command -v redis-cli &>/dev/null; then
  if confirm "Arrêter et désinstaller Redis (supprime toutes les données Redis) ?"; then
    systemctl stop    redis-server 2>/dev/null || true
    systemctl disable redis-server 2>/dev/null || true
    apt-get remove -y redis-server 2>/dev/null || true
    rm -rf /var/lib/redis 2>/dev/null || true
    ok "Redis désinstallé"
  else
    # Juste vider les clés Nodyx
    info "Redis conservé — suppression des clés Nodyx (session:*, heartbeat:*)"
    redis-cli --scan --pattern 'session:*'   | xargs -r redis-cli del 2>/dev/null || true
    redis-cli --scan --pattern 'heartbeat:*' | xargs -r redis-cli del 2>/dev/null || true
    ok "Clés Nodyx supprimées de Redis"
  fi
else
  skip "Redis non installé"
fi

# ═══════════════════════════════════════════════════════════════════════════════
#  POSTGRESQL — suppression DB + user nodyx
# ═══════════════════════════════════════════════════════════════════════════════
step "PostgreSQL"

if command -v psql &>/dev/null; then
  if confirm "Supprimer la base de données « nodyx » et l'utilisateur PostgreSQL ?"; then
    sudo -u postgres psql -c "DROP DATABASE IF EXISTS nodyx;"        2>/dev/null || true
    sudo -u postgres psql -c "DROP ROLE IF EXISTS nodyx_user;"       2>/dev/null || true
    sudo -u postgres psql -c "DROP ROLE IF EXISTS nodyx;"            2>/dev/null || true
    ok "Base nodyx + utilisateurs supprimés"

    if confirm "Désinstaller PostgreSQL complètement (ATTENTION : supprime tout PostgreSQL) ?"; then
      _PG_VER=$(ls /usr/lib/postgresql/ 2>/dev/null | sort -Vr | head -1 || echo "")
      systemctl stop "postgresql@${_PG_VER}-main" 2>/dev/null || true
      apt-get remove -y --purge postgresql postgresql-contrib "postgresql-${_PG_VER}" 2>/dev/null || true
      rm -rf /var/lib/postgresql 2>/dev/null || true
      ok "PostgreSQL désinstallé"
    else
      skip "PostgreSQL (package) conservé"
    fi
  else
    skip "Base de données conservée"
  fi
else
  skip "PostgreSQL non installé"
fi

# ═══════════════════════════════════════════════════════════════════════════════
#  FICHIERS NODYX
# ═══════════════════════════════════════════════════════════════════════════════
step "Suppression des fichiers Nodyx"

if [[ -d "$NODYX_DIR" ]]; then
  if confirm "Supprimer le dossier Nodyx : ${BOLD}${NODYX_DIR}${RESET} ?"; then
    rm -rf "$NODYX_DIR"
    ok "$NODYX_DIR supprimé"
  else
    skip "$NODYX_DIR conservé"
  fi
else
  skip "$NODYX_DIR non trouvé"
fi

# Script de mise à jour
[[ -f /usr/local/bin/nodyx-update ]] && { rm -f /usr/local/bin/nodyx-update; ok "nodyx-update supprimé"; }

# Fichier credentials
if [[ -f /root/nodyx-credentials.txt ]]; then
  if confirm "Supprimer /root/nodyx-credentials.txt (credentials admin) ?"; then
    rm -f /root/nodyx-credentials.txt
    ok "nodyx-credentials.txt supprimé"
  else
    skip "nodyx-credentials.txt conservé"
  fi
fi

# ═══════════════════════════════════════════════════════════════════════════════
#  UFW — réinitialiser les règles Nodyx (optionnel)
# ═══════════════════════════════════════════════════════════════════════════════
step "Pare-feu (UFW)"

if command -v ufw &>/dev/null && ufw status 2>/dev/null | grep -q "Status: active"; then
  if confirm "Réinitialiser UFW (supprime toutes les règles) ?"; then
    ufw --force reset >/dev/null 2>&1
    ufw default allow incoming >/dev/null 2>&1
    ufw default allow outgoing >/dev/null 2>&1
    ufw --force enable >/dev/null 2>&1
    ok "UFW réinitialisé (tout autorisé)"
  else
    skip "UFW conservé"
  fi
else
  skip "UFW non actif"
fi

# ═══════════════════════════════════════════════════════════════════════════════
#  RÉSUMÉ
# ═══════════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${GREEN}${BOLD}║       ✔  Désinstallation terminée                ║${RESET}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  Nodyx a été retiré de ce serveur."
echo -e "  Pour réinstaller : ${CYAN}git clone https://github.com/Pokled/Nodyx.git && cd Nodyx && sudo bash install.sh${RESET}"
echo ""
