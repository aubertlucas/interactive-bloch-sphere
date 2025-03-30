@echo off
echo ===== Démarrage du projet Bloch Sphere Visualization =====
echo.

:: Configuration de la couleur du terminal
color 0A

:: Vérifier si Node.js est installé
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Erreur: Node.js n'est pas installé ou n'est pas dans le PATH
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

:: Positionnement dans le répertoire du projet
cd /d "%~dp0"
echo Répertoire du projet: %CD%
echo.

:: Installation des dépendances si nécessaire
if not exist node_modules (
    echo Les modules Node.js ne sont pas installés. Installation en cours...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo Erreur lors de l'installation des dépendances
        pause
        exit /b 1
    )
    echo Installation terminée avec succès!
    echo.
)

:: Partie à décommenter lorsqu'un backend sera ajouté
:: echo Démarrage du backend...
:: start cmd /k "cd backend && npm install && npm start"
:: echo Backend démarré dans une nouvelle fenêtre
:: echo.
:: timeout /t 5 /nobreak >nul

:: Démarrage du frontend
echo Démarrage du frontend React...
echo.
echo L'application sera accessible à l'adresse: http://localhost:3000
echo Appuyez sur Ctrl+C pour arrêter le serveur
echo.

:: Démarrage du frontend
npm start

echo.
echo ===== Arrêt du projet =====
pause
