@echo off
setlocal enabledelayedexpansion

echo ====================================================
echo     Installation et démarrage de Quantique
echo     Simulateur de sphère de Bloch pour la physique quantique
echo ====================================================
echo.

:: Vérifier les privilèges d'administrateur
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Ce script nécessite des privilèges administrateur.
    echo Veuillez l'exécuter en tant qu'administrateur.
    echo Clic droit sur le fichier -^> Exécuter en tant qu'administrateur
    pause
    exit /b 1
)

:: Définir les variables
set "NODEJS_URL=https://nodejs.org/dist/v18.17.1/node-v18.17.1-x64.msi"
set "NODEJS_MSI=%TEMP%\node-install.msi"
set "PROJECT_DIR=%~dp0"
set "BACKUP_NODEJS_URL=https://nodejs.org/dist/v16.20.2/node-v16.20.2-x64.msi"
set "MIN_NODE_VERSION=14.0.0"

echo [1/5] Vérification de l'installation de Node.js...

:: Vérifier si Node.js est déjà installé
where node >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo Node.js est déjà installé: !NODE_VERSION!
    
    :: Vérifier si la version de Node.js est suffisante
    echo Vérification de la compatibilité de la version...
    node -e "process.exit(require('semver').lt(process.version.slice(1), '%MIN_NODE_VERSION%') ? 1 : 0)" >nul 2>&1
    
    if !errorLevel! neq 0 (
        echo La version actuelle de Node.js est trop ancienne. Installation d'une version plus récente...
        goto install_nodejs
    ) else (
        echo La version de Node.js est compatible.
        goto check_npm
    )
) else (
    echo Node.js n'est pas installé. Installation en cours...
    goto install_nodejs
)

:install_nodejs
echo [2/5] Téléchargement de Node.js...

:: Créer un dossier temporaire pour l'installation
if not exist "%TEMP%\quantique_setup" mkdir "%TEMP%\quantique_setup"

:: Télécharger Node.js avec PowerShell
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%NODEJS_URL%' -OutFile '%NODEJS_MSI%'; exit $LastExitCode}"

if %errorLevel% neq 0 (
    echo Le téléchargement de Node.js a échoué. Tentative avec l'URL de secours...
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%BACKUP_NODEJS_URL%' -OutFile '%NODEJS_MSI%'; exit $LastExitCode}"
    
    if %errorLevel% neq 0 (
        echo Le téléchargement de Node.js a échoué même avec l'URL de secours.
        echo Veuillez télécharger et installer Node.js manuellement depuis https://nodejs.org/
        pause
        exit /b 1
    )
)

echo [3/5] Installation de Node.js...
:: Installer Node.js silencieusement
msiexec /i "%NODEJS_MSI%" /qn /norestart

if %errorLevel% neq 0 (
    echo L'installation de Node.js a échoué avec le code %errorLevel%.
    echo Veuillez installer Node.js manuellement depuis https://nodejs.org/
    pause
    exit /b 1
)

echo Installation de Node.js terminée avec succès.
:: Supprimer le fichier d'installation
del "%NODEJS_MSI%" >nul 2>&1

:: Rafraîchir le PATH pour inclure Node.js
call :refresh_path

:check_npm
echo [4/5] Vérification de l'installation de npm...

:: Vérifier si npm est installé
where npm >nul 2>&1
if %errorLevel% neq 0 (
    echo npm n'a pas été trouvé après l'installation de Node.js.
    echo Veuillez installer npm manuellement.
    pause
    exit /b 1
)

echo [5/5] Installation des dépendances du projet...
cd /d "%PROJECT_DIR%"

:: Installer les dépendances
call npm install

if %errorLevel% neq 0 (
    echo L'installation des dépendances a échoué.
    echo Tentative de réparation...
    
    :: Tentative de nettoyage et réinstallation
    if exist node_modules (
        echo Suppression du dossier node_modules...
        rmdir /s /q node_modules
    )
    
    if exist package-lock.json (
        echo Suppression de package-lock.json...
        del package-lock.json
    )
    
    echo Réinstallation des dépendances avec l'option --force...
    call npm install --force
    
    if %errorLevel% neq 0 (
        echo La réinstallation des dépendances a échoué.
        echo Veuillez exécuter 'npm install' manuellement.
        pause
        exit /b 1
    )
)

echo.
echo ====================================================
echo     Installation terminée avec succès !
echo ====================================================
echo.

:: Démarrer l'application
echo Démarrage de l'application Quantique...
start cmd /k "cd /d "%PROJECT_DIR%" && npm start"

echo Ouverture du navigateur dans 10 secondes...
timeout /t 10 /nobreak >nul

:: Ouvrir le navigateur
start http://localhost:3000

echo.
echo Si le navigateur ne s'ouvre pas automatiquement, veuillez
echo ouvrir un navigateur et accéder à : http://localhost:3000
echo.
echo Pour arrêter l'application, fermez la fenêtre de commandes ouverte par ce script.
echo.

pause
exit /b 0

:: Fonction pour rafraîchir le PATH
:refresh_path
for /f "tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH') do set "system_path=%%b"
set "PATH=%system_path%;%PATH%"
exit /b 0
