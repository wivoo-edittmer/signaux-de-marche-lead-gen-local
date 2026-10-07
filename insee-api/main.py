"""
B2Bmax MVP1 - API Backend pour l'analyse des données INSEE

Cette API permet aux utilisateurs de poser des questions en langage naturel
et de recevoir des synthèses basées sur les données INSEE stockées dans Supabase.

Utilisation: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime
import os

# Configuration logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Créer l'application FastAPI
app = FastAPI(
    title="B2Bmax MVP1 API",
    description="API pour l'analyse des données INSEE et la génération de synthèses commerciales",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# MODÈLES PYDANTIC
# ============================================================================

class SectorResponse(BaseModel):
    """Réponse pour un secteur NAF"""
    id: str
    naf_code: str
    name: str
    description: str = ""
    level: int = 1
    parent_id: Optional[str] = None


class ZoneResponse(BaseModel):
    """Réponse pour une zone géographique"""
    id: str
    code: str
    name: str
    level: str
    parent_id: Optional[str] = None


class CompanyResponse(BaseModel):
    """Réponse pour une entreprise"""
    siren: str
    name: str
    legal_form: Optional[str] = None
    date_created: Optional[str] = None
    sector_id: Optional[str] = None
    naf_code: Optional[str] = None
    zone_id: Optional[str] = None
    commune: Optional[str] = None
    postal_code: Optional[str] = None
    address: Optional[str] = None
    size: Optional[str] = None
    category: Optional[str] = None
    is_active: bool = True


class CompanySummary(BaseModel):
    """Résumé d'une entreprise pour les résultats"""
    siren: str
    name: str
    naf_code: Optional[str] = None
    commune: Optional[str] = None
    postal_code: Optional[str] = None
    size: Optional[str] = None
    category: Optional[str] = None


class QueryRequest(BaseModel):
    """Requête pour une recherche"""
    message: str = Field(..., description="Message de l'utilisateur en langage naturel")
    sector_id: Optional[str] = None
    zone_id: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None


class QueryResponse(BaseModel):
    """Réponse à une requête de recherche"""
    query: str
    sector: Optional[Dict[str, Any]] = None
    zone: Optional[Dict[str, Any]] = None
    total_companies: int = 0
    creations: int = 0
    radiations: int = 0
    net_change: int = 0
    trend: str = "stable"
    companies: List[CompanySummary] = []
    next_actions: List[Dict[str, Any]] = []
    confidence: float = 0.8


class ChatMessageRequest(BaseModel):
    """Requête pour un message dans le chat"""
    message: str = Field(..., description="Message de l'utilisateur")
    session_id: Optional[str] = None


class ChatMessageResponse(BaseModel):
    """Réponse à un message dans le chat"""
    message: str
    entities: Dict[str, Any] = {}
    query_result: Optional[QueryResponse] = None
    next_actions: List[Dict[str, Any]] = []
    session_id: Optional[str] = None


class HealthResponse(BaseModel):
    """Réponse pour l'endpoint de santé"""
    status: str = "healthy"
    timestamp: str
    version: str = "1.0.0"
    database: Dict[str, Any] = {}


# ============================================================================
# CONFIGURATION SUPABASE
# ============================================================================

class SupabaseConfig:
    URL = os.getenv("SUPABASE_URL", "https://zzqyokefesatkgvtdqqt.supabase.co")
    KEY = os.getenv("SUPABASE_KEY", "sb_publishable_cXTGBKNm0_xqzvhMEiCwRA_E8srpZBq")
    DB_HOST = os.getenv("SUPABASE_DB_HOST", "aws-0-eu-west-1.pooler.supabase.com")
    DB_PORT = os.getenv("SUPABASE_DB_PORT", "5432")
    DB_NAME = os.getenv("SUPABASE_DB_NAME", "postgres")
    DB_USER = os.getenv("SUPABASE_DB_USER", "postgres.zzqyokefesatkgvtdqqt")
    DB_PASSWORD = os.getenv("SUPABASE_DB_PASSWORD", "J'aimeLesChatons")


# ============================================================================
# GESTIONNAIRE DE DONNÉES SUPABASE
# ============================================================================

import psycopg2
from psycopg2 import pool

class SupabaseDataLoader:
    """
    Chargeur de données depuis Supabase pour B2Bmax.
    Utilise une connexion PostgreSQL directe pour de meilleures performances.
    """
    
    _connection_pool = None
    
    def __init__(self):
        self.sectors = {}
        self.zones = {}
        self._loaded = False
    
    @classmethod
    def get_connection(cls):
        """Retourne une connexion à la base de données"""
        if cls._connection_pool is None:
            cls._connection_pool = psycopg2.pool.SimpleConnectionPool(
                minconn=1,
                maxconn=10,
                host=SupabaseConfig.DB_HOST,
                port=SupabaseConfig.DB_PORT,
                database=SupabaseConfig.DB_NAME,
                user=SupabaseConfig.DB_USER,
                password=SupabaseConfig.DB_PASSWORD,
                sslmode="require"
            )
        return cls._connection_pool.getconn()
    
    @classmethod
    def release_connection(cls, conn):
        """Libère une connexion"""
        if cls._connection_pool and conn:
            cls._connection_pool.putconn(conn)
    
    def load(self):
        """Charge les données de référence (secteurs et zones)"""
        if self._loaded:
            return
        
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            # Charger les secteurs
            cursor.execute("SELECT id, naf_code, name, description, level, parent_id FROM sectors")
            for row in cursor.fetchall():
                self.sectors[row[0]] = {
                    'id': row[0],
                    'naf_code': row[1],
                    'name': row[2],
                    'description': row[3] or '',
                    'level': row[4] or 1,
                    'parent_id': row[5]
                }
            
            # Charger les zones
            cursor.execute("SELECT id, code, name, level, parent_id FROM zones")
            for row in cursor.fetchall():
                self.zones[row[0]] = {
                    'id': row[0],
                    'code': row[1],
                    'name': row[2],
                    'level': row[3],
                    'parent_id': row[4]
                }
            
            self._loaded = True
            logger.info(f"Données chargées: {len(self.sectors)} secteurs, {len(self.zones)} zones")
            
        except Exception as e:
            logger.error(f"Erreur lors du chargement des données: {e}")
            raise
        finally:
            cursor.close()
            self.release_connection(conn)
    
    def search_companies(
        self,
        sector_id: Optional[str] = None,
        zone_id: Optional[str] = None,
        naf_code: Optional[str] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        is_active: Optional[bool] = True,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Recherche des entreprises selon des critères"""
        if not self._loaded:
            self.load()
        
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            query = """
                SELECT siren, name, legal_form, date_created, sector_id, naf_code, 
                       zone_id, postal_code, commune, address, size, category, is_active
                FROM companies
            """
            
            conditions = []
            params = []
            param_index = 1
            
            if sector_id:
                # Vérifier si c'est un code NAF ou un ID de secteur
                if sector_id in self.sectors:
                    conditions.append(f"naf_code LIKE %s")
                    params.append(f"{sector_id}%" )
                else:
                    conditions.append(f"sector_id = %s")
                    params.append(sector_id)
            
            if naf_code:
                conditions.append(f"naf_code LIKE %s")
                params.append(f"{naf_code}%" )
            
            if zone_id:
                # Vérifier si c'est un code de zone ou un ID
                if zone_id in self.zones:
                    zone = self.zones[zone_id]
                    # Trouver toutes les zones enfants
                    zone_codes = self._get_all_zone_codes(zone_id)
                    if zone_codes:
                        conditions.append(f"zone_id IN ({','.join(['%s']*len(zone_codes))})")
                        params.extend(zone_codes)
                        param_index += len(zone_codes)
                else:
                    conditions.append(f"zone_id = %s")
                    params.append(zone_id)
            
            if date_from:
                conditions.append(f"date_created >= %s")
                params.append(date_from)
            
            if date_to:
                conditions.append(f"date_created <= %s")
                params.append(date_to)
            
            if is_active is not None:
                conditions.append(f"is_active = %s")
                params.append(is_active)
            
            if conditions:
                query += " WHERE " + " AND ".join(conditions)
            
            query += f" ORDER BY name LIMIT {limit}"
            
            cursor.execute(query, params)
            
            results = []
            for row in cursor.fetchall():
                results.append({
                    'siren': row[0],
                    'name': row[1],
                    'legal_form': row[2],
                    'date_created': row[3],
                    'sector_id': row[4],
                    'naf_code': row[5],
                    'zone_id': row[6],
                    'postal_code': row[7],
                    'commune': row[8],
                    'address': row[9],
                    'size': row[10],
                    'category': row[11],
                    'is_active': row[12]
                })
            
            return results
            
        except Exception as e:
            logger.error(f"Erreur lors de la recherche: {e}")
            return []
        finally:
            cursor.close()
            self.release_connection(conn)
    
    def _get_all_zone_codes(self, zone_id: str) -> List[str]:
        """Obtient tous les codes de zones enfants"""
        if not self._loaded:
            self.load()
        
        codes = []
        stack = [zone_id]
        
        while stack:
            current_id = stack.pop()
            codes.append(current_id)
            
            # Trouver les zones enfants
            for z_id, zone in self.zones.items():
                if zone.get('parent_id') == current_id:
                    stack.append(z_id)
        
        return codes
    
    def get_statistics(
        self,
        sector_id: Optional[str] = None,
        zone_id: Optional[str] = None,
        naf_code: Optional[str] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None
    ) -> Dict[str, Any]:
        """Calcule les statistiques pour une recherche"""
        companies = self.search_companies(
            sector_id=sector_id,
            zone_id=zone_id,
            naf_code=naf_code,
            date_from=date_from,
            date_to=date_to,
            limit=10000  # Pas de limite pour les stats
        )
        
        total = len(companies)
        
        # Compter les créations (entreprises créées dans la période)
        creations = 0
        if date_from and date_to:
            for company in companies:
                if company['date_created'] and date_from <= company['date_created'] <= date_to:
                    creations += 1
        
        # Estimation des radiations (pour le MVP1)
        radiations = int(total * 0.1)  # Ratio estimé de 10%
        net_change = creations - radiations
        
        trend = "growth" if net_change > 0 else "decline" if net_change < 0 else "stable"
        
        return {
            'total_companies': total,
            'creations': creations,
            'radiations': radiations,
            'net_change': net_change,
            'trend': trend,
            'sector_id': sector_id,
            'zone_id': zone_id
        }
    
    def extract_entities(self, query: str) -> Dict[str, Any]:
        """Extrait les entités (secteur, zone, période) d'une requête"""
        if not self._loaded:
            self.load()
        
        query_lower = query.lower()
        
        result = {
            'query': query,
            'sector': None,
            'zone': None,
            'period': '12 derniers mois',
            'confidence': 0.8
        }
        
        # Mapping des synonymes pour les secteurs
        sector_synonyms = {
            'numérique': 'J',
            'informatique': '62',
            'programmation': '62',
            'développement': '62',
            'logiciel': '62',
            'logiciels': '62',
            'digital': 'J',
            'digitale': 'J',
            'tech': 'J',
            'technologie': 'J',
            'technologies': 'J',
            'restauration': '56',
            'restaurant': '56',
            'restaurants': '56',
            'bar': '56',
            'café': '56',
            'cafés': '56',
            'commerce': 'G',
            'commercial': 'G',
            'commerciale': 'G',
            'vente': 'G',
            'boutique': '47',
            'magasin': '47',
            'magasins': '47'
        }
        
        # Vérifier les synonymes d'abord
        for keyword, sector_id in sector_synonyms.items():
            if keyword in query_lower:
                if sector_id in self.sectors:
                    sector = self.sectors[sector_id]
                    result['sector'] = {
                        'id': sector['id'],
                        'name': sector['name'],
                        'naf_code': sector['naf_code']
                    }
                    result['confidence'] = 0.98
                    break
                elif sector_id.upper() in self.sectors:
                    sector = self.sectors[sector_id.upper()]
                    result['sector'] = {
                        'id': sector['id'],
                        'name': sector['name'],
                        'naf_code': sector['naf_code']
                    }
                    result['confidence'] = 0.98
                    break
            if result['sector']:
                break
        
        # Si pas trouvé par synonymes, chercher dans les noms de secteurs
        if not result['sector']:
            for sector in self.sectors.values():
                keywords = [
                    sector['name'].lower(),
                    sector['naf_code'].lower().replace('.', ''),
                    sector['naf_code'].lower()
                ]
                for keyword in keywords:
                    if keyword in query_lower:
                        result['sector'] = {
                            'id': sector['id'],
                            'name': sector['name'],
                            'naf_code': sector['naf_code']
                        }
                        result['confidence'] = 0.95
                        break
                if result['sector']:
                    break
        
        # Rechercher les zones
        for zone in self.zones.values():
            keywords = [
                zone['name'].lower(),
                zone['code'].lower()
            ]
            for keyword in keywords:
                if keyword in query_lower:
                    result['zone'] = {
                        'id': zone['id'],
                        'name': zone['name'],
                        'code': zone['code'],
                        'level': zone['level']
                    }
                    result['confidence'] = max(result['confidence'], 0.95)
                    break
            if result['zone']:
                break
        
        # Extraire la période
        if '2023' in query_lower:
            result['period'] = '2023'
        elif '2024' in query_lower:
            result['period'] = '2024'
        elif '2025' in query_lower:
            result['period'] = '2025'
        elif 'trimestre' in query_lower or '3 mois' in query_lower:
            result['period'] = '3 derniers mois'
        elif '6 mois' in query_lower or 'semestre' in query_lower:
            result['period'] = '6 derniers mois'
        elif 'semaine' in query_lower or '7 jours' in query_lower:
            result['period'] = '7 derniers jours'
        elif 'mois' in query_lower:
            result['period'] = '1 mois'
        
        return result


# ============================================================================
# GESTION DES SESSIONS DE CHAT
# ============================================================================

class ChatSessionManager:
    """Gère les sessions de chat"""
    
    sessions = {}
    
    @classmethod
    def create_session(cls) -> str:
        import uuid
        session_id = str(uuid.uuid4())
        cls.sessions[session_id] = {
            'created_at': datetime.now().isoformat(),
            'query_history': []
        }
        return session_id
    
    @classmethod
    def add_query(cls, session_id: str, query: str, result: Dict[str, Any]):
        if session_id in cls.sessions:
            cls.sessions[session_id]['query_history'].append({
                'query': query,
                'result': result,
                'timestamp': datetime.now().isoformat()
            })


# ============================================================================
# ENDPOINTS API
# ============================================================================

# Instance globale du chargeur de données
data_loader = SupabaseDataLoader()


@app.on_event("startup")
async def startup_event():
    """Charger les données au démarrage"""
    try:
        data_loader.load()
        logger.info("Données Supabase chargées avec succès")
    except Exception as e:
        logger.error(f"Erreur lors du chargement des données: {e}")


@app.get("/v1/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Vérifie que l'API est opérationnelle"""
    try:
        # Vérifier la connexion à la base de données
        conn = SupabaseDataLoader.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        cursor.close()
        SupabaseDataLoader.release_connection(conn)
        
        db_status = {"status": "healthy", "connection": "ok"}
    except Exception as e:
        db_status = {"status": "unhealthy", "error": str(e)}
    
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        version="1.0.0",
        database=db_status
    )


@app.get("/v1/sectors", response_model=List[SectorResponse], tags=["Reference Data"])
async def list_sectors():
    """Liste tous les secteurs NAF disponibles"""
    if not data_loader._loaded:
        data_loader.load()
    
    return [SectorResponse(**sector) for sector in data_loader.sectors.values()]


@app.get("/v1/zones", response_model=List[ZoneResponse], tags=["Reference Data"])
async def list_zones():
    """Liste toutes les zones géographiques disponibles"""
    if not data_loader._loaded:
        data_loader.load()
    
    return [ZoneResponse(**zone) for zone in data_loader.zones.values()]


@app.get("/v1/sectors/{sector_id}", response_model=SectorResponse, tags=["Reference Data"])
async def get_sector(sector_id: str):
    """Obtient un secteur spécifique"""
    if not data_loader._loaded:
        data_loader.load()
    
    if sector_id not in data_loader.sectors:
        raise HTTPException(status_code=404, detail="Secteur non trouvé")
    
    return SectorResponse(**data_loader.sectors[sector_id])


@app.get("/v1/zones/{zone_id}", response_model=ZoneResponse, tags=["Reference Data"])
async def get_zone(zone_id: str):
    """Obtient une zone spécifique"""
    if not data_loader._loaded:
        data_loader.load()
    
    if zone_id not in data_loader.zones:
        raise HTTPException(status_code=404, detail="Zone non trouvée")
    
    return ZoneResponse(**data_loader.zones[zone_id])


@app.post("/v1/chat/messages", response_model=ChatMessageResponse, tags=["Chat"])
async def chat_message(request: ChatMessageRequest):
    """
    Traite un message du chat et retourne une réponse avec analyse.
    
    Exemples de requêtes:
    - "Quelles sont les PME en Bretagne dans le secteur du numérique ?"
    - "Entreprises de restauration à Lyon"
    - "PME du numérique en France"
    """
    try:
        # Extraire les entités de la requête
        entities = data_loader.extract_entities(request.message)
        
        # Si on a un secteur ou une zone, effectuer une recherche
        query_result = None
        if entities.get('sector') or entities.get('zone'):
            sector_id = entities.get('sector', {}).get('id') if entities.get('sector') else None
            zone_id = entities.get('zone', {}).get('id') if entities.get('zone') else None
            
            # Effectuer la recherche
            companies = data_loader.search_companies(
                sector_id=sector_id,
                zone_id=zone_id,
                limit=50
            )
            
            # Calculer les statistiques
            stats = data_loader.get_statistics(
                sector_id=sector_id,
                zone_id=zone_id
            )
            
            # Préparer le résultat de la requête
            query_result = QueryResponse(
                query=request.message,
                sector=entities.get('sector'),
                zone=entities.get('zone'),
                total_companies=stats['total_companies'],
                creations=stats['creations'],
                radiations=stats['radiations'],
                net_change=stats['net_change'],
                trend=stats['trend'],
                companies=[CompanySummary(
                    siren=c['siren'],
                    name=c['name'],
                    naf_code=c['naf_code'],
                    commune=c['commune'],
                    postal_code=c['postal_code'],
                    size=c['size'],
                    category=c['category']
                ) for c in companies],
                next_actions=_get_next_actions(entities)
            )
        
        # Générer une réponse en langage naturel
        response_message = _generate_response(entities, query_result)
        
        # Créer ou mettre à jour la session
        session_id = request.session_id or ChatSessionManager.create_session()
        if query_result:
            ChatSessionManager.add_query(session_id, request.message, query_result.dict())
        
        return ChatMessageResponse(
            message=response_message,
            entities=entities,
            query_result=query_result,
            next_actions=_get_next_actions(entities) if not query_result else [],
            session_id=session_id
        )
        
    except Exception as e:
        logger.error(f"Erreur dans chat_message: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/searches", response_model=QueryResponse, tags=["Search"])
async def create_search(
    sector_id: Optional[str] = None,
    zone_id: Optional[str] = None,
    naf_code: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    category: Optional[str] = None,
    size: Optional[str] = None,
    is_active: Optional[bool] = True,
    limit: int = 50
):
    """Effectue une recherche selon des critères spécifiques"""
    try:
        companies = data_loader.search_companies(
            sector_id=sector_id,
            zone_id=zone_id,
            naf_code=naf_code,
            date_from=date_from,
            date_to=date_to,
            limit=limit
        )
        
        # Filtrer par catégorie et taille si spécifié
        if category:
            companies = [c for c in companies if c.get('category') == category]
        if size:
            companies = [c for c in companies if c.get('size') == size]
        
        stats = data_loader.get_statistics(
            sector_id=sector_id,
            zone_id=zone_id,
            date_from=date_from,
            date_to=date_to
        )
        
        # Construire les objets sector et zone pour la réponse
        sector_obj = None
        if sector_id:
            sector_obj = {'id': sector_id, 'name': sector_id, 'naf_code': sector_id}
        
        zone_obj = None
        if zone_id:
            zone_obj = {'id': zone_id, 'name': zone_id, 'code': zone_id, 'level': 'region'}
        
        return QueryResponse(
            query=f"Sector: {sector_id}, Zone: {zone_id}",
            sector=sector_obj,
            zone=zone_obj,
            total_companies=stats['total_companies'],
            creations=stats['creations'],
            radiations=stats['radiations'],
            net_change=stats['net_change'],
            trend=stats['trend'],
            companies=[CompanySummary(
                siren=c['siren'],
                name=c['name'],
                naf_code=c['naf_code'],
                commune=c['commune'],
                postal_code=c['postal_code'],
                size=c['size'],
                category=c['category']
            ) for c in companies],
            next_actions=_get_next_actions({'sector': {'id': sector_id}, 'zone': {'id': zone_id}})
        )
        
    except Exception as e:
        logger.error(f"Erreur dans create_search: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/v1/searches/{search_id}", response_model=QueryResponse, tags=["Search"])
async def get_search(search_id: str):
    """Obtient les résultats d'une recherche précédente (mock pour le MVP1)"""
    # Pour le MVP1, on retourne des données mockées
    return QueryResponse(
        query=f"Search {search_id}",
        total_companies=100,
        creations=25,
        radiations=10,
        net_change=15,
        trend="growth",
        next_actions=[
            {"type": "report", "title": "Générer un rapport détaillé", "action": "/reports/generate"},
            {"type": "agent", "title": "Lancer un agent de prospection", "action": "/agents/create"},
            {"type": "followup", "title": "Suivre cette recherche", "action": "/searches/subscribe"}
        ]
    )


# ============================================================================
# MÉTHODES UTILITAIRES
# ============================================================================

@app.post("/v1/extract-entities", tags=["Utils"])
async def extract_entities(request: ChatMessageRequest):
    """Extrait les entités d'un message"""
    entities = data_loader.extract_entities(request.message)
    return {"entities": entities}


def _generate_response(entities: Dict[str, Any], query_result: Optional[QueryResponse] = None) -> str:
    """Génère une réponse en langage naturel"""
    if not query_result:
        if entities.get('confidence', 0) < 0.5:
            return "Votre requête est trop vague. Pouvez-vous préciser le secteur ou la zone géographique ? Par exemple : 'PME du numérique en Bretagne' ou 'restauration à Lyon'"
        return "Je n'ai pas trouvé de données pour cette requête. Essayez une recherche plus spécifique."
    
    parts = []
    
    # Secteur
    if query_result.sector:
        sector_name = query_result.sector.get('name', query_result.sector.get('id', 'ce secteur'))
        parts.append(f"secteur **{sector_name}**")
    
    # Zone
    if query_result.zone:
        zone_name = query_result.zone.get('name', query_result.zone.get('id', 'cette zone'))
        parts.append(f"zone **{zone_name}**")
    
    # Statistiques
    parts.append(f"j'ai trouvé **{query_result.total_companies}** entreprises correspondantes")
    
    if query_result.creations > 0:
        parts.append(f"avec **{query_result.creations}** créations estimées")
    
    if query_result.net_change != 0:
        sign = "+" if query_result.net_change > 0 else ""
        parts.append(f"et un changement net de **{sign}{query_result.net_change}** (tendance : {query_result.trend})")
    
    # Chiffres clés
    if query_result.companies:
        active_count = sum(1 for c in query_result.companies if c.category == 'PME')
        if active_count > 0:
            pct = (active_count / len(query_result.companies)) * 100
            parts.append(f"dont environ **{pct:.0f}%** de PME")
    
    # Prochaines actions
    if query_result.next_actions:
        parts.append("\nProchaines actions suggérées :")
        for i, action in enumerate(query_result.next_actions, 1):
            parts.append(f"  {i}. {action.get('title', action.get('type', 'Action'))}")
    
    return " ".join(parts)


def _get_next_actions(entities: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Génère les prochaines actions suggérées"""
    actions = [
        {
            "type": "report",
            "title": "Générer un rapport détaillé",
            "description": f"Créer un rapport complet sur {entities.get('sector', {}).get('name', '') or entities.get('zone', {}).get('name', '') or 'cette recherche'}",
            "action": "/reports/generate"
        },
        {
            "type": "agent",
            "title": "Lancer un agent de prospection",
            "description": "Automatiser la prospection des entreprises trouvées",
            "action": "/agents/create"
        },
        {
            "type": "followup",
            "title": "Suivre cette recherche",
            "description": "Recevoir des notifications sur les mises à jour",
            "action": "/searches/subscribe"
        }
    ]
    
    # Personnaliser selon les entités
    if entities.get('sector'):
        actions[0]['description'] = f"Créer un rapport sur le secteur {entities['sector']['name']}"
    if entities.get('zone'):
        actions[1]['description'] = f"Prospecter les entreprises en {entities['zone']['name']}"
    
    return actions


# ============================================================================
# POUR DÉMARRER
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
