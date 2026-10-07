"""
B2Bmax MVP1 - Backend FastAPI
Utilise les données INSEE chargées dans Supabase via les fichiers extract_10000.csv

Endpoints disponibles:
- GET /health - Vérification du service
- GET /sectors - Liste des secteurs NAF
- GET /zones - Liste des zones géographiques
- POST /chat/messages - Traitement des messages chat
- POST /search - Recherche d'entreprises

Démarrer avec: uvicorn main_mvp1:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# ============================================================================
# CONFIGURATION
# ============================================================================

load_dotenv()

# Configuration Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ SUPABASE_URL et SUPABASE_KEY requis dans .env")

# Initialisation du client Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ============================================================================
# MODÈLES PYDANTIC
# ============================================================================

class Sector(BaseModel):
    """Modèle pour un secteur NAF"""
    id: str
    naf_code: str
    name: str
    description: Optional[str] = None
    level: int
    parent_id: Optional[str] = None

class Zone(BaseModel):
    """Modèle pour une zone géographique"""
    id: str
    code: str
    name: str
    level: str
    parent_id: Optional[str] = None
    insee_code: Optional[str] = None

class CompanySearchRequest(BaseModel):
    """Modèle pour une requête de recherche d'entreprises"""
    query: str = Field(..., description="Requête en langage naturel")
    sector: Optional[str] = Field(None, description="Code NAF ou nom du secteur")
    zone: Optional[str] = Field(None, description="Code ou nom de la zone")
    category: Optional[str] = Field(None, description="Catégorie d'entreprise (PME, etc.)")
    limit: int = Field(20, description="Nombre maximum de résultats")

class ChatMessageRequest(BaseModel):
    """Modèle pour un message de chat"""
    message: str = Field(..., description="Message de l'utilisateur")
    conversation_id: Optional[str] = Field(None, description="ID de la conversation")

class ChatMessageResponse(BaseModel):
    """Modèle pour une réponse de chat"""
    id: str
    message: str
    role: str  # user, assistant
    sector: Optional[str] = None
    zone: Optional[str] = None
    category: Optional[str] = None
    total_companies: Optional[int] = None
    creations: Optional[int] = None
    radiations: Optional[int] = None
    net_change: Optional[int] = None
    insight: Optional[str] = None
    actions: List[str] = Field(default_factory=list)

class SearchResult(BaseModel):
    """Modèle pour les résultats de recherche"""
    query: str
    sector: Optional[str] = None
    zone: Optional[str] = None
    total_companies: int
    total_establishments: int
    active_companies: int
    active_establishments: int
    companies: List[Dict[str, Any]] = Field(default_factory=list)
    stats: Dict[str, Any] = Field(default_factory=dict)

# ============================================================================
# UTILITAIRES
# ============================================================================

def extract_entities_from_query(query: str) -> Dict[str, Optional[str]]:
    """
    Extrait les entités (secteur, zone, catégorie) d'une requête en langage naturel.
    
    Pour MVP1, on utilise une approche simple basée sur des mots-clés.
    Dans les versions suivantes, on utilisera Mistral AI.
    
    Exemples:
    - "PME en Bretagne dans le numérique" -> sector: "numérique", zone: "Bretagne", category: "PME"
    - "Entreprises de restauration en Ille-et-Vilaine" -> sector: "restauration", zone: "35"
    """
    query_lower = query.lower()
    
    # Catégories d'entreprise
    categories = ["pme", "ge", "tpe", "micro", "petite", "moyenne", "grande"]
    category = None
    for cat in categories:
        if cat in query_lower:
            category = cat.upper()
            break
    
    # Secteurs (mots-clés simples pour MVP1)
    sector_keywords = {
        "numérique": ["numérique", "informatique", "digital", "web", "internet", "logiciel"],
        "restauration": ["restauration", "restaurant", "café", "bar", "hôtel"],
        "commerce": ["commerce", "boutique", "magasin", "vente", "achat"],
        "bâtiment": ["bâtiment", "construction", "travaux", "btp"],
        "industrie": ["industrie", "fabrication", "production", "usine"],
        "santé": ["santé", "médecin", "hôpital", "médical", "pharmacie"],
        "education": ["éducation", "école", "formation", "université", "lycée"],
    }
    
    sector = None
    for sector_name, keywords in sector_keywords.items():
        if any(kw in query_lower for kw in keywords):
            sector = sector_name
            break
    
    # Zones géographiques
    zones_keywords = {
        "Bretagne": ["bretagne", "bre"],
        "Île-de-France": ["ile de france", "idf", "paris"],
        "Finistère": ["finistère", "29"],
        "Côtes-d'Armor": ["côtes-d'armor", "cotes d'armor", "22"],
        "Ille-et-Vilaine": ["ille-et-vilaine", "ille et vilaine", "35"],
        "Morbihan": ["morbihan", "56"],
    }
    
    zone = None
    for zone_name, keywords in zones_keywords.items():
        if any(kw in query_lower for kw in keywords):
            zone = zone_name
            break
    
    return {
        "sector": sector,
        "zone": zone,
        "category": category
    }

def get_sector_id_by_code(naf_code: str) -> Optional[str]:
    """Trouve l'ID d'un secteur par son code NAF"""
    result = supabase.table("sector").select("id").eq("naf_code", naf_code).execute()
    if result.data:
        return result.data[0]["id"]
    return None

def get_zone_id_by_code(zone_code: str) -> Optional[str]:
    """Trouve l'ID d'une zone par son code"""
    result = supabase.table("zone").select("id").eq("code", zone_code).execute()
    if result.data:
        return result.data[0]["id"]
    
    # Essayer de trouver par nom
    result = supabase.table("zone").select("id").ilike("name", f"%{zone_code}%").execute()
    if result.data:
        return result.data[0]["id"]
    
    return None

# ============================================================================
# ENDPOINTS
# ============================================================================

app = FastAPI(
    title="B2Bmax MVP1 API",
    description="API pour l'agent conversationnel de prospection INSEE - MVP1",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Pour le développement
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
async def health_check():
    """Vérification de la santé du service"""
    # Tester la connexion à Supabase
    try:
        result = supabase.table("legal_unit").select("count").execute()
        count = len(result.data) if result.data else 0
        return {
            "status": "healthy",
            "database": "connected",
            "legal_units_count": count,
            "message": "B2Bmax MVP1 API is running"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "message": "B2Bmax MVP1 API is running but database connection failed"
        }, 503


@app.get("/sectors", response_model=List[Sector], tags=["Reference Data"])
async def get_sectors():
    """Liste tous les secteurs NAF disponibles"""
    result = supabase.table("sector").select("*").execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Aucun secteur trouvé")
    return [Sector(**s) for s in result.data]


@app.get("/zones", response_model=List[Zone], tags=["Reference Data"])
async def get_zones():
    """Liste toutes les zones géographiques disponibles"""
    result = supabase.table("zone").select("*").execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Aucune zone trouvée")
    return [Zone(**z) for z in result.data]


@app.post("/chat/messages", response_model=ChatMessageResponse, tags=["Chat"])
async def chat_message(request: ChatMessageRequest):
    """
    Traitement d'un message de chat avec extraction d'entités et génération de synthèse.
    
    Exemple de requête:
    {
        "message": "Quelles sont les PME en Bretagne dans le secteur du numérique ?"
    }
    """
    # Extraire les entités de la requête
    entities = extract_entities_from_query(request.message)
    
    # Trouver les IDs des secteurs et zones
    sector_id = None
    if entities["sector"]:
        # Pour MVP1, on utilise des codes NAF simples
        naf_code_map = {
            "numérique": "J",
            "restauration": "I",  # Note: la restauration est en section I, pas 56
            "commerce": "G",
            "bâtiment": "F",
            "industrie": "C",
            "santé": "Q",
            "education": "P",
        }
        sector_code = naf_code_map.get(entities["sector"], entities["sector"])
        sector_id = get_sector_id_by_code(sector_code)
    
    zone_id = None
    if entities["zone"]:
        zone_code_map = {
            "Bretagne": "BRE",
            "Île-de-France": "IDF",
            "Finistère": "29",
            "Côtes-d'Armor": "22",
            "Ille-et-Vilaine": "35",
            "Morbihan": "56",
        }
        zone_code = zone_code_map.get(entities["zone"], entities["zone"])
        zone_id = get_zone_id_by_code(zone_code)
    
    # Rechercher les entreprises correspondantes
    search_result = await perform_search(
        sector=entities["sector"],
        zone=entities["zone"],
        category=entities["category"]
    )
    
    # Générer une réponse (MVP1: mock, sera remplacé par Mistral)
    insight = generate_insight(search_result, entities)
    
    # Générer les actions suivantes
    actions = [
        "Recevoir un rapport hebdomadaire sur ces données",
        "Créer un agent de prospection pour contacter ces entreprises",
        "Suivre la création de nouvelles entreprises"
    ]
    
    # Créer la réponse
    response = ChatMessageResponse(
        id=str(uuid.uuid4()),
        message=insight,
        role="assistant",
        sector=entities["sector"],
        zone=entities["zone"],
        category=entities["category"],
        total_companies=search_result.get("total_companies"),
        creations=search_result.get("creations"),
        radiations=search_result.get("radiations"),
        net_change=search_result.get("net_change"),
        insight=insight,
        actions=actions
    )
    
    return response


@app.post("/search", response_model=SearchResult, tags=["Search"])
async def perform_search(
    sector: Optional[str] = None,
    zone: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 20
):
    """
    Recherche d'entreprises selon des critères spécifiques.
    
    Exemple de requête:
    {
        "sector": "J",  // Information et communication
        "zone": "BRE",   // Bretagne
        "category": "PME"
    }
    """
    import uuid
    
    # Construire la requête SQL
    query = supabase.table("searchable_companies").select("*", count="exact")
    
    # Filtres
    filters = []
    
    # Filtre par secteur
    if sector:
        # Trouver tous les codes NAF qui correspondent
        if sector.upper() in ["J", "I", "G", "F", "C", "Q", "P"]:
            filters.append("sector_code", "eq", sector.upper())
        else:
            # Essayer de trouver le secteur par nom
            result = supabase.table("sector").select("naf_code").ilike("name", f"%{sector}%").execute()
            if result.data:
                naf_codes = [s["naf_code"] for s in result.data]
                filters.append("sector_code", "in", f"({','.join(naf_codes)})")
    
    # Filtre par zone
    if zone:
        # Trouver toutes les zones enfants
        zone_code_map = {
            "BRE": ["BRE", "22", "29", "35", "56"],  # Bretagne et ses départements
            "IDF": ["IDF", "75", "77", "78", "91", "92", "93", "94", "95"],
        }
        zone_codes = zone_code_map.get(zone.upper(), [zone.upper()])
        filters.append("zone_code", "in", f"({','.join([f"'{z}'" for z in zone_codes])})")
    
    # Filtre par catégorie
    if category:
        filters.append("category", "eq", category)
    
    # Appliquer les filtres
    if filters:
        # Appliquer les filtres 3 par 3 (limite Supabase)
        for i in range(0, len(filters), 3):
            batch = filters[i:i+3]
            for field, op, value in batch:
                query = query.filter(field, op, value)
    
    # Exécuter la requête
    result = query.limit(limit).execute()
    
    # Calculer les statistiques
    if result.data:
        companies = result.data
        total_companies = len(companies)
        
        # Compter les créations et radiations (simplifié pour MVP1)
        # Dans une vraie implémentation, on utiliserait les dates
        creations = sum(1 for c in companies if c.get("creation_date"))
        radiations = 0  # À calculer à partir des dates de radiation
        net_change = creations - radiations
    else:
        companies = []
        total_companies = 0
        creations = 0
        radiations = 0
        net_change = 0
    
    return SearchResult(
        query=f"sector={sector}, zone={zone}, category={category}",
        sector=sector,
        zone=zone,
        total_companies=total_companies,
        total_establishments=len(companies),
        active_companies=total_companies,
        active_establishments=len(companies),
        companies=companies,
        stats={
            "creations": creations,
            "radiations": radiations,
            "net_change": net_change
        }
    )


def generate_insight(search_result: Dict, entities: Dict) -> str:
    """
    Génère une synthèse en langage naturel (MVP1: mock simple).
    Dans les versions suivantes, on utilisera Mistral AI.
    """
    total = search_result.get("total_companies", 0)
    creations = search_result.get("stats", {}).get("creations", 0)
    radiations = search_result.get("stats", {}).get("radiations", 0)
    net_change = search_result.get("stats", {}).get("net_change", 0)
    
    sector = entities.get("sector", "")
    zone = entities.get("zone", "")
    category = entities.get("category", "")
    
    # Déterminer la tendance
    if net_change > 0:
        trend = "en croissance"
    elif net_change < 0:
        trend = "en déclin"
    else:
        trend = "stable"
    
    # Construire la réponse
    response = f"J'ai trouvé **{total} entreprises**"
    
    if sector:
        response += f" dans le secteur **{sector}**"
    if zone:
        response += f" en **{zone}**"
    if category:
        response += f" de type **{category}**"
    
    response += f"\n\n**Chiffres clés :**\n"
    response += f"- Nombre total d'entreprises : **{total}**\n"
    response += f"- Créations (12 derniers mois) : **{creations}**\n"
    response += f"- Radiations (12 derniers mois) : **{radiations}**\n"
    response += f"- Variation nette : **{net_change}**\n"
    response += f"- Tendance : **{trend}**\n"
    
    if total > 0:
        response += f"\nSouhaitez-vous que je vous propose des actions pour ces données ?"
    else:
        response += f"\nAucune entreprise trouvée avec ces critères. Voulez-vous essayer une autre recherche ?"
    
    return response


# ============================================================================
# DÉMARRAGE
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main_mvp1:app", host="0.0.0.0", port=8000, reload=True)
