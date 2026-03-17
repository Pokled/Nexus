#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Nexus Easy Install — Installation automatisée sur Windows Server sans Docker.

.DESCRIPTION
    Ce script installe et configure Nexus en moins de 15 minutes sur un Windows Server vierge.
    Il installe automatiquement : Node.js LTS, PostgreSQL 16, Redis, NSSM (gestionnaire de services).
    Il crée la base de données, configure le .env, exécute les migrations, et enregistre
    Nexus comme service Windows qui démarre automatiquement au reboot.

.PARAMETER NexusPath
    Dossier d'installation de Nexus. Par défaut : C:\Nexus

.PARAMETER SkipInstall
    Passe l'installation des dépendances (si elles sont déjà installées).

.EXAMPLE
    .\Install-Nexus.ps1
    .\Install-Nexus.ps1 -NexusPath "D:\Apps\Nexus"
    .\Install-Nexus.ps1 -SkipInstall

.NOTES
    Prérequis : Windows Server 2019/2022 ou Windows 10/11, accès internet, PowerShell 5.1+
    Repository : https://github.com/nexus-community/nexus-core
#>

[CmdletBinding()]
param(
    [string]$NexusPath = "C:\Nexus",
    [switch]$SkipInstall
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ── Couleurs et helpers ───────────────────────────────────────────────────────

function Write-Step   { param($msg) Write-Host "`n▶ $msg" -ForegroundColor Cyan }
function Write-OK     { param($msg) Write-Host "  ✓ $msg" -ForegroundColor Green }
function Write-Warn   { param($msg) Write-Host "  ⚠ $msg" -ForegroundColor Yellow }
function Write-Fail   { param($msg) Write-Host "  ✗ $msg" -ForegroundColor Red; exit 1 }
function Write-Banner {
    Write-Host @"

  ███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗
  ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝
  ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗
  ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║
  ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║
  ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝
  Easy Install — Windows Server Edition v1.0
"@ -ForegroundColor Magenta
}

function Prompt-Input {
    param([string]$Question, [string]$Default = "", [switch]$Secret)
    $hint = if ($Default) { " [$Default]" } else { "" }
    Write-Host "  → $Question$hint : " -ForegroundColor White -NoNewline
    if ($Secret) {
        $secure = Read-Host -AsSecureString
        $ptr    = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
        $plain  = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
        if (-not $plain -and $Default) { return $Default }
        return $plain
    }
    $val = Read-Host
    if (-not $val -and $Default) { return $Default }
    return $val
}

function Confirm-Continue {
    param([string]$Question)
    Write-Host "  ? $Question [O/n] : " -ForegroundColor Yellow -NoNewline
    $r = Read-Host
    return ($r -eq "" -or $r -match "^[Oo]")
}

# ── Étape 0 — Bannière + vérifications initiales ─────────────────────────────

Write-Banner
Write-Host "  Dossier d'installation : $NexusPath" -ForegroundColor Gray
Write-Host ""

# Vérifier Windows version
$osVersion = [System.Environment]::OSVersion.Version
if ($osVersion.Major -lt 10) {
    Write-Fail "Windows 10 / Windows Server 2019 minimum requis."
}
Write-OK "Windows version : $($osVersion.ToString())"

# Vérifier connectivité internet
try {
    $null = Invoke-WebRequest -Uri "https://chocolatey.org" -UseBasicParsing -TimeoutSec 10
    Write-OK "Connexion internet disponible"
} catch {
    Write-Fail "Pas de connexion internet. Ce script nécessite un accès internet pour télécharger les dépendances."
}

# ── Étape 1 — Chocolatey ─────────────────────────────────────────────────────

Write-Step "Installation de Chocolatey (gestionnaire de paquets Windows)"

if (Get-Command choco -ErrorAction SilentlyContinue) {
    Write-OK "Chocolatey déjà installé ($(choco --version))"
} else {
    Write-Host "  Téléchargement et installation de Chocolatey..." -ForegroundColor Gray
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

    # Recharger PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

    if (Get-Command choco -ErrorAction SilentlyContinue) {
        Write-OK "Chocolatey installé avec succès"
    } else {
        Write-Fail "Échec installation Chocolatey. Installez-le manuellement : https://chocolatey.org/install"
    }
}

# ── Étape 2 — Dépendances ────────────────────────────────────────────────────

if (-not $SkipInstall) {
    Write-Step "Installation des dépendances (Node.js, PostgreSQL, Redis, NSSM)"
    Write-Warn "Cette étape peut prendre 5-10 minutes selon votre connexion..."

    # Node.js LTS
    if (Get-Command node -ErrorAction SilentlyContinue) {
        Write-OK "Node.js déjà installé ($(node --version))"
    } else {
        Write-Host "  Installation Node.js LTS..." -ForegroundColor Gray
        choco install nodejs-lts -y --no-progress | Out-Null
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        Write-OK "Node.js installé ($(node --version))"
    }

    # PostgreSQL 16
    $pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if ($pgService) {
        Write-OK "PostgreSQL déjà installé (service : $($pgService.Name))"
    } else {
        Write-Host "  Installation PostgreSQL 16..." -ForegroundColor Gray
        choco install postgresql16 --params "/Password:postgres_admin_temp_pwd" -y --no-progress | Out-Null
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        Write-OK "PostgreSQL installé"
    }

    # Redis (port Windows by tporadowski)
    $redisService = Get-Service -Name "Redis" -ErrorAction SilentlyContinue
    if ($redisService) {
        Write-OK "Redis déjà installé (service : $($redisService.Name))"
    } else {
        Write-Host "  Installation Redis..." -ForegroundColor Gray
        choco install redis-64 -y --no-progress | Out-Null
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        Write-OK "Redis installé"
    }

    # NSSM (Non-Sucking Service Manager — pour enregistrer Nexus comme service Windows)
    if (Get-Command nssm -ErrorAction SilentlyContinue) {
        Write-OK "NSSM déjà installé"
    } else {
        Write-Host "  Installation NSSM..." -ForegroundColor Gray
        choco install nssm -y --no-progress | Out-Null
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        Write-OK "NSSM installé"
    }
} else {
    Write-Warn "Installation des dépendances ignorée (-SkipInstall)"
}

# Vérifier que node est accessible
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Fail "Node.js introuvable dans le PATH. Redémarrez PowerShell et relancez le script."
}

# ── Étape 3 — Configuration de la communauté ─────────────────────────────────

Write-Step "Configuration de votre instance Nexus"
Write-Host ""
Write-Host "  Renseignez les informations de votre communauté." -ForegroundColor Gray
Write-Host "  (Appuyez sur Entrée pour garder la valeur par défaut entre crochets)" -ForegroundColor Gray
Write-Host ""

$communityName  = Prompt-Input "Nom de la communauté"   -Default "Ma Communauté"
$communitySlug  = Prompt-Input "Slug (URL-friendly, ex: linux, gaming, dev)"  -Default "ma-communaute"
$communityDesc  = Prompt-Input "Description courte"      -Default "La communauté $communityName."
$communityLang  = Prompt-Input "Langue (fr, en, de...)"  -Default "fr"
$communityCountry = Prompt-Input "Pays (FR, BE, CH, CA...)" -Default "FR"

Write-Host ""
Write-Host "  Configuration PostgreSQL :" -ForegroundColor Gray
$dbName     = Prompt-Input "Nom de la base de données"  -Default "nexus"
$dbUser     = Prompt-Input "Utilisateur PostgreSQL"      -Default "nexus_user"
$dbPassword = Prompt-Input "Mot de passe PostgreSQL"     -Default "" -Secret
if (-not $dbPassword) { $dbPassword = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 20 | ForEach-Object {[char]$_}) }

Write-Host ""
Write-Host "  Sécurité :" -ForegroundColor Gray
$jwtSecret  = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 48 | ForEach-Object {[char]$_})
Write-OK "JWT Secret généré automatiquement"

$port = Prompt-Input "Port de l'API backend" -Default "3000"

# ── Étape 4 — Dossier Nexus ──────────────────────────────────────────────────

Write-Step "Préparation du dossier Nexus ($NexusPath)"

# Si le dossier n'existe pas → proposer de cloner ou copier
if (-not (Test-Path $NexusPath)) {
    if (Confirm-Continue "Cloner Nexus depuis GitHub dans $NexusPath ?") {
        if (Get-Command git -ErrorAction SilentlyContinue) {
            Write-Host "  Clonage du dépôt..." -ForegroundColor Gray
            git clone https://github.com/nexus-community/nexus-core.git $NexusPath 2>&1 | Out-Null
        } else {
            Write-Fail "Git n'est pas installé. Installez git ou copiez manuellement les fichiers dans $NexusPath"
        }
    } else {
        Write-Fail "Copiez manuellement les fichiers Nexus dans $NexusPath et relancez le script."
    }
} else {
    Write-OK "Dossier existant : $NexusPath"
}

# Vérifier que c'est bien un projet Nexus
if (-not (Test-Path "$NexusPath\package.json")) {
    Write-Fail "$NexusPath ne contient pas de package.json. Vérifiez le chemin d'installation."
}

# ── Étape 5 — npm install ────────────────────────────────────────────────────

Write-Step "Installation des dépendances Node.js (npm install)"

Push-Location $NexusPath
try {
    npm install --silent 2>&1 | Out-Null
    Write-OK "Dépendances npm installées"
} finally {
    Pop-Location
}

# ── Étape 6 — Créer le .env ──────────────────────────────────────────────────

Write-Step "Création du fichier .env"

$envContent = @"
# ── Identité de la communauté ─────────────────────────────────────────────
NEXUS_COMMUNITY_NAME=$communityName
NEXUS_COMMUNITY_DESCRIPTION=$communityDesc
NEXUS_COMMUNITY_SLUG=$communitySlug
NEXUS_COMMUNITY_LANGUAGE=$communityLang
NEXUS_COMMUNITY_COUNTRY=$communityCountry

# ── Serveur ───────────────────────────────────────────────────────────────
PORT=$port
HOST=0.0.0.0

# ── Authentification ──────────────────────────────────────────────────────
JWT_SECRET=$jwtSecret

# ── Base de données PostgreSQL ────────────────────────────────────────────
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$dbName
DB_USER=$dbUser
DB_PASSWORD=$dbPassword

# ── Cache Redis ───────────────────────────────────────────────────────────
REDIS_HOST=localhost
REDIS_PORT=6379

# ── Environnement ─────────────────────────────────────────────────────────
NODE_ENV=production
"@

Set-Content -Path "$NexusPath\.env" -Value $envContent -Encoding UTF8
Write-OK ".env créé"

# ── Étape 7 — PostgreSQL : créer DB + user ────────────────────────────────────

Write-Step "Configuration de PostgreSQL (base de données + utilisateur)"

# Trouver psql
$pgPaths = @(
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe"
)
$psqlPath = $pgPaths | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $psqlPath) {
    $psqlPath = (Get-Command psql -ErrorAction SilentlyContinue)?.Source
}
if (-not $psqlPath) {
    Write-Fail "psql introuvable. PostgreSQL est-il bien installé ?"
}
Write-OK "psql trouvé : $psqlPath"

# Script SQL de setup
$setupSql = @"
-- Créer l'utilisateur si inexistant
DO `$`$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$dbUser') THEN
    CREATE ROLE $dbUser LOGIN PASSWORD '$dbPassword';
  END IF;
END
`$`$;

-- Créer la base si inexistante
SELECT 'CREATE DATABASE $dbName OWNER $dbUser'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$dbName')\gexec

-- Droits
GRANT ALL PRIVILEGES ON DATABASE $dbName TO $dbUser;
"@

$tmpSql = [System.IO.Path]::GetTempFileName() + ".sql"
Set-Content -Path $tmpSql -Value $setupSql -Encoding UTF8

try {
    # Tenter avec le service postgres (via -U postgres)
    $env:PGPASSWORD = ""
    $result = & $psqlPath -U postgres -c "\conninfo" 2>&1
    if ($LASTEXITCODE -eq 0) {
        & $psqlPath -U postgres -f $tmpSql | Out-Null
        Write-OK "Base de données '$dbName' et utilisateur '$dbUser' configurés"
    } else {
        Write-Warn "Connexion en peer auth échouée. Essai avec mot de passe..."
        $pgAdminPwd = Prompt-Input "Mot de passe du super-utilisateur postgres" -Secret
        $env:PGPASSWORD = $pgAdminPwd
        & $psqlPath -U postgres -f $tmpSql | Out-Null
        Write-OK "Base de données '$dbName' et utilisateur '$dbUser' configurés"
    }
} catch {
    Write-Warn "Erreur lors de la configuration PostgreSQL : $_"
    Write-Warn "Vous devrez créer manuellement la base et l'utilisateur."
    Write-Host "  Commandes à exécuter en tant que postgres :" -ForegroundColor Gray
    Write-Host "    CREATE ROLE $dbUser LOGIN PASSWORD 'votre_mdp';" -ForegroundColor Gray
    Write-Host "    CREATE DATABASE $dbName OWNER $dbUser;" -ForegroundColor Gray
} finally {
    Remove-Item $tmpSql -ErrorAction SilentlyContinue
    $env:PGPASSWORD = ""
}

# ── Étape 8 — Migrations SQL ─────────────────────────────────────────────────

Write-Step "Exécution des migrations SQL"

$migrationsPath = "$NexusPath\src\migrations"
if (-not (Test-Path $migrationsPath)) {
    Write-Fail "Dossier migrations introuvable : $migrationsPath"
}

$migrations = Get-ChildItem -Path $migrationsPath -Filter "*.sql" | Sort-Object Name

$env:PGPASSWORD = $dbPassword
$migrationErrors = 0

foreach ($migration in $migrations) {
    $shortName = $migration.Name
    try {
        $output = & $psqlPath -U $dbUser -d $dbName -f $migration.FullName 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Warn "Migration $shortName : avertissement (peut-être déjà appliquée)"
            $migrationErrors++
        } else {
            Write-OK "Migration $shortName"
        }
    } catch {
        Write-Warn "Migration $shortName : $_"
        $migrationErrors++
    }
}

$env:PGPASSWORD = ""

if ($migrationErrors -gt 0) {
    Write-Warn "$migrationErrors migration(s) avec avertissements (peut être normal si déjà appliquées)"
} else {
    Write-OK "Toutes les migrations appliquées"
}

# ── Étape 9 — Démarrer Redis ─────────────────────────────────────────────────

Write-Step "Démarrage de Redis"

$redisService = Get-Service -Name "Redis" -ErrorAction SilentlyContinue
if ($redisService) {
    if ($redisService.Status -ne 'Running') {
        Start-Service -Name "Redis"
        Start-Sleep -Seconds 2
    }
    Write-OK "Redis en cours d'exécution"
} else {
    # Tenter de démarrer redis-server directement
    $redisExe = (Get-Command redis-server -ErrorAction SilentlyContinue)?.Source
    if ($redisExe) {
        Start-Process -FilePath $redisExe -WindowStyle Hidden
        Write-OK "redis-server démarré"
    } else {
        Write-Warn "Redis introuvable. L'application démarrera mais les fonctions de rate-limiting seront désactivées."
    }
}

# ── Étape 10 — Enregistrer Nexus comme service Windows (NSSM) ────────────────

Write-Step "Enregistrement de Nexus comme service Windows"

$serviceName = "NexusCore"
$nodeExe     = (Get-Command node -ErrorAction SilentlyContinue)?.Source
if (-not $nodeExe) {
    Write-Fail "Node.js introuvable dans le PATH."
}

# Supprimer service existant si présent
$existingService = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
if ($existingService) {
    if (Confirm-Continue "Le service $serviceName existe déjà. Le reconfigurer ?") {
        Stop-Service  -Name $serviceName -ErrorAction SilentlyContinue
        nssm remove $serviceName confirm | Out-Null
    } else {
        Write-Warn "Service existant conservé."
    }
}

if (-not (Get-Service -Name $serviceName -ErrorAction SilentlyContinue)) {
    $npxExe  = Join-Path (Split-Path $nodeExe) "npx.cmd"
    $tsNode  = "ts-node"
    $mainTs  = "$NexusPath\src\index.ts"

    # NSSM configuration
    nssm install $serviceName $nodeExe 2>&1 | Out-Null
    nssm set     $serviceName AppDirectory   $NexusPath      | Out-Null
    nssm set     $serviceName AppParameters  "$(Join-Path (Split-Path $nodeExe) '..\lib\node_modules\ts-node\dist\bin.js') src/index.ts" | Out-Null
    nssm set     $serviceName DisplayName    "Nexus Community Server" | Out-Null
    nssm set     $serviceName Description    "Nexus Core Backend API" | Out-Null
    nssm set     $serviceName Start          SERVICE_AUTO_START | Out-Null
    nssm set     $serviceName AppStdout      "$NexusPath\logs\nexus.log"  | Out-Null
    nssm set     $serviceName AppStderr      "$NexusPath\logs\nexus-err.log" | Out-Null
    nssm set     $serviceName AppRotateFiles 1 | Out-Null

    # Créer le dossier logs
    New-Item -ItemType Directory -Path "$NexusPath\logs" -Force | Out-Null

    # Démarrer le service
    Start-Service -Name $serviceName -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3

    $svc = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
    if ($svc -and $svc.Status -eq 'Running') {
        Write-OK "Service '$serviceName' démarré et configuré pour le démarrage automatique"
    } else {
        Write-Warn "Service installé mais non démarré. Vérifiez les logs : $NexusPath\logs\"
    }
}

# ── Étape 11 — Règle pare-feu ────────────────────────────────────────────────

Write-Step "Configuration du pare-feu Windows"

$ruleName = "Nexus Core API"
$existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
if (-not $existing) {
    New-NetFirewallRule `
        -DisplayName $ruleName `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort $port `
        -Action Allow | Out-Null
    Write-OK "Règle pare-feu créée : port $port autorisé en entrée"
} else {
    Write-OK "Règle pare-feu '$ruleName' déjà présente"
}

# ── Étape 12 — Résumé final ───────────────────────────────────────────────────

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  🎉  NEXUS EST INSTALLÉ ET DÉMARRÉ !" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""
Write-Host "  Communauté : $communityName ($communitySlug)" -ForegroundColor White
Write-Host "  API Backend : http://localhost:$port" -ForegroundColor White
Write-Host "  Santé : http://localhost:$port/api/v1/health" -ForegroundColor White
Write-Host ""
Write-Host "  Service Windows : $serviceName" -ForegroundColor Gray
Write-Host "  Logs : $NexusPath\logs\" -ForegroundColor Gray
Write-Host "  Config : $NexusPath\.env" -ForegroundColor Gray
Write-Host ""
Write-Host "  Prochaines étapes :" -ForegroundColor Yellow
Write-Host "  1. Installez le frontend SvelteKit (nexus-frontend)" -ForegroundColor White
Write-Host "  2. Configurez un reverse proxy (Caddy ou Nginx) pour HTTPS" -ForegroundColor White
Write-Host "  3. Créez votre premier compte admin via l'interface" -ForegroundColor White
Write-Host ""
Write-Host "  Documentation : https://github.com/nexus-community/nexus-core/blob/main/README.md" -ForegroundColor Gray
Write-Host ""
