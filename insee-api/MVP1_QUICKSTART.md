# MVP1 B2Bmax - Guide de Démarrage Rapide

Ce guide vous permet de démarrer rapidement avec le MVP1 B2Bmax.

## 🚀 Installation

### 1. Cloner ou naviguer vers le projet

```bash
cd /Users/mathurinbody/Documents/workspaces/wivooxmistral/insee-api
```

### 2. Créer un environnement virtuel (recommandé)

```bash
# Linux/Mac
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

### 3. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 4. Configurer les variables d'environnement

Copiez le fichier `.env.example` en `.env` et ajustez si nécessaire :

```bash
cp .env.example .env
```

> **Note**: Pour le MVP1, la base de données Supabase est déjà configurée avec les bonnes informations.

### 5. Démarrer le serveur

```bash
uvicorn main:app --reload --port 8000
```

Le serveur sera disponible à : `http://localhost:8000`

La documentation de l'API (Swagger) sera disponible à : `http://localhost:8000/api/docs`

---

## 🧪 Tester l'API

### Test 1: Vérifier la santé de l'API

```bash
curl http://localhost:8000/v1/health
```

Réponse attendue :
```json
{
  "status": "healthy",
  "timestamp": "2026-10-07T12:00:00.000000",
  "version": "1.0.0",
  "database": {"status": "healthy", "connection": "ok"}
}
```

### Test 2: Lister les secteurs disponibles

```bash
curl http://localhost:8000/v1/sectors
```

### Test 3: Lister les zones disponibles

```bash
curl http://localhost:8000/v1/zones
```

### Test 4: Poser une question dans le chat

```bash
curl -X POST http://localhost:8000/v1/chat/messages \
  -H "Content-Type: application/json" \
  -d '{"message": "Quelles sont les PME en Bretagne dans le secteur du numérique ?"}'
```

Réponse attendue :
```json
{
  "message": "secteur **Information et communication** zone **Bretagne** j'ai trouvé **X** entreprises correspondantes avec **Y** créations estimées et un changement net de **+Z** (tendance : growth)...",
  "entities": {
    "query": "Quelles sont les PME en Bretagne dans le secteur du numérique ?",
    "sector": {"id": "J", "name": "Information et communication", "naf_code": "J"},
    "zone": {"id": "BRE", "name": "Bretagne", "code": "BRE", "level": "region"},
    "period": "12 derniers mois",
    "confidence": 0.95
  },
  "query_result": {
    "query": "Quelles sont les PME en Bretagne dans le secteur du numérique ?",
    "sector": {...},
    "zone": {...},
    "total_companies": X,
    "creations": Y,
    "radiations": Z,
    "net_change": W,
    "trend": "growth",
    "companies": [...],
    "next_actions": [...]
  },
  "next_actions": [...],
  "session_id": "uuid..."
}
```

### Test 5: Effectuer une recherche directe

```bash
curl -X POST http://localhost:8000/v1/searches \
  -H "Content-Type: application/json" \
  -d '{"sector_id": "56", "zone_id": "69", "limit": 10}'
```

---

## 📊 Cas d'Usage Validés

Le MVP1 supporte les requêtes suivantes :

| Requête | Résultat attendu |
|---------|------------------|
| "Quelles sont les PME en Bretagne dans le secteur du numérique ?" | Statistiques sur les entreprises du numérique en Bretagne |
| "Quelles sont les entreprises de restauration à Lyon ?" | Statistiques sur la restauration dans le Rhône |
| "PME du numérique en France" | Statistiques nationales sur le secteur |
| "Comment va le marché ?" | Demande de clarification |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MVP1 B2Bmax                                │
├─────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────────┐                      │
│  │   Client     │◄───►  Backend API     │                      │
│  │   (Web/CLI)  │    │   (FastAPI)      │                      │
│  └─────────────┘    └────────┬────────┘                      │
│                                  │                             │
│                                  ▼                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Supabase PostgreSQL                   │   │
│  │  ┌─────────┐ ┌────────┐ ┌──────────────┐              │   │
│  │  │ sectors │ │ zones  │ │  companies   │              │   │
│  │  └─────────┘ └────────┘ └──────────────┘              │   │
│  │  ┌────────────────┐                                    │   │
│  │  │ establishments   │                                    │   │
│  │  └────────────────┘                                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/v1/health` | Vérification de santé |
| GET | `/v1/sectors` | Lister tous les secteurs |
| GET | `/v1/zones` | Lister toutes les zones |
| GET | `/v1/sectors/{id}` | Obtenir un secteur spécifique |
| GET | `/v1/zones/{id}` | Obtenir une zone spécifique |
| POST | `/v1/chat/messages` | Envoyer un message dans le chat |
| POST | `/v1/searches` | Effectuer une recherche avancée |
| GET | `/v1/searches/{id}` | Obtenir une recherche (mock) |
| POST | `/v1/extract-entities` | Extraire les entités d'une requête |

---

## 📚 Données de Référence

### Secteurs NAF Disponibles
- **56** - Restauration
  - 56.10A - Restauration traditionnelle
  - 56.10B - Restauration rapide
- **J** - Information et communication
  - 62 - Programmation et conseil informatique
    - 62.01Z - Programmation informatique
  - 63 - Services d'information
    - 63.11Z - Traitement de données, hébergement
- **G** - Commerce
  - 47 - Commerce de détail

### Zones Géographiques Disponibles
- **BRE** - Bretagne (région)
  - 29 - Finistère
  - 35 - Ille-et-Vilaine
  - 22 - Côtes-d'Armor
  - 56 - Morbihan
- **69** - Rhône (département)
  - 69001 - Lyon 1er
  - 69002 - Lyon 2ème
- **IDF** - Île-de-France (région)
  - 75 - Paris
    - 75001 - Paris 1er

---

## ⚡ Performances Attendues

| Métrique | Cible | Mesure |
|----------|-------|--------|
| Temps de réponse API | < 2s | Backend + Supabase |
| Temps de chargement données | < 5s | Au démarrage |
| Mémoire utilisée | < 500MB | Avec 10K entreprises |
| Taille des données | ~100MB | Fichiers CSV extraits |

---

## 🛠️ Configuration Supabase

La base de données est déjà configurée avec les informations suivantes :

- **URL**: `https://zzqyokefesatkgvtdqqt.supabase.co`
- **Tables**: `sectors`, `zones`, `companies`, `establishments`
- **Enregistrements**: 9 007 entreprises, 9 998 établissements

> Voir [SUPABASE_CONFIG.md](../SUPABASE_CONFIG.md) pour plus de détails.

---

## 🔍 Dépannage

### Problème: Connexion à la base de données échoue

```bash
# Vérifier que les variables d'environnement sont correctes
cat .env

# Tester la connexion manuellement avec psql
psql postgresql://postgres.zzqyokefesatkgvtdqqt:J'aimeLesChatons@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
```

### Problème: Les données ne sont pas chargées

```bash
# Vérifier que le backend a bien démarré
curl http://localhost:8000/v1/health

# Vérifier le nombre d'enregistrements dans Supabase
curl -H "apikey: sb_publishable_cXTGBKNm0_xqzvhMEiCwRA_E8srpZBq" \
     -H "Authorization: Bearer sb_publishable_cXTGBKNm0_xqzvhMEiCwRA_E8srpZBq" \
     "https://zzqyokefesatkgvtdqqt.supabase.co/rest/v1/companies?select=count"
```

### Problème: Les tests échouent

```bash
# Installer les dépendances de test
pip install pytest pytest-httpx httpx

# Exécuter les tests
pytest tests/test_mvp1.py -v
```

---

## 🎓 Prochaines Étapes

Une fois le MVP1 validé, vous pouvez passer à :

1. **MVP2**: Ajouter les agents de prospection intelligents
2. **Intégration Supabase avancée**: Row Level Security, Authentification
3. **Frontend**: Créer une interface utilisateur avec Next.js
4. **Déploiement**: Déployer l'application sur un serveur de production

---

## 📞 Support

Pour plus d'informations, consulter :
- [Spécifications MVP1](../specs/001-b2bmax-chat-insee/spec.md)
- [Plan d'implémentation](../specs/001-b2bmax-chat-insee/plan.md)
- [Modèle de données](../specs/001-b2bmax-chat-insee/data-model.md)

---

*Dernière mise à jour: 7 octobre 2026*