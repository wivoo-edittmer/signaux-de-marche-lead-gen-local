"""
B2Bmax Backend API - MVP1

API FastAPI pour l'application B2Bmax.
Utilise uniquement les données locales depuis /data/ (pas d'appel à l'API INSEE).

Endpoints:
- POST /v1/chat/messages - Envoyer un message dans le chat
- POST /v1/searches - Effectuer une recherche
- GET /v1/searches/{id} - Obtenir les résultats d'une recherche
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from pathlib import Path
import uuid
import os
import json
import logging

# Configurer le logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Importer le data loader
import sys
sys.path.append(str(Path(__file__).parent / "data"))
from data_loader import get_data_loader, INSEEDataLoader, QueryResult

# Charger les données au démarrage
logger.info("Chargement des données INSEE locales...")
data_loader = get_data_loader()
logger.info(f"Données chargées: {len(data_loader.companies)} entreprises")

# ============================================================================
# Configuration
# ============================================================================

app = FastAPI(
    title="B2Bmax API",
    description="API pour l'application B2Bmax - Agent Conversationnel de Prospection INSEE",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurer CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8000",
        "https://b2bmax.com",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Modèles Pydantic
# ============================================================================

class MessageRequest(BaseModel):
    """Requête pour envoyer un message dans le chat"""
    conversation_id: Optional[str] = None
    message: str = Field(..., min_length=1, max_length=500)


class MessageResponse(BaseModel):
    """Réponse pour un message"""
    id: str
    conversation_id: str
    content: str
    role: str  # 'user' or 'assistant'
    created_at: str
    type: Optional[str] = None  # 'text', 'summary', 'action', 'error'
    data: Optional[Dict[str, Any]] = None


class SearchRequest(BaseModel):
    """Requête pour effectuer une recherche"""
    query: Optional[str] = None
    sector_id: Optional[str] = None
    zone_id: Optional[str] = None
    period_start: Optional[str] = None
    period_end: Optional[str] = None


class SearchResponse(BaseModel):
    """Réponse pour une recherche"""
    id: str
    query: Optional[str] = None
    sector_id: Optional[str] = None
    sector_name: Optional[str] = None
    zone_id: Optional[str] = None
    zone_name: Optional[str] = None
    period_start: Optional[str] = None
    period_end: Optional[str] = None
    statistics: Dict[str, Any]
    companies: List[Dict[str, Any]]
    insight: Optional[str] = None
    actions: List[Dict[str, Any]]
    created_at: str
    status: str = "completed"


# ============================================================================
# Utilitaires Mistral (simulés pour le MVP1 sans clé API)
# ============================================================================

def generate_insight_mock(
    sector_name: str,
    zone_name: str,
    total_companies: int,
    creations: int,
    radiations: int,
    net_change: int,
    trend: str
) -> str:
    """Génère une synthèse mockée (sans Mistral API)"""
    if trend == "growth":
        insight = (
            f"Le marché {sector_name} à {zone_name or 'France'} est en croissance "
            f"nette de +{net_change} entreprises. "
            f"Avec {creations} nouvelles créations et {radiations} radiations, "
            f"ce secteur montre une dynamique positive. "
            f"Opportunité: {total_companies} entreprises actives à contacter."
        )
    elif trend == "decline":
        insight = (
            f"Le marché {sector_name} à {zone_name or 'France'} est en déclin "
            f"avec {net_change} entreprises en moins. "
            f"Les radiations ({radiations}) dépassent les créations ({creations}). "
            f"Attention: secteur en difficulté avec {total_companies} entreprises."
        )
    else:
        insight = (
            f"Le marché {sector_name} à {zone_name or 'France'} est stable "
            f"avec un solde net de {net_change} entreprises. "
            f"Équilibre entre créations ({creations}) et radiations ({radiations}). "
            f"Secteur mature avec {total_companies} entreprises."
        )
    
    return insight


def extract_entities_from_query(query: str) -> Dict[str, Any]:
    """Extrait les entités d'une requête (secteur, zone, période)"""
    return data_loader.extract_entities(query)


# ============================================================================
# Endpoints
# ============================================================================

@app.post("/v1/chat/messages", response_model=MessageResponse)
async def send_chat_message(request: MessageRequest):
    """
    Envoyer un message dans une conversation.
    
    Ce endpoint:
    1. Reçoit un message utilisateur
    2. Extrait les entités (secteur, zone, période)
    3. Effectue une recherche
    4. Génère une synthèse
    5. Retourne la réponse avec les résultats
    """
    # Créer une conversation si inexistante
    conversation_id = request.conversation_id or str(uuid.uuid4())
    
    # Message utilisateur
    user_message = MessageResponse(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        content=request.message,
        role="user",
        created_at=datetime.utcnow().isoformat() + "Z",
        type="text"
    )
    
    # Analyser la requête pour extraire les entités
    entities = extract_entities_from_query(request.message)
    
    logger.info(f"Requête: {request.message}")
    logger.info(f"Entités extraites: {json.dumps(entities, ensure_ascii=False)}")
    
    # Si on a un secteur ou une zone, effectuer une recherche
    if entities.get("sector") or entities.get("zone"):
        sector_id = entities["sector"]["id"] if entities.get("sector") else None
        zone_id = entities["zone"]["id"] if entities.get("zone") else None
        
        # Obtenir les statistiques
        stats = data_loader.get_statistics(
            sector_id=sector_id,
            zone_id=zone_id
        )
        
        # Générer une synthèse
        insight = generate_insight_mock(
            sector_name=entities["sector"]["name"] if entities.get("sector") else "Tous secteurs",
            zone_name=entities["zone"]["name"] if entities.get("zone") else "France",
            total_companies=stats["total_companies"],
            creations=stats["creations"],
            radiations=stats["radiations"],
            net_change=stats["net_change"],
            trend=stats["trend"]
        )
        
        # Convertir les entreprises en dictionnaires
        companies_data = []
        for company in stats["companies"][:10]:  # Limiter à 10 pour la réponse
            companies_data.append({
                "id": str(uuid.uuid4()),
                "siren": company.siren,
                "name": company.name,
                "sector": {
                    "id": company.sector_id,
                    "name": data_loader.sectors.get(company.sector_id, {}).name if company.sector_id else None
                },
                "zone": {
                    "id": company.zone_id,
                    "name": data_loader.zones.get(company.zone_id, {}).name if company.zone_id else None
                },
                "date_created": company.date_created,
                "is_active": company.is_active
            })
        
        # Créer la réponse de synthèse
        summary_data = {
            "search_id": str(uuid.uuid4()),
            "query": request.message,
            "sector": entities.get("sector"),
            "zone": entities.get("zone"),
            "period": entities.get("period", "12 derniers mois"),
            "statistics": {
                "total_companies": stats["total_companies"],
                "creations": stats["creations"],
                "radiations": stats["radiations"],
                "net_change": stats["net_change"],
                "trend": stats["trend"]
            },
            "insight": insight,
            "companies": companies_data,
            "actions": [
                {
                    "type": "report",
                    "label": "Recevoir un rapport hebdomadaire",
                    "description": "Je peux vous envoyer un rapport hebdomadaire sur ces données",
                    "icon": "📊"
                },
                {
                    "type": "agent",
                    "label": "Créer un agent de prospection",
                    "description": f"Créer un agent pour contacter les {stats['total_companies']} entreprises",
                    "icon": "🤖"
                },
                {
                    "type": "follow",
                    "label": "Suivre les nouvelles entreprises",
                    "description": "Recevoir une notification chaque fois qu'une nouvelle entreprise est créée dans ce secteur",
                    "icon": "🔔"
                }
            ]
        }
        
        # Retourner la synthèse
        return MessageResponse(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            content=insight,
            role="assistant",
            created_at=datetime.utcnow().isoformat() + "Z",
            type="summary",
            data=summary_data
        )
    
    # Si pas de secteur/zone détecté, retourner une demande de clarification
    else:
        clarification = (
            "Votre demande est un peu vague. Pourriez-vous préciser :\n"
            "- De quel secteur parlez-vous ? (ex: restauration, numérique, commerce)\n"
            "- Dans quelle zone géographique ? (ex: Bretagne, Lyon, Île-de-France)\n"
            "\nExemple de requête: 'Quelles sont les PME du numérique en Bretagne ?'"
        )
        
        return MessageResponse(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            content=clarification,
            role="assistant",
            created_at=datetime.utcnow().isoformat() + "Z",
            type="error",
            data={
                "error": "AMBIGUOUS_QUERY",
                "suggestions": [
                    "Précisez un secteur d'activité",
                    "Ajoutez une zone géographique",
                    "Exemple: 'PME du numérique en Bretagne'"
                ]
            }
        )


@app.post("/v1/searches", response_model=SearchResponse)
async def create_search(request: SearchRequest):
    """
    Effectuer une recherche d'entreprises.
    
    Utilise les données locales INSEE pour trouver les entreprises
    correspondant aux critères de recherche.
    """
    # Effectuer la recherche
    stats = data_loader.get_statistics(
        sector_id=request.sector_id,
        zone_id=request.zone_id,
        date_from=request.period_start,
        date_to=request.period_end
    )
    
    # Générer l'insight
    sector_name = request.sector_id
    if request.sector_id and request.sector_id in data_loader.sectors:
        sector_name = data_loader.sectors[request.sector_id].name
    
    zone_name = request.zone_id
    if request.zone_id and request.zone_id in data_loader.zones:
        zone_name = data_loader.zones[request.zone_id].name
    
    insight = generate_insight_mock(
        sector_name=sector_name or "Tous secteurs",
        zone_name=zone_name or "France",
        total_companies=stats["total_companies"],
        creations=stats["creations"],
        radiations=stats["radiations"],
        net_change=stats["net_change"],
        trend=stats["trend"]
    )
    
    # Convertir les entreprises
    companies_data = []
    for company in stats["companies"][:50]:  # Limiter à 50
        companies_data.append({
            "siren": company.siren,
            "name": company.name,
            "sector_id": company.sector_id,
            "naf_code": company.naf_code,
            "zone_id": company.zone_id,
            "commune": company.commune,
            "postal_code": company.postal_code,
            "address": company.address,
            "date_created": company.date_created,
            "is_active": company.is_active,
            "size": company.size,
            "category": company.category
        })
    
    return SearchResponse(
        id=str(uuid.uuid4()),
        query=request.query,
        sector_id=request.sector_id,
        sector_name=sector_name,
        zone_id=request.zone_id,
        zone_name=zone_name,
        period_start=request.period_start,
        period_end=request.period_end,
        statistics={
            "total_companies": stats["total_companies"],
            "creations": stats["creations"],
            "radiations": stats["radiations"],
            "net_change": stats["net_change"],
            "trend": stats["trend"]
        },
        companies=companies_data,
        insight=insight,
        actions=[
            {
                "type": "report",
                "label": "Recevoir un rapport hebdomadaire",
                "description": "Je peux vous envoyer un rapport hebdomadaire sur ces données"
            },
            {
                "type": "agent",
                "label": "Créer un agent de prospection",
                "description": f"Créer un agent pour contacter les {stats['total_companies']} entreprises"
            },
            {
                "type": "follow",
                "label": "Suivre les nouvelles entreprises",
                "description": "Recevoir une notification chaque fois qu'une nouvelle entreprise est créée"
            }
        ],
        created_at=datetime.utcnow().isoformat() + "Z"
    )


@app.get("/v1/searches/{search_id}")
async def get_search(search_id: str):
    """
    Obtenir les détails d'une recherche existante.
    
    Pour le MVP1, on retourne des données mockées car les recherches
    ne sont pas persistées en base de données.
    """
    # Pour le MVP1, on retourne une réponse mockée
    # Dans les versions suivantes, on interrogera la base de données
    
    return {
        "id": search_id,
        "query": "Recherche exemple",
        "sector_id": "56",
        "sector_name": "Restauration",
        "zone_id": "69",
        "zone_name": "Rhône",
        "period_start": "2023-01-01",
        "period_end": "2024-06-30",
        "statistics": {
            "total_companies": 2450,
            "creations": 245,
            "radiations": 180,
            "net_change": 65,
            "trend": "growth"
        },
        "companies": [
            {
                "siren": "123456789",
                "name": "Le Bistrot Nouveau",
                "sector_id": "56",
                "naf_code": "56.10A",
                "zone_id": "69002",
                "commune": "Lyon",
                "postal_code": "69002",
                "address": "10 Rue de la République",
                "date_created": "2024-03-15",
                "is_active": true,
                "size": "small",
                "category": "PME"
            }
        ],
        "insight": "Le marché de la restauration à Lyon est en croissance nette de +65 établissements sur les 12 derniers mois. 245 nouvelles entreprises créées, 180 radiations. Une dynamique positive pour le secteur.",
        "actions": [
            {
                "type": "report",
                "label": "Recevoir un rapport hebdomadaire",
                "description": "Je peux vous envoyer un rapport hebdomadaire sur ces données"
            },
            {
                "type": "agent",
                "label": "Créer un agent de prospection",
                "description": "Créer un agent pour contacter chacune de ces entreprises"
            },
            {
                "type": "follow",
                "label": "Suivre les nouvelles entreprises",
                "description": "Recevoir une notification chaque fois qu'une nouvelle entreprise est créée dans ce secteur"
            }
        ],
        "created_at": datetime.utcnow().isoformat() + "Z"
    }


@app.get("/v1/sectors")
async def list_sectors():
    """Lister tous les secteurs disponibles"""
    sectors = []
    for sector in data_loader.sectors.values():
        sectors.append({
            "id": sector.id,
            "naf_code": sector.naf_code,
            "name": sector.name,
            "description": sector.description,
            "level": sector.level,
            "parent_id": sector.parent_id
        })
    return {"sectors": sectors, "total": len(sectors)}


@app.get("/v1/zones")
async def list_zones():
    """Lister toutes les zones géographiques disponibles"""
    zones = []
    for zone in data_loader.zones.values():
        zones.append({
            "id": zone.id,
            "code": zone.code,
            "name": zone.name,
            "level": zone.level,
            "parent_id": zone.parent_id
        })
    return {"zones": zones, "total": len(zones)}


@app.get("/v1/health")
async def health_check():
    """Vérification de santé de l'API"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "data_loader": {
            "loaded": data_loader._loaded,
            "companies_count": len(data_loader.companies),
            "sectors_count": len(data_loader.sectors),
            "zones_count": len(data_loader.zones)
        }
    }


@app.get("/")
async def root():
    """Endpoint racine"""
    return {
        "message": "Bienvenue sur l'API B2Bmax",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/v1/health"
    }


# ============================================================================
# Initialisation
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
