# 🚀 Démarrage Rapide MVP1 - B2Bmax

**Dernière mise à jour**: 2026-10-07  
**Statut**: Prêt à démarrer  
**Objectif**: Avoir un backend fonctionnel avec les données locales en < 30 minutes

---

## ✅ Ce qui a été fait

### 1. **Modèle de données mis à jour** ✅
- [x] Remplacement de `Company` par `legal_unit` + `establishment` (séparation INSEE)
- [x] Ajout des champs de géolocalisation (`commune_code`, `postal_code`, `lambert_x/y`)
- [x] Adaptation pour les fichiers **`extract_10000.csv`** (10K lignes, ~3.2MB)
- [x] Création des tables de référence (`sector`, `zone`, `commune_to_zone`)
- [x] Ajout de vues SQL pour les requêtes (`company_stats`, `companies_with_geo`, `searchable_companies`)
- [x] Documentation complète dans `specs/001-b2bmax-chat-insee/data-model.md`

### 2. **Infrastructure de données** ✅
- [x] **`insee-api/sql/schema_mvp1.sql`** - Schéma SQL complet pour Supabase
- [x] **`insee-api/scripts/data_loader.py`** - Script de chargement des données
- [x] **`insee-api/scripts/README.md`** - Instructions détaillées
- [x] **Fichiers de données** : `StockUniteLegale_extract_10000.csv`, `StockEtablissement_extract_10000.csv`
- [x] **Fichiers de référence** : `sectors.json`, `zones.json`

### 3. **Backend FastAPI** ✅
- [x] **`insee-api/main_mvp1.py`** - Backend optimisé pour MVP1
- [x] Endpoints principaux :
  - `GET /health` - Vérification du service
  - `GET /sectors` - Liste des secteurs NAF
  - `GET /zones` - Liste des zones géographiques
  - `POST /chat/messages` - Traitement des messages chat
  - `POST /search` - Recherche d'entreprises
- [x] Extraction d'entités basique (secteur, zone, catégorie)
- [x] Génération de synthèses (mock pour MVP1)

### 4. **Documentation** ✅
- [x] **`insee-api/README.md`** - Guide complet du backend
- [x] **`specs/001-b2bmax-chat-insee/tasks.md`** - Suivi des tâches
- [x] **`specs/001-b2bmax-chat-insee/plan.md`** - Plan mis à jour
- [x] **`.env.example`** - Template de configuration

---

## 🎯 Ce qui reste à faire (pour démarrer)

### **Tâches immédiates (10-15 min)**

#### 1️⃣ **Configurer Supabase** (5 min)
```bash
# 1. Créer un projet sur https://supabase.com/ (Free Tier suffit)
# 2. Noter votre URL et Service Key
```

#### 2️⃣ **Exécuter le schéma SQL** (2 min)
```bash
# Dans Supabase SQL Editor:
# 1. Ouvrir https://app.supabase.com/project/votre-projet/sql
# 2. Copier le contenu de insee-api/sql/schema_mvp1.sql
# 3. Exécuter
```

#### 3️⃣ **Charger les données** (5 min)
```bash
# 1. Aller dans insee-api/
cd insee-api

# 2. Configurer .env
cp .env.example .env
# Éditer .env avec SUPABASE_URL et SUPABASE_SERVICE_KEY

# 3. Installer les dépendances
pip install -r requirements.txt

# 4. Exécuter le script de chargement
python scripts/data_loader.py
```

#### 4️⃣ **Démarrer le backend** (2 min)
```bash
# Dans insee-api/
uvicorn main_mvp1:app --reload --port 8000
```

---

## 🧪 Tests de validation

### Test 1: Vérification du chargement
```bash
# Dans Supabase SQL Editor
SELECT COUNT(*) FROM legal_unit;  -- Doit retourner ~10000
SELECT COUNT(*) FROM establishment;  -- Doit retourner ~10000
```

### Test 2: Vérification de santé
```bash
curl http://localhost:8000/health
# Doit retourner: {"status": "healthy", ...}
```

### Test 3: Liste des secteurs
```bash
curl http://localhost:8000/sectors
# Doit retourner la liste des secteurs NAF
```

### Test 4: Recherche basique
```bash
curl -X POST http://localhost:8000/chat/messages \
  -H "Content-Type: application/json" \
  -d '{"message": "Quelles sont les PME en Bretagne dans le secteur du numérique ?"}'

# Doit retourner une réponse avec:
# - sector: "numérique"
# - zone: "Bretagne" 
# - category: "PME"
# - total_companies: [nombre]
# - insight: [synthèse textuelle]
# - actions: [3 actions]
```

---

## 📊 Structure des fichiers

```
.
├── data/
│   ├── StockUniteLegale_extract_10000.csv    # 10K entreprises
│   ├── StockEtablissement_extract_10000.csv # 10K établissements
│   ├── sectors.json                           # Référence secteurs
│   └── zones.json                             # Référence zones
│
├── insee-api/
│   ├── main.py                              # Backend existant
│   ├── main_mvp1.py                         # Backend MVP1 (NOUVEAU)
│   ├── data/                                # Modules existants
│   │   └── data_loader.py                  # Chargement local
│   ├── sql/
│   │   └── schema_mvp1.sql                 # Schéma SQL (NOUVEAU)
│   ├── scripts/
│   │   ├── data_loader.py                  # Chargement Supabase (NOUVEAU)
│   │   └── README.md                       # Instructions (NOUVEAU)
│   ├── .env.example                        # Configuration (NOUVEAU)
│   ├── requirements.txt                     # Dépendances (mis à jour)
│   └── README.md                           # Documentation (NOUVEAU)
│
└── specs/
    └── 001-b2bmax-chat-insee/
        ├── data-model.md                   # Modèle de données (MIS À JOUR)
        ├── plan.md                         # Plan (MIS À JOUR)
        ├── tasks.md                        # Tasks MVP1 (NOUVEAU)
        └── ...
```

---

## 🎯 Roadmap MVP1

### **Étape 1: Configuration ✅ 60%**
- [x] Modèle de données mis à jour
- [x] Schéma SQL créé
- [x] Script de chargement créé
- [x] Backend MVP1 créé
- [ ] Supabase configuré (À FAIRE)
- [ ] Données chargées (À FAIRE)

### **Étape 2: Backend ✅ 80%**
- [x] Endpoints de base créés
- [x] Extraction d'entités implémentée
- [x] Génération de synthèses implémentée
- [ ] Tests backend (À FAIRE)

### **Étape 3: Validation ✅ 0%**
- [ ] Test avec les cas d'usage
- [ ] Validation des résultats
- [ ] Documentation utilisateur

---

## 📚 Documentation Complète

| Document | Description | Lien |
|----------|-------------|------|
| Modèle de données | Structure complète de la base | `specs/001-b2bmax-chat-insee/data-model.md` |
| Plan d'implémentation | Roadmap complète du projet | `specs/001-b2bmax-chat-insee/plan.md` |
| Tasks MVP1 | Suivi des tâches | `specs/001-b2bmax-chat-insee/tasks.md` |
| Script de chargement | Instructions pour charger les données | `insee-api/scripts/README.md` |
| Backend README | Guide du backend | `insee-api/README.md` |

---

## 💡 Conseils

### Pour aller plus vite
1. **Utilisez les extract_10000.csv** - Ils sont petits et rapides à charger
2. **Commencez par le backend** - Le frontend peut attendre
3. **Testez avec curl** - Pas besoin de frontend pour valider le backend

### Si vous avez des problèmes
1. **Vérifiez le .env** - La Service Key est obligatoire
2. **Vérifiez les tables** - Exécutez `SELECT * FROM legal_unit LIMIT 5;` dans Supabase
3. **Vérifiez les logs** - Le script data_loader.py affiche la progression

### Pour aller plus loin (après MVP1)
1. **Intégrer Mistral AI** pour une meilleure extraction d'entités
2. **Ajouter le frontend Next.js** pour une meilleure UX
3. **Implémenter les agents de prospection** (MVP2)

---

## 🎉 Vous êtes prêt !

Suivez les **4 étapes** ci-dessus et vous aurez un backend MVP1 fonctionnel en **< 30 minutes**.

```bash
# Résumé des commandes:
cd insee-api
cp .env.example .env
# Éditer .env
pip install -r requirements.txt
python scripts/data_loader.py  # Charger les données
uvicorn main_mvp1:app --reload --port 8000  # Démarrer le backend
```

---

**Prochaine étape**: [Configurer Supabase et charger les données](#-ce-qui-reste-à-faire-pour-démarrer) ⬆️
