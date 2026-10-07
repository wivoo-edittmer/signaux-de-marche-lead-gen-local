# B2Bmax - Backend API INSEE

Backend FastAPI pour l'application B2Bmax - Agent Conversationnel de Prospection INSEE.

## 📌 À propos

Ce projet contient le backend API pour B2Bmax, une application qui permet aux professionnels de :
- Rechercher les entreprises d'un secteur sur une zone géographique
- Recevoir des synthèses avec chiffres clés tirés des données INSEE
- Créer des agents de prospection automatisés

**⚠️ MVP1**: Utilise uniquement les **données locales** (`extract_10000.csv`) - pas d'appel à l'API INSEE.

---

## 🏗️ Structure du Projet

```
insee-api/
├── main.py              # Backend principal (existants - à migrer vers MVP1)
├── main_mvp1.py         # Backend MVP1 (nouveau, optimisé pour extract_10000.csv)
├── data/
│   ├── data_loader.py   # Chargement des données INSEE (existants)
│   └── ...             # Autres modules existants
├── sql/
│   └── schema_mvp1.sql  # Schéma SQL pour MVP1
├── scripts/
│   ├── data_loader.py   # Script de chargement des données dans Supabase
│   └── README.md        # Instructions détaillées
├── .env.example         # Template de configuration
├── requirements.txt     # Dépendances Python
└── README.md           # Ce fichier
```

---

## ⚡ Démarrage Rapide (MVP1)

### 1️⃣ Prérequis

- **Python 3.8+**
- **Supabase** (Free Tier suffit)
- **Git** (optionnel)

### 2️⃣ Configuration

#### Cloner le projet (si ce n'est pas déjà fait)
```bash
git clone <url-du-depot>
cd insee-api
```

#### Installer les dépendances
```bash
pip install -r requirements.txt
```

#### Configurer Supabase

1. Créer un projet sur [Supabase](https://supabase.com/)
2. Récupérer vos informations :
   - **URL du projet** (ex: `https://votre-projet.supabase.co`)
   - **Service Key** (dans Settings > API)
3. Configurer le fichier `.env` :
```bash
cp .env.example .env
# Éditer .env avec vos informations
```

#### Charger les données dans Supabase

1. **Exécuter le schéma SQL** :
   - Allez dans [Supabase SQL Editor](https://app.supabase.com/project/votre-projet/sql)
   - Copiez le contenu de `sql/schema_mvp1.sql`
   - Exécutez le script

2. **Charger les données** :
```bash
python scripts/data_loader.py
```

Ce script charge :
- ~10 000 unités légales (entreprises)
- ~10 000 établissements (sites physiques)
- ~9 secteurs NAF
- ~15 zones géographiques

**Temps estimé** : < 1 minute

### 3️⃣ Démarrer le backend

```bash
# Option 1: Backend MVP1 (recommandé pour le test)
uvicorn main_mvp1:app --reload --port 8000

# Option 2: Backend existant (si vous préférez)
uvicorn main:app --reload --port 8000
```

Le serveur sera accessible à : `http://localhost:8000`

### 4️⃣ Tester l'API

#### Vérification de santé
```bash
curl http://localhost:8000/health
```

#### Liste des secteurs
```bash
curl http://localhost:8000/sectors
```

#### Liste des zones
```bash
curl http://localhost:8000/zones
```

#### Recherche d'entreprises
```bash
curl -X POST http://localhost:8000/chat/messages \
  -H "Content-Type: application/json" \
  -d '{"message": "Quelles sont les PME en Bretagne dans le secteur du numérique ?"}'
```

Exemple de réponse :
```json
{
  "id": "...",
  "message": "J'ai trouvé **15 entreprises** dans le secteur **numérique** en **Bretagne**...",
  "role": "assistant",
  "sector": "numérique",
  "zone": "Bretagne",
  "category": "PME",
  "total_companies": 15,
  "creations": 3,
  "radiations": 1,
  "net_change": 2,
  "insight": "J'ai trouvé **15 entreprises** dans le secteur **numérique** en **Bretagne**...",
  "actions": [
    "Recevoir un rapport hebdomadaire sur ces données",
    "Créer un agent de prospection pour contacter ces entreprises",
    "Suivre la création de nouvelles entreprises"
  ]
}
```

---

## 📊 Données Utilisées

### Fichiers Source (dans `/data/`)

| Fichier | Taille | Lignes | Description |
|--------|-------|-------|-------------|
| `StockUniteLegale_extract_10000.csv` | 1.3 MB | 10 000 | Unités légales (entreprises) |
| `StockEtablissement_extract_10000.csv` | 1.9 MB | 10 000 | Établissements (sites physiques) |
| `sectors.json` | 2 KB | 9 | Secteurs NAF de référence |
| `zones.json` | 1.5 KB | 15 | Zones géographiques |

### Schéma de la Base de Données

#### Tables Principales

- **`sector`** : Secteurs d'activité (code NAF)
- **`zone`** : Zones géographiques (région, département, commune)
- **`legal_unit`** : Unités légales (entreprises)
- **`establishment`** : Établissements (sites physiques)

#### Vues Utiles

- **`company_stats`** : Statistiques par secteur et zone
- **`companies_with_geo`** : Entreprises avec informations géographiques
- **`searchable_companies`** : Vue optimisée pour les recherches

---

## 🎯 Cas d'Usage MVP1

### Exemple 1: Recherche basique

**Requête utilisateur** :
```
Quelles sont les PME en Bretagne dans le secteur du numérique ?
```

**Réponse attendue** :
```json
{
  "sector": "numérique",
  "zone": "Bretagne",
  "category": "PME",
  "total_companies": 25,
  "creations": 5,
  "radiations": 2,
  "net_change": 3,
  "trend": "en croissance",
  "insight": "J'ai trouvé **25 PME** dans le secteur **numérique** en **Bretagne**...",
  "actions": [...]
}
```

### Exemple 2: Recherche par département

**Requête utilisateur** :
```
Quelles sont les entreprises dans le Finistère ?
```

### Exemple 3: Recherche par secteur

**Requête utilisateur** :
```
Quelles sont les entreprises dans le secteur de la restauration ?
```

---

## 🚀 Déploiement

### Déploiement local (développement)

```bash
# Backend
uvicorn main_mvp1:app --reload --port 8000

# Frontend (si implémenté)
cd ../frontend
npm run dev
```

### Déploiement en production

#### Backend (Railway, Render, etc.)

1. Configurer les variables d'environnement
2. Déployer avec Docker ou directement

#### Frontend (Vercel)

1. Lier le projet Vercel au dépôt
2. Configurer les variables d'environnement

---

## 📚 Documentation

- [Spécification technique](../specs/001-b2bmax-chat-insee/spec.md)
- [Plan d'implémentation](../specs/001-b2bmax-chat-insee/plan.md)
- [Modèle de données](../specs/001-b2bmax-chat-insee/data-model.md)
- [Quickstart](../specs/001-b2bmax-chat-insee/quickstart.md)
- [Tasks MVP1](../specs/001-b2bmax-chat-insee/tasks.md)
- [Script de chargement des données](scripts/README.md)

---

## 🛠️ Développement

### Structure du code

#### Backend (FastAPI)

```python
# main_mvp1.py
from fastapi import FastAPI
from supabase import create_client

app = FastAPI()
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.get("/sectors")
async def get_sectors():
    result = supabase.table("sector").select("*").execute()
    return result.data
```

### Ajouter un nouvel endpoint

1. Créer un nouveau fichier dans `api/` ou ajouter à `main_mvp1.py`
2. Définir le modèle Pydantic
3. Implémenter la logique
4. Documenter avec des docstrings

---

## 🤝 Contribution

1. Forker le dépôt
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commiter vos changements (`git commit -m 'Ajout de la nouvelle fonctionnalité'`)
4. Pousser vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

---

## 📜 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

---

## 💬 Support

Pour toute question, ouvrir une issue dans le dépôt ou contacter l'équipe.

---

## 🔄 Historique

| Date | Version | Changements |
|------|---------|------------|
| 2026-10-07 | 1.0 | Création du backend MVP1 avec extract_10000.csv |
