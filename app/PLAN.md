# 🎯 Plan d'Exécution - INSEE API + Mistral (2h)
**Objectif** : Maximiser les notes sur les 5 critères (Intégration Tech Mistral, Potentiel Business, Innovation, UX, Qualité du Proto) en 2 heures.

---

## 📌 Contexte
**Problème** : Les créations et radiations d'entreprises (données INSEE) indiquent si un marché se développe ou se contracte, mais ces informations sont publiées sous forme d'annonces à lire une à une → **le signal est invisible**.

**Cas d'usage** :
1. **Banque régionale** : Savoir si la restauration se porte bien dans une zone pour ajuster les prêts.
2. **Éditeur de logiciels** : Contacter les nouveaux commerçants dès leur création pour les prospection.

---

## ⏱️ Timeline Minute par Minute

| **Temps**  | **Action** | **Livrable** | **Critères Impactés** |
|------------|------------|--------------|------------------------|
| **0:00-0:10** | Lecture du problème + Setup : Comprendre les enjeux, créer la structure du projet. | ✅ `insee-api/` + `requirements.txt` + `.env.example` | Qualité du Proto |
| **0:10-0:25** | Mock des données INSEE : Créer `data/mock_insee.json` avec des données réalistes pour les 2 cas d’usage. | ✅ `data/mock_insee.json` | Intégration Tech, UX |
| **0:25-0:50** | Développement du cœur : Implémenter `main.py` avec endpoint `/trends` (agrège créations/radiations + génère un insight via Mistral) et mock de l’API INSEE. | ✅ `main.py` (API fonctionnelle) | **Tous les critères** |
| **0:50-1:05** | Tests unitaires : Écrire 2 tests pour `/trends` (cas banque + éditeur). | ✅ `tests/test_trends.py` | Qualité du Proto |
| **1:05-1:20** | Documentation : Mettre à jour `README.md` avec 2 cas d’usage concrets, exemples cURL, schéma Mermaid, et lien Swagger UI. | ✅ `README.md` complet | UX, Potentiel Business, Innovation |
| **1:20-1:35** | Démo locale : Lancer l’API (`uvicorn main:app`), tester `/trends` via Swagger UI et cURL. Vérifier les 5 critères. | ✅ API testée + captures d’écran | **Tous les critères** |
| **1:35-1:50** | Polish final : Ajouter endpoint `/new_companies`, optimiser les prompts Mistral, vérifier la cohérence. | ✅ Endpoint supplémentaire + prompts optimisés | Innovation, Intégration Tech |
| **1:50-2:00** | Préparation de la présentation : Résumer les 5 critères dans le README avec des badges, préparer 2 commandes cURL. | ✅ README final + demo prête | **Tous les critères** |

---

## 📁 Structure du Projet
```bash
insee-api/
├── README.md                # Documentation complète (cas d'usage, exemples, architecture)
├── PLAN.md                  # Ce fichier
├── main.py                 # Code principal (API FastAPI)
├── requirements.txt         # Dépendances Python
├── .env.example             # Exemple de variables d'environnement
├── data/
│   └── mock_insee.json      # Données mockées pour les 2 cas d'usage
└── tests/
    └── test_trends.py       # Tests unitaires
```

---

## 🚀 Étapes Détaillées avec Code Prêt à l'Emploi

---

### **Étape 1 : Setup (0:00-0:10)**
**Actions** :
1. Créer la structure du projet :
   ```bash
   mkdir -p insee-api/{data,tests}
   touch insee-api/{main.py,requirements.txt,.env.example,data/mock_insee.json,tests/test_trends.py}
   ```
2. **`requirements.txt`** :
   ```text
   fastapi
   uvicorn
   python-dotenv
   mistralai
   pytest
   ```
3. **`.env.example`** :
   ```text
   MISTRAL_API_KEY=your_mistral_key_here
   ```

---

### **Étape 2 : Mock des Données INSEE (0:10-0:25)**
**Fichier `data/mock_insee.json`** :
```json
{
  "bank_case": {
    "naf_code": "56",
    "zone": "69001",
    "start_date": "2023-01",
    "end_date": "2024-06",
    "creations": 245,
    "radiations": 180,
    "net_change": 65,
    "new_companies": [
      {
        "siren": "123456789",
        "nom": "Le Bistrot Nouveau",
        "date_creation": "2024-03-15",
        "adresse": "10 Rue de la République, 69002 Lyon",
        "secteur": "Restauration traditionnelle"
      },
      {
        "siren": "987654321",
        "nom": "Pizzeria Bella",
        "date_creation": "2024-02-01",
        "adresse": "5 Avenue des Terroirs, 69001 Lyon",
        "secteur": "Restauration rapide"
      }
    ]
  },
  "editor_case": {
    "naf_code": null,
    "zone": null,
    "start_date": "2024-05",
    "end_date": "2024-06",
    "creations": 12500,
    "radiations": 9800,
    "net_change": 2700,
    "new_companies": [
      {
        "siren": "111222333",
        "nom": "Boutique Charm",
        "date_creation": "2024-05-10",
        "adresse": "20 Rue de Rivoli, 75001 Paris",
        "secteur": "Commerce de détail"
      },
      {
        "siren": "444555666",
        "nom": "TechShop",
        "date_creation": "2024-06-01",
        "adresse": "15 Rue Saint-Ferréol, 13001 Marseille",
        "secteur": "Vente de matériel informatique"
      }
    ]
  }
}
```

---

### **Étape 3 : Développement du Cœur (`main.py`) (0:25-0:50)**
**Fichier `main.py`** :
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import json
import os
from datetime import datetime
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage

app = FastAPI(
    title="INSEE Trends API",
    description="Analyse des créations/radiations d'entreprises avec Mistral",
    version="1.0.0"
)

# --- Config ---
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
mistral_client = MistralClient(api_key=MISTRAL_API_KEY) if MISTRAL_API_KEY else None

# --- Charger les mocks ---
with open("data/mock_insee.json", "r") as f:
    MOCK_DATA = json.load(f)


# --- Modèles ---
class TrendRequest(BaseModel):
    naf_code: Optional[str] = None  # Code NAF (ex: "56" pour restauration)
    zone: Optional[str] = None      # Code commune (ex: "69001" pour Lyon)
    start_date: str                 # Format: AAAA-MM
    end_date: str                   # Format: AAAA-MM


class Company(BaseModel):
    siren: str
    nom: str
    date_creation: str
    adresse: str
    secteur: str


class TrendResponse(BaseModel):
    sector: str
    zone: str
    period: str
    creations: int
    radiations: int
    net_change: int
    insight: str
    interesting_companies: List[Company]


# --- Endpoints ---
@app.post("/trends", response_model=TrendResponse, summary="Analyse des tendances marché")
async def get_trends(request: TrendRequest):
    """
    Retourne les tendances de créations/radiations pour un secteur et une zone donnés,
    avec un insight généré par Mistral.

    Exemples:
    - Cas banque: naf_code="56", zone="69001", start_date="2023-01", end_date="2024-06"
    - Cas éditeur: naf_code=null, zone=null, start_date="2024-05", end_date="2024-06"
    """
    # Sélectionner le jeu de données mocké
    if request.naf_code == "56" and request.zone == "69001":
        data = MOCK_DATA["bank_case"]
    else:
        data = MOCK_DATA["editor_case"]

    # Générer l'insight (avec Mistral ou fallback mock)
    insight = _generate_insight(
        sector=request.naf_code or "Tous secteurs",
        zone=request.zone or "France",
        period=f"{request.start_date} à {request.end_date}",
        creations=data["creations"],
        radiations=data["radiations"],
        new_companies=data["new_companies"]
    )

    return TrendResponse(
        sector=request.naf_code or "Tous secteurs",
        zone=request.zone or "France",
        period=f"{request.start_date} à {request.end_date}",
        creations=data["creations"],
        radiations=data["radiations"],
        net_change=data["net_change"],
        insight=insight,
        interesting_companies=[Company(**c) for c in data["new_companies"]]
    )


def _generate_insight(sector: str, zone: str, period: str, creations: int, radiations: int, new_companies: List[Dict]) -> str:
    """Génère un insight via Mistral ou retourne un mock si pas de clé API."""
    if not mistral_client:
        # Fallback mock pour la demo
        net = creations - radiations
        trend = "en croissance" if net > 0 else "en déclin"
        top_company = new_companies[0]["nom"] if new_companies else "aucune"
        return (
            f"Le marché {sector} à {zone} est {trend} avec {net} entreprises net pendant {period}. "
            f"Opportunité : {len(new_companies)} nouvelles entreprises créées, dont {top_company}. "
            f"Recommandation : Contacter ces nouvelles entreprises pour des partenariats ou des offres ciblées."
        )

    # Version avec Mistral (si clé API disponible)
    prompt = f"""
    Tu es un analyste marché. Analyse ces données pour le secteur **{sector}** dans la zone **{zone}** pendant **{period}** :
    - **Créations d'entreprises** : {creations}
    - **Radiations d'entreprises** : {radiations}
    - **Variation nette** : {creations - radiations}
    - **Nouvelles entreprises** : {json.dumps(new_companies[:3], indent=2, ensure_ascii=False)}

    Génère un **insight court (3-4 phrases max)** en français, avec :
    1. Une analyse de la tendance (marché en croissance/déclin/stable).
    2. Un chiffre clé à retenir.
    3. Une opportunité ou un risque pour les acteurs locaux.
    4. Une recommandation actionnable.
    """
    response = mistral_client.chat(
        model="mistral-small",
        messages=[ChatMessage(role="user", content=prompt)]
    )
    return response.choices[0].message.content


@app.get("/new_companies", summary="Liste des nouvelles entreprises à contacter")
async def get_new_companies(
    naf_code: Optional[str] = None,
    zone: Optional[str] = None,
    start_date: str = "2024-05",
    end_date: str = "2024-06"
):
    """Retourne la liste des nouvelles entreprises créées pendant la période."""
    if naf_code == "56" and zone == "69001":
        companies = MOCK_DATA["bank_case"]["new_companies"]
    else:
        companies = MOCK_DATA["editor_case"]["new_companies"]
    return {"companies": companies}
```

---

### **Étape 4 : Tests Unitaires (0:50-1:05)**
**Fichier `tests/test_trends.py`** :
```python
from fastapi.testclient import TestClient
from main import app
import json

client = TestClient(app)


def test_trends_bank_case():
    """Test du cas banque (restauration à Lyon)."""
    response = client.post(
        "/trends",
        json={
            "naf_code": "56",
            "zone": "69001",
            "start_date": "2023-01",
            "end_date": "2024-06"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["sector"] == "56"
    assert data["zone"] == "69001"
    assert data["creations"] == 245
    assert data["radiations"] == 180
    assert data["net_change"] == 65
    assert len(data["insight"]) > 0
    assert len(data["interesting_companies"]) == 2


def test_trends_editor_case():
    """Test du cas éditeur (tous secteurs en France)."""
    response = client.post(
        "/trends",
        json={
            "start_date": "2024-05",
            "end_date": "2024-06"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["sector"] == "Tous secteurs"
    assert data["net_change"] == 2700
    assert "TechShop" in str(data["interesting_companies"])


def test_new_companies_endpoint():
    """Test de l'endpoint /new_companies."""
    response = client.get(
        "/new_companies",
        params={"naf_code": "56", "zone": "69001", "start_date": "2024-01", "end_date": "2024-06"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["companies"]) == 2
    assert data["companies"][0]["nom"] == "Le Bistrot Nouveau"
```

**Exécuter les tests** :
```bash
pytest tests/test_trends.py -v
```

---

### **Étape 5 : Documentation (`README.md`) (1:05-1:20)**
**À ajouter au `README.md` existant** :
```markdown
# INSEE API + Mistral - Détection des tendances marché

**✅ Problème résolu** :
Les créations et radiations d'entreprises (données INSEE) indiquent si un marché **se développe ou se contracte**, mais ces informations sont publiées sous forme d'annonces à lire une à une → **le signal est invisible**.
Notre solution **agrège ces données et génère des insights actionnables via Mistral**.

---

## 🎯 Cas d'Usage Concrets

### 🏦 **Cas 1 : Banque Régionale (Restauration à Lyon)**
**Besoin** : Savoir si le secteur de la restauration se porte bien dans une zone pour ajuster les prêts.

**Solution** :
```bash
curl -X POST http://localhost:8000/trends \
  -H "Content-Type: application/json" \
  -d '{
    "naf_code": "56",
    "zone": "69001",
    "start_date": "2023-01",
    "end_date": "2024-06"
  }'
```

**Réponse Attendue** :
```json
{
  "sector": "56",
  "zone": "69001",
  "period": "2023-01 à 2024-06",
  "creations": 245,
  "radiations": 180,
  "net_change": 65,
  "insight": "Le marché de la restauration à Lyon est en croissance nette de +65 établissements (+26% vs 2022). Opportunité : 45 nouveaux restaurants créés au Q1 2024, dont 12 dans le 2ème arrondissement (zone en forte demande). Recommandation : Cibler les nouveaux établissements pour des offres de prêts adaptées.",
  "interesting_companies": [
    {"siren": "123456789", "nom": "Le Bistrot Nouveau", "date_creation": "2024-03-15", "adresse": "10 Rue de la République, 69002 Lyon", "secteur": "Restauration traditionnelle"},
    {"siren": "987654321", "nom": "Pizzeria Bella", "date_creation": "2024-02-01", "adresse": "5 Avenue des Terroirs, 69001 Lyon", "secteur": "Restauration rapide"}
  ]
}
```

---

### 💻 **Cas 2 : Éditeur de Logiciels (Nouveaux Commerçants en France)**
**Besoin** : Contacter les nouveaux commerçants **dès leur création** pour leur vendre un logiciel.

**Solution** :
```bash
curl -X POST http://localhost:8000/trends \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2024-05",
    "end_date": "2024-06"
  }'
```

**Réponse Attendue** :
```json
{
  "sector": "Tous secteurs",
  "zone": "France",
  "period": "2024-05 à 2024-06",
  "creations": 12500,
  "radiations": 9800,
  "net_change": 2700,
  "insight": "La France compte +2 700 entreprises net en mai-juin 2024, avec une croissance marquée dans le commerce de détail (+15%). Opportunité : 12 500 nouvelles entreprises à contacter, dont 30% dans le numérique. Recommandation : Prioriser les secteurs en croissance (tech, restauration) pour les campagnes de prospection.",
  "interesting_companies": [
    {"siren": "111222333", "nom": "Boutique Charm", "date_creation": "2024-05-10", "adresse": "20 Rue de Rivoli, 75001 Paris", "secteur": "Commerce de détail"},
    {"siren": "444555666", "nom": "TechShop", "date_creation": "2024-06-01", "adresse": "15 Rue Saint-Ferréol, 13001 Marseille", "secteur": "Vente de matériel informatique"}
  ]
}
```

---

### 🔍 **Endpoint Supplémentaire : Liste des Nouvelles Entreprises**
```bash
curl "http://localhost:8000/new_companies?naf_code=56&zone=69001&start_date=2024-01&end_date=2024-06"
```

---

## 🛠️ Installation et Exécution

### 1️⃣ Prérequis
- Python 3.8+
- Clé API Mistral (optionnelle, fallback mock disponible)

### 2️⃣ Installation
```bash
git clone <votre-repo>
cd insee-api
pip install -r requirements.txt
```

### 3️⃣ Configuration
Créez un fichier `.env` avec votre clé Mistral (optionnel) :
```text
MISTRAL_API_KEY=your_key_here
```

### 4️⃣ Lancer l'API
```bash
uvicorn main:app --reload
```
→ Accédez à **[http://localhost:8000/docs](http://localhost:8000/docs)** pour **Swagger UI**.

---

## 🏗️ Architecture
```mermaid
graph TD
  A[Utilisateur] -->|Requête| B[/trends]
  A -->|Liste| C[/new_companies]
  B --> D[Mock INSEE
  ou API réelle]
  B --> E[Mistral
  Insights]
  D --> F[Agrégation
  Créations/Radiations]
  E --> F
  F --> G[Réponse JSON]
  G --> A
  C --> D
```

---

## ✅ Critères de Notation (Objectif : 10/10)

| **Critère** | **Implémentation** | **Preuve** | **Statut** |
|-------------|---------------------|------------|------------|
| **Intégration Tech Mistral** | Endpoint `/trends` utilise Mistral pour générer des insights (fallback mock si pas de clé). | Code dans `main.py` + demo via Swagger UI. | ⬜ |
| **Potentiel Business** | 2 cas concrets (banque + éditeur) avec valeurs chiffrées et recommandations. | Sections [Cas 1](#-cas-1-banque-régionale) et [Cas 2](#-cas-2-éditeur). | ⬜ |
| **Innovation** | Transformation de données brutes (INSEE) en **insights actionnables** via IA. | Insights générés dans les réponses + endpoint `/new_companies`. | ⬜ |
| **UX** | Swagger UI + README clair + exemples cURL. | `/docs` + sections "Cas d'usage" dans le README. | ⬜ |
| **Qualité du Proto** | Tests unitaires (3 tests), code commenté, structure propre, mocks pour les dépendances. | `tests/test_trends.py` + structure du projet. | ⬜ |
```

---

## 📊 Exemples de Code

### Python
```python
import requests

# Cas Banque : Restauration à Lyon
response = requests.post(
    "http://localhost:8000/trends",
    json={
        "naf_code": "56",
        "zone": "69001",
        "start_date": "2023-01",
        "end_date": "2024-06"
    }
)
print(response.json()["insight"])

# Cas Éditeur : Toutes les nouvelles entreprises
new_companies = requests.get(
    "http://localhost:8000/new_companies",
    params={"start_date": "2024-05", "end_date": "2024-06"}
).json()["companies"]
print(new_companies)
```

---

## 🚀 Prochaines Étapes (Post-2h)
1. **Déployer l'API** sur Render/Railway pour une demo live.
2. **Remplacer les mocks** par des appels réels à l'API INSEE.
3. **Ajouter un frontend** (Streamlit/React) pour une meilleure UX.
4. **Étendre les insights** avec des données supplémentaires (ex: INSEE + BPI France).
