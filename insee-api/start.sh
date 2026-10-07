#!/bin/bash

# Script de démarrage pour B2Bmax MVP1

echo "=========================================="
echo "  B2Bmax MVP1 - Démarrage"
echo "=========================================="
echo ""

# Vérifier Python
if ! command -v python3 &> /dev/null; then
    echo "Erreur: Python 3 n'est pas installé"
    exit 1
fi

# Créer l'environnement virtuel s'il n'existe pas
if [ ! -d "venv" ]; then
    echo "Création de l'environnement virtuel..."
    python3 -m venv venv
fi

# Activer l'environnement virtuel
source venv/bin/activate

# Installer les dépendances
if [ ! -f "requirements.txt" ]; then
    echo "Erreur: requirements.txt non trouvé"
    exit 1
fi

echo "Installation des dépendances..."
pip install -q -r requirements.txt

# Démarrer le serveur
echo ""
echo "=========================================="
echo "  Démarrage du serveur FastAPI"
echo "=========================================="
echo ""
echo "API disponible à: http://localhost:8000"
echo "Documentation:   http://localhost:8000/api/docs"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter"
echo ""

# Démarrer uvicorn
uvicorn main:app --reload --port 8000

# Désactiver l'environnement virtuel à la sortie
deactivate