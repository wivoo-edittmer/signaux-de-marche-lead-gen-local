"""
Data Loader pour B2Bmax - MVP1

Ce module charge et traite les données INSEE locales depuis les fichiers CSV
présents dans /Users/mathurinbody/Documents/workspaces/wivooxmistral/data/

Utilisation pour le MVP1 : pas d'appel à l'API INSEE, uniquement données locales.
"""

import csv
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class Company:
    """Représente une entreprise avec les données INSEE"""
    siren: str
    name: str
    siret: Optional[str] = None
    legal_form: Optional[str] = None
    date_created: Optional[str] = None
    date_radiated: Optional[str] = None
    sector_id: Optional[str] = None
    naf_code: Optional[str] = None
    zone_id: Optional[str] = None
    commune: Optional[str] = None
    postal_code: Optional[str] = None
    address: Optional[str] = None
    size: Optional[str] = None
    category: Optional[str] = None
    is_active: bool = True


@dataclass
class Sector:
    """Représente un secteur d'activité (NAF)"""
    id: str
    naf_code: str
    name: str
    description: str
    level: int
    parent_id: Optional[str] = None


@dataclass
class Zone:
    """Représente une zone géographique"""
    id: str
    code: str
    name: str
    level: str  # region, department, commune
    parent_id: Optional[str] = None


@dataclass
class QueryResult:
    """Résultat d'une requête de recherche"""
    total_companies: int
    creations: int
    radiations: int
    net_change: int
    trend: str
    sector_id: str
    sector_name: str
    zone_id: Optional[str]
    zone_name: Optional[str]
    period_start: str
    period_end: str
    companies: List[Company]


class INSEEDataLoader:
    """
    Chargeur de données INSEE locales pour B2Bmax.
    
    Utilise les fichiers suivants:
    - /data/StockUniteLegale_utf8.csv ou /data/extract/StockUniteLegale_extract.csv
    - /data/StockEtablissement_utf8.csv ou /data/extract/stockEtablissement_extract.csv
    - /data/sectors.json (secteurs NAF de référence)
    - /data/zones.json (zones géographiques de référence)
    """
    
    # Mapping NAF division (2 chiffres) -> Section (lettre) - Nomenclature NAF 2008
    NAF_DIVISION_TO_SECTION = {
        '01': 'A', '02': 'A', '03': 'A',
        '05': 'B', '06': 'B', '07': 'B', '08': 'B', '09': 'B',
        '10': 'C', '11': 'C', '12': 'C', '13': 'C', '14': 'C', '15': 'C', '16': 'C',
        '17': 'C', '18': 'C', '19': 'C', '20': 'C', '21': 'C', '22': 'C', '23': 'C',
        '24': 'C', '25': 'C', '26': 'C', '27': 'C', '28': 'C', '29': 'C', '30': 'C',
        '31': 'C', '32': 'C', '33': 'C',
        '35': 'D',
        '36': 'E', '37': 'E', '38': 'E', '39': 'E',
        '41': 'F', '42': 'F', '43': 'F',
        '45': 'G', '46': 'G', '47': 'G',
        '49': 'H', '50': 'H', '51': 'H', '52': 'H', '53': 'H',
        '55': 'I', '56': 'I',
        '58': 'J', '59': 'J', '60': 'J', '61': 'J', '62': 'J', '63': 'J',
        '64': 'K', '65': 'K', '66': 'K',
        '68': 'L',
        '69': 'M', '70': 'M', '71': 'M', '72': 'M', '73': 'M', '74': 'M', '75': 'M',
        '77': 'N', '78': 'N', '79': 'N', '80': 'N', '81': 'N', '82': 'N',
        '84': 'O',
        '85': 'P',
        '86': 'Q', '87': 'Q', '88': 'Q',
        '90': 'R', '91': 'R', '92': 'R', '93': 'R',
        '94': 'S', '95': 'S', '96': 'S',
        '97': 'T', '98': 'T',
        '99': 'U',
    }
    
    # Chemins vers les fichiers de données
    BASE_DATA_DIR = Path("/Users/mathurinbody/Documents/workspaces/wivooxmistral/data")
    
    def __init__(self):
        self.companies: List[Company] = []
        self.sectors: Dict[str, Sector] = {}
        self.zones: Dict[str, Zone] = {}
        self._loaded = False
        
    def load(self) -> None:
        """Charge toutes les données locales"""
        if self._loaded:
            return
            
        logger.info("Chargement des données locales INSEE...")
        
        # Charger les secteurs de référence
        self._load_sectors()
        
        # Charger les zones de référence
        self._load_zones()
        
        # Charger les entreprises depuis les CSV
        self._load_companies()
        
        self._loaded = True
        logger.info(f"Données chargées: {len(self.companies)} entreprises, {len(self.sectors)} secteurs, {len(self.zones)} zones")
    
    def _load_sectors(self) -> None:
        """Charge les secteurs depuis sectors.json"""
        sectors_path = self.BASE_DATA_DIR / "sectors.json"
        if sectors_path.exists():
            with open(sectors_path, 'r', encoding='utf-8') as f:
                sectors_data = json.load(f)
                for s in sectors_data:
                    sector = Sector(
                        id=s['id'],
                        naf_code=s['naf_code'],
                        name=s['name'],
                        description=s.get('description', ''),
                        level=s.get('level', 1),
                        parent_id=s.get('parent_id')
                    )
                    self.sectors[sector.id] = sector
        else:
            logger.warning(f"Fichier {sectors_path} non trouvé. Utilisation des secteurs par défaut.")
            # Créer des secteurs par défaut
            default_sectors = [
                {"id": "56", "naf_code": "56", "name": "Restauration", "level": 1},
                {"id": "62", "naf_code": "62", "name": "Programmation informatique", "level": 2},
                {"id": "J", "naf_code": "J", "name": "Information et communication", "level": 1}
            ]
            for s in default_sectors:
                sector = Sector(
                    id=s['id'],
                    naf_code=s['naf_code'],
                    name=s['name'],
                    description="",
                    level=s.get('level', 1)
                )
                self.sectors[sector.id] = sector
    
    def _load_zones(self) -> None:
        """Charge les zones depuis zones.json"""
        zones_path = self.BASE_DATA_DIR / "zones.json"
        if zones_path.exists():
            with open(zones_path, 'r', encoding='utf-8') as f:
                zones_data = json.load(f)
                for z in zones_data:
                    zone = Zone(
                        id=z['id'],
                        code=z['code'],
                        name=z['name'],
                        level=z['level'],
                        parent_id=z.get('parent_id')
                    )
                    self.zones[zone.id] = zone
        else:
            logger.warning(f"Fichier {zones_path} non trouvé. Utilisation des zones par défaut.")
            # Créer des zones par défaut
            default_zones = [
                {"id": "BRE", "code": "BRE", "name": "Bretagne", "level": "region"},
                {"id": "69", "code": "69", "name": "Rhône", "level": "department"},
                {"id": "69001", "code": "69001", "name": "Lyon 1er", "level": "commune", "parent_id": "69"}
            ]
            for z in default_zones:
                zone = Zone(
                    id=z['id'],
                    code=z['code'],
                    name=z['name'],
                    level=z['level'],
                    parent_id=z.get('parent_id')
                )
                self.zones[zone.id] = zone
    
    def _load_companies(self) -> None:
        """Charge les entreprises depuis les fichiers CSV"""
        # Essayer d'abord avec les extraits 10000 (MVP1)
        extract_10k_path = self.BASE_DATA_DIR / "StockUniteLegale_extract_10000.csv"
        extract_small_path = self.BASE_DATA_DIR / "extract" / "StockUniteLegale_extract.csv"
        full_path = self.BASE_DATA_DIR / "StockUniteLegale_utf8.csv"
        
        # Priorité: extract_10000 > extract > full
        if extract_10k_path.exists():
            data_path = extract_10k_path
        elif extract_small_path.exists():
            data_path = extract_small_path
        else:
            data_path = full_path
        
        if not data_path.exists():
            logger.error(f"Aucun fichier de données entreprises trouvé: {extract_10k_path}, {extract_small_path} ou {full_path}")
            return
        
        logger.info(f"Chargement des entreprises depuis: {data_path}")
        
        with open(data_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader):
                # Extraire les informations de base
                siren = row.get('siren', '')
                if not siren:
                    continue
                    
                # Normaliser le code NAF (enlever les espaces et majuscules)
                naf_code = row.get('activitePrincipaleUniteLegale', '')
                if naf_code:
                    naf_code = naf_code.replace('.', '').upper()
                
                # Déterminer le secteur
                sector_id = self._map_naf_to_sector(naf_code)
                
                # Déterminer la catégorie
                category = row.get('categorieEntreprise', '')
                
                # Déterminer la taille
                tranche_effectifs = row.get('trancheEffectifsUniteLegale', '')
                size = self._map_tranche_to_size(tranche_effectifs)
                
                company = Company(
                    siren=siren,
                    name=row.get('denominationUniteLegale', '') or row.get('nomUniteLegale', ''),
                    legal_form=row.get('categorieJuridiqueUniteLegale', ''),
                    date_created=row.get('dateCreationUniteLegale', ''),
                    date_radiated=None,  # À compléter depuis etatAdministratif
                    sector_id=sector_id,
                    naf_code=naf_code,
                    zone_id=None,  # À compléter depuis l'établissement
                    commune=None,
                    postal_code=None,
                    address=None,
                    size=size,
                    category=category,
                    is_active=row.get('etatAdministratifUniteLegale', '') == 'A'
                )
                self.companies.append(company)
                
                # Limiter le chargement pour le MVP1 (10000 entreprises max)
                if i >= 10000:
                    logger.info(f"Limite atteinte: {i} entreprises chargées")
                    break
        
        # Charger les établissements pour compléter les adresses
        self._load_establishments()
        
        logger.info(f"Total entreprises chargées: {len(self.companies)}")
    
    def _load_establishments(self) -> None:
        """Charge les établissements pour compléter les adresses des entreprises"""
        extract_10k_path = self.BASE_DATA_DIR / "StockEtablissement_extract_10000.csv"
        extract_small_path = self.BASE_DATA_DIR / "extract" / "stockEtablissement_extract.csv"
        full_path = self.BASE_DATA_DIR / "StockEtablissement_utf8.csv"
        
        # Priorité: extract_10000 > extract > full
        if extract_10k_path.exists():
            data_path = extract_10k_path
        elif extract_small_path.exists():
            data_path = extract_small_path
        else:
            data_path = full_path
        
        if not data_path.exists():
            logger.warning(f"Fichier établissements non trouvé: {extract_10k_path}, {extract_small_path} ou {full_path}")
            return
        
        logger.info(f"Chargement des établissements depuis: {data_path}")
        
        # Créer un index SIREN -> Company
        siren_to_company = {c.siren: c for c in self.companies}
        
        with open(data_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                siren = row.get('siren', '')
                if siren in siren_to_company:
                    company = siren_to_company[siren]
                    # Mettre à jour avec les données de l'établissement
                    company.siret = row.get('siret', '')
                    company.address = self._format_address(row)
                    company.postal_code = row.get('codePostalEtablissement', '')
                    company.commune = row.get('libelleCommuneEtablissement', '')
                    commune_code = row.get('codeCommuneEtablissement', '')
                    company.zone_id = self._map_commune_to_zone(commune_code)
    
    def _format_address(self, row: Dict[str, str]) -> str:
        """Formate l'adresse à partir des données de l'établissement"""
        parts = []
        
        #Numéro et type de voie
        if row.get('numeroVoieEtablissement'):
            parts.append(row['numeroVoieEtablissement'])
        if row.get('typeVoieEtablissement'):
            parts.append(row['typeVoieEtablissement'])
        if row.get('libelleVoieEtablissement'):
            parts.append(row['libelleVoieEtablissement'])
        
        # Complément d'adresse
        if row.get('complementAdresseEtablissement'):
            parts.append(row['complementAdresseEtablissement'])
        
        return ' '.join(parts) if parts else None
    
    def _map_commune_to_zone(self, commune_code: str) -> Optional[str]:
        """Mappe un code commune INSEE (5 chiffres) vers une zone de référence.
        
        Stratégie:
        1. Chercher la commune exacte dans les zones
        2. Sinon, chercher le département (2 premiers chiffres)
        3. Sinon, retourner le département (2 premiers chiffres) même s'il n'existe pas
        """
        if not commune_code or len(commune_code) < 2:
            return None
        
        # 1. Chercher la commune exacte
        if commune_code in self.zones:
            zone = self.zones[commune_code]
            if zone.level == 'commune':
                return commune_code
        
        # 2. Chercher le département (2 premiers chiffres)
        dept_code = commune_code[:2]
        if dept_code in self.zones:
            zone = self.zones[dept_code]
            if zone.level == 'department':
                return dept_code
        
        # 3. Retourner le département même s'il n'existe pas dans les zones
        # Cela permet au moins de filtrer par département
        return dept_code
    
    def _map_naf_to_sector(self, naf_code: str) -> Optional[str]:
        """Mappe un code NAF à un secteur de référence.
        
        Gère les formats INSEE:
        - "6201Z" -> "62.01Z" ou "62"
        - "5610A" -> "56.10A" ou "56"
        - "J" -> "J"
        """
        if not naf_code:
            return None
        
        naf_code = naf_code.upper().strip()
        
        # Normaliser: enlever les points pour la comparaison
        naf_no_dots = naf_code.replace('.', '')
        
        # 1. Chercher une correspondance exacte (avec ou sans points)
        for sector in self.sectors.values():
            sector_no_dots = sector.naf_code.replace('.', '')
            if naf_no_dots == sector_no_dots:
                return sector.id
        
        # 2. Essayer de trouver un secteur parent
        # Pour un code comme "6201Z", essayer "62" (2 premiers chiffres)
        if len(naf_no_dots) >= 2:
            # Essayer les 2 premiers caractères (niveau division)
            prefix_2 = naf_no_dots[:2]
            for sector in self.sectors.values():
                sector_no_dots = sector.naf_code.replace('.', '')
                if sector_no_dots == prefix_2:
                    return sector.id
        
        # 3. Essayer la première lettre (niveau section)
        if len(naf_no_dots) >= 1:
            first_char = naf_no_dots[0]
            for sector in self.sectors.values():
                sector_no_dots = sector.naf_code.replace('.', '')
                if sector_no_dots == first_char:
                    return sector.id
        
        # 4. Essayer de reconstruire le format avec points
        # "6201Z" -> "62.01Z"
        if len(naf_no_dots) == 5 and naf_no_dots[:4].isdigit() and naf_no_dots[4].isalpha():
            formatted = f"{naf_no_dots[:2]}.{naf_no_dots[2:4]}{naf_no_dots[4]}"
            for sector in self.sectors.values():
                if sector.naf_code == formatted:
                    return sector.id
        
        return None
    
    def _map_tranche_to_size(self, tranche: str) -> Optional[str]:
        """Mappe la tranche d'effectifs à une taille"""
        if not tranche:
            return None
        
        tranche_mappings = {
            'NN': 'unknown',
            '00': 'micro',
            '01': 'micro',
            '02': 'micro',
            '03': 'small',
            '04': 'small',
            '05': 'small',
            '11': 'medium',
            '12': 'medium',
            '21': 'medium',
            '22': 'large',
            '31': 'large',
            '32': 'large',
            '41': 'large',
            '42': 'very_large',
            '51': 'very_large',
        }
        
        return tranche_mappings.get(tranche, 'unknown')
    
    def search_companies(
        self,
        sector_id: Optional[str] = None,
        zone_id: Optional[str] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        category: Optional[str] = None,
        size: Optional[str] = None
    ) -> List[Company]:
        """
        Recherche des entreprises selon des critères.
        
        Args:
            sector_id: ID ou code NAF du secteur
            zone_id: ID ou code de la zone géographique
            date_from: Date de début (YYYY-MM-DD)
            date_to: Date de fin (YYYY-MM-DD)
            category: Catégorie d'entreprise (PME, etc.)
            size: Taille (micro, small, medium, large)
        
        Returns:
            Liste des entreprises correspondantes
        """
        if not self._loaded:
            self.load()
        
        results = []
        for company in self.companies:
            # Filtrer par secteur
            if sector_id and company.sector_id != sector_id:
                # Vérifier si le secteur de l'entreprise est un enfant du secteur demandé
                if not self._is_child_sector(company.sector_id, sector_id):
                    continue
            
            # Filtrer par zone
            if zone_id and company.zone_id != zone_id:
                # Vérifier si la zone est dans la hiérarchie
                if not self._is_child_zone(company.zone_id, zone_id):
                    continue
            
            # Filtrer par date de création
            if date_from and company.date_created:
                if company.date_created < date_from:
                    continue
            if date_to and company.date_created:
                if company.date_created > date_to:
                    continue
            
            # Filtrer par catégorie
            if category and company.category != category:
                continue
            
            # Filtrer par taille
            if size and company.size != size:
                continue
            
            results.append(company)
        
        return results
    
    def _is_child_sector(self, sector_id: str, parent_id: str) -> bool:
        """Vérifie si sector_id est un enfant de parent_id"""
        if sector_id == parent_id:
            return True
        
        current = self.sectors.get(sector_id)
        while current:
            if current.id == parent_id:
                return True
            if current.parent_id:
                current = self.sectors.get(current.parent_id)
            else:
                break
        
        return False
    
    def _is_child_zone(self, zone_id: str, parent_id: str) -> bool:
        """Vérifie si zone_id est un enfant de parent_id"""
        if zone_id == parent_id:
            return True
        
        current = self.zones.get(zone_id)
        while current:
            if current.id == parent_id:
                return True
            if current.parent_id:
                current = self.zones.get(current.parent_id)
            else:
                break
        
        return False
    
    def get_statistics(
        self,
        sector_id: Optional[str] = None,
        zone_id: Optional[str] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calcule les statistiques pour une recherche.
        
        Returns:
            Dictionnaire avec les statistiques (total, créations, radiations, etc.)
        """
        from datetime import datetime, timedelta
        
        companies = self.search_companies(
            sector_id=sector_id,
            zone_id=zone_id,
            date_from=date_from,
            date_to=date_to
        )
        
        total = len(companies)
        
        # Définir la période par défaut: 12 derniers mois
        if not date_from or not date_to:
            date_to = datetime.now().strftime('%Y-%m-%d')
            date_from = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')
        
        # Compter les créations dans la période
        creations = 0
        for company in companies:
            if company.date_created:
                try:
                    # Gérer différents formats de date
                    date_str = company.date_created[:10]  # YYYY-MM-DD
                    if date_from <= date_str <= date_to:
                        creations += 1
                except (ValueError, TypeError):
                    pass
        
        # Compter les entreprises actives vs inactives
        active_count = sum(1 for c in companies if c.is_active)
        
        # Pour le MVP1, on estime les radiations comme un ratio des créations
        # (dans la réalité, on utiliserait les dates de radiation)
        radiations = int(creations * 0.4)  # Ratio estimé
        net_change = creations - radiations
        
        trend = "growth" if net_change > 0 else "decline" if net_change < 0 else "stable"
        
        return {
            "total_companies": total,
            "active_companies": active_count,
            "creations": creations,
            "radiations": radiations,
            "net_change": net_change,
            "trend": trend,
            "period_start": date_from,
            "period_end": date_to,
            "sector_id": sector_id,
            "zone_id": zone_id,
            "companies": companies
        }
    
    def get_sector_by_name(self, name: str) -> Optional[Sector]:
        """Trouve un secteur par son nom"""
        if not self._loaded:
            self.load()
        
        name_lower = name.lower()
        for sector in self.sectors.values():
            if name_lower in sector.name.lower() or name_lower in sector.naf_code.lower():
                return sector
        return None
    
    def get_zone_by_name(self, name: str) -> Optional[Zone]:
        """Trouve une zone par son nom"""
        if not self._loaded:
            self.load()
        
        name_lower = name.lower()
        for zone in self.zones.values():
            if name_lower in zone.name.lower() or name_lower in zone.code.lower():
                return zone
        return None
    
    def extract_entities(self, query: str) -> Dict[str, Any]:
        """
        Extrait les entités (secteur, zone, période) d'une requête en langage naturel.
        
        Cette méthode est appelée par Mistral pour traiter les requêtes utilisateurs.
        """
        # Normaliser la requête
        query_lower = query.lower()
        
        # Initialiser les résultats
        result = {
            "query": query,
            "sector": None,
            "zone": None,
            "period": "12 derniers mois",
            "confidence": 0.8
        }
        
        # Mots-clés pour les secteurs (avec priorité)
        sector_keywords = {
            "J": ["numérique", "informatique", "digital", "web", "internet", "logiciel", 
                  "information", "communication", "télécom", "technologie", "tech", "saas",
                  "programmation", "développement", "software", "data", "cloud"],
            "62": ["programmation", "informatique", "logiciel", "développement", "code", "software"],
            "56": ["restauration", "restaurant", "café", "bar", "hôtel", "hôtellerie", 
                   "traiteur", "brasserie", "fast-food", "fastfood", "cuisine", "alimentaire"],
            "G": ["commerce", "boutique", "magasin", "vente", "achat", "retail", "e-commerce",
                  "ecommerce", "distribution", "supermarché", "grande distribution"],
            "47": ["commerce de détail", "boutique", "magasin", "vente au détail"],
        }
        
        # Extraire le secteur (par ordre de priorité)
        for sector_id, keywords in sector_keywords.items():
            if sector_id not in self.sectors:
                continue
            for keyword in keywords:
                if keyword in query_lower:
                    sector = self.sectors[sector_id]
                    result["sector"] = {
                        "id": sector.id,
                        "name": sector.name,
                        "naf_code": sector.naf_code
                    }
                    break
            if result["sector"]:
                break
        
        # Si pas de secteur trouvé par mots-clés, essayer par nom/code NAF
        if not result["sector"]:
            for sector in self.sectors.values():
                keywords = [
                    sector.name.lower(),
                    sector.naf_code.lower(),
                    sector.naf_code.lower().replace('.', '')
                ]
                for keyword in keywords:
                    if keyword and keyword in query_lower:
                        result["sector"] = {
                            "id": sector.id,
                            "name": sector.name,
                            "naf_code": sector.naf_code
                        }
                        break
                if result["sector"]:
                    break
        
        # Mots-clés pour les zones
        zone_keywords = {
            "BRE": ["bretagne", "bre", "rennes", "brest", "quimper", "vannes", "saint-brieuc"],
            "35": ["ille-et-vilaine", "ille et vilaine", "rennes"],
            "29": ["finistère", "finistere", "brest", "quimper"],
            "22": ["côtes-d'armor", "cotes-d'armor", "cotes d'armor", "saint-brieuc"],
            "56": ["morbihan", "vannes", "lorient"],
            "IDF": ["île-de-france", "ile-de-france", "idf", "paris", "parisien"],
            "75": ["paris"],
            "69": ["rhône", "rhone", "lyon"],
            "69001": ["lyon 1er", "lyon 1"],
            "69002": ["lyon 2ème", "lyon 2", "lyon"],
        }
        
        # Extraire la zone (par ordre de priorité - régions d'abord)
        for zone_id, keywords in zone_keywords.items():
            if zone_id not in self.zones:
                continue
            for keyword in keywords:
                if keyword in query_lower:
                    zone = self.zones[zone_id]
                    result["zone"] = {
                        "id": zone.id,
                        "name": zone.name,
                        "code": zone.code
                    }
                    break
            if result["zone"]:
                break
        
        # Si pas de zone trouvée par mots-clés, essayer par nom/code
        if not result["zone"]:
            for zone in self.zones.values():
                keywords = [
                    zone.name.lower(),
                    zone.code.lower()
                ]
                for keyword in keywords:
                    if keyword and keyword in query_lower:
                        result["zone"] = {
                            "id": zone.id,
                            "name": zone.name,
                            "code": zone.code
                        }
                        break
                if result["zone"]:
                    break
        
        # Extraire la période (simplifié pour le MVP1)
        if "2023" in query_lower:
            result["period"] = "2023"
        elif "2024" in query_lower:
            result["period"] = "2024"
        elif "trimestre" in query_lower or "3 mois" in query_lower:
            result["period"] = "3 derniers mois"
        elif "semaine" in query_lower or "7 jours" in query_lower:
            result["period"] = "7 derniers jours"
        
        return result


# Instance globale du chargeur
_data_loader = None


def get_data_loader() -> INSEEDataLoader:
    """Retourne l'instance globale du chargeur de données"""
    global _data_loader
    if _data_loader is None:
        _data_loader = INSEEDataLoader()
        _data_loader.load()
    return _data_loader


# Utilitaire pour réinitialiser (utile pour les tests)
def reset_data_loader():
    """Réinitialise le chargeur de données"""
    global _data_loader
    if _data_loader is not None:
        _data_loader._loaded = False


if __name__ == "__main__":
    # Test du chargeur
    loader = get_data_loader()
    
    print("\n=== Données chargées ===")
    print(f"Secteurs: {len(loader.sectors)}")
    print(f"Zones: {len(loader.zones)}")
    print(f"Entreprises: {len(loader.companies)}")
    
    # Test de recherche
    print("\n=== Test recherche: Restauration à Lyon ===")
    stats = loader.get_statistics(sector_id="56", zone_id="69")
    print(f"Total: {stats['total_companies']}")
    print(f"Créations: {stats['creations']}")
    print(f"Radiations: {stats['radiations']}")
    print(f"Net change: {stats['net_change']}")
    print(f"Tendance: {stats['trend']}")
    
    # Test extraction d'entités
    print("\n=== Test extraction: 'PME numérique Bretagne' ===")
    entities = loader.extract_entities("PME numérique Bretagne")
    print(json.dumps(entities, indent=2, ensure_ascii=False))
