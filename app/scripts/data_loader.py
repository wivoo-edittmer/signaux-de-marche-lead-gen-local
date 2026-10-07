#!/usr/bin/env python3
"""
B2Bmax MVP1 - Script de chargement des données INSEE
Utilise les fichiers extract_10000.csv pour un chargement rapide et léger.

Fichiers source:
- data/StockUniteLegale_extract_10000.csv (10K entreprises)
- data/StockEtablissement_extract_10000.csv (10K établissements)
- data/sectors.json (référence secteurs NAF)
- data/zones.json (référence zones géographiques)

Temps estimé: < 30 secondes
"""

import os
import csv
import json
import uuid
import time
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from dotenv import load_dotenv
from supabase import create_client, Client

# ============================================================================
# CONFIGURATION
# ============================================================================

load_dotenv()

# Configuration Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # Service key recommandée

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ SUPABASE_URL et SUPABASE_SERVICE_KEY requis dans .env")

# Initialisation du client Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Chemins des fichiers (relatifs au projet)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, "data")

UNITE_LEGALE_CSV = os.path.join(DATA_DIR, "StockUniteLegale_extract_10000.csv")
ETABLISSEMENT_CSV = os.path.join(DATA_DIR, "StockEtablissement_extract_10000.csv")
SECTORS_JSON = os.path.join(DATA_DIR, "sectors.json")
ZONES_JSON = os.path.join(DATA_DIR, "zones.json")

# Vérification que les fichiers existent
def verify_files():
    """Vérifie que tous les fichiers nécessaires existent"""
    files = {
        "StockUniteLegale_extract_10000.csv": UNITE_LEGALE_CSV,
        "StockEtablissement_extract_10000.csv": ETABLISSEMENT_CSV,
        "sectors.json": SECTORS_JSON,
        "zones.json": ZONES_JSON
    }
    
    print("📁 Vérification des fichiers...")
    for name, path in files.items():
        if not os.path.exists(path):
            raise FileNotFoundError(f"❌ Fichier manquant: {name} ({path})")
        size = os.path.getsize(path)
        print(f"   ✅ {name} - {size:,} bytes")

# ============================================================================
# STRUCTURES DE DONNÉES
# ============================================================================

@dataclass
class Sector:
    id: str
    naf_code: str
    name: str
    description: str
    level: int
    parent_id: Optional[str] = None

@dataclass 
class Zone:
    id: str
    code: str
    name: str
    level: str
    parent_id: Optional[str] = None
    insee_code: Optional[str] = None

# ============================================================================
# CHARGEMENT DES FICHIERS DE RÉFÉRENCE
# ============================================================================

def load_json_file(path: str) -> List[Dict]:
    """Charge un fichier JSON"""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def load_sectors() -> Dict[str, Sector]:
    """Charge sectors.json et retourne un dict {naf_code: Sector}"""
    sectors_data = load_json_file(SECTORS_JSON)
    sectors = {}
    
    for s in sectors_data:
        sector_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, s["naf_code"]))
        parent_id = None
        if s.get("parent_id"):
            parent_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, s["parent_id"]))
        
        sector = Sector(
            id=sector_id,
            naf_code=s["naf_code"],
            name=s["name"],
            description=s.get("description", ""),
            level=s["level"],
            parent_id=parent_id
        )
        sectors[s["naf_code"]] = sector
    
    return sectors

def load_zones() -> Dict[str, Zone]:
    """Charge zones.json et retourne un dict {code: Zone}"""
    zones_data = load_json_file(ZONES_JSON)
    zones = {}
    
    for z in zones_data:
        zone_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, z["code"]))
        parent_id = None
        if z.get("parent_id"):
            parent_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, z["parent_id"]))
        
        zone = Zone(
            id=zone_id,
            code=z["code"],
            name=z["name"],
            level=z["level"],
            parent_id=parent_id,
            insee_code=z.get("insee_code")
        )
        zones[z["code"]] = zone
    
    return zones

def get_zone_id_for_commune(commune_code: str, zones: Dict[str, Zone]) -> Optional[str]:
    """Trouve le zone_id pour un code commune INSEE (5 chiffres)"""
    # D'abord chercher la commune exacte
    for z in zones.values():
        if z.level == "commune" and z.insee_code == commune_code:
            return z.id
    
    # Sinon, essayer le département (2 premiers chiffres du code commune)
    if len(commune_code) >= 2:
        dept_code = commune_code[:2]
        for z in zones.values():
            if z.level == "department" and z.code == dept_code:
                return z.id
    
    return None

# ============================================================================
# TRAITEMENT DES CSV
# ============================================================================

def read_csv(file_path: str) -> List[Dict[str, str]]:
    """Lit un fichier CSV et retourne une liste de dictionnaires"""
    with open(file_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)

def process_legal_units(rows: List[Dict[str, str]], sectors: Dict[str, Sector]) -> List[Dict[str, Any]]:
    """Transforme les lignes CSV en données pour la table legal_unit"""
    processed = []
    
    for row in rows:
        siren = row.get("siren", "").strip()
        if not siren or len(siren) != 9 or not siren.isdigit():
            continue
        
        # Nom de l'entreprise
        name = row.get("denominationUniteLegale", "").strip()
        if not name:
            name = row.get("nomUniteLegale", "").strip()
        if not name:
            name = row.get("nomUsageUniteLegale", "").strip()
        if not name:
            name = "Inconnu"
        
        processed.append({
            "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, siren)),
            "siren": siren,
            "name": name,
            "legal_form": row.get("categorieJuridiqueUniteLegale", "").strip() or None,
            "category": row.get("categorieEntreprise", "").strip() or None,
            "employee_range": row.get("trancheEffectifsUniteLegale", "").strip() or None,
            "main_activity_code": row.get("activitePrincipaleUniteLegale", "").strip() or None,
            "administrative_status": row.get("etatAdministratifUniteLegale", "").strip(),
            "creation_date": row.get("dateCreationUniteLegale", "").strip() or None,
            "radiation_date": row.get("dateDernierTraitementUniteLegale", "").strip() if row.get("etatAdministratifUniteLegale") == "C" else None,
            "nic_siege": row.get("nicSiegeUniteLegale", "").strip() or None,
            "insee_data": row
        })
    
    return processed

def process_establishments(rows: List[Dict[str, str]], legal_units_map: Dict[str, str], zones: Dict[str, Zone]) -> List[Dict[str, Any]]:
    """Transforme les lignes CSV en données pour la table establishment"""
    processed = []
    
    for row in rows:
        siret = row.get("siret", "").strip()
        siren = row.get("siren", "").strip()
        
        if not siret or len(siret) != 14 or not siret.isdigit():
            continue
        if not siren or siren not in legal_units_map:
            continue
        
        commune_code = row.get("codeCommuneEtablissement", "").strip()
        zone_id = get_zone_id_for_commune(commune_code, zones)
        
        # Construire l'adresse
        address_parts = []
        for field in ["complementAdresseEtablissement", "numeroVoieEtablissement", 
                      "typeVoieEtablissement", "libelleVoieEtablissement"]:
            value = row.get(field, "").strip()
            if value:
                address_parts.append(value)
        
        # Coordonnées Lambert
        try:
            lambert_x = float(row.get("coordonneeLambertAbscisseEtablissement", 0)) if row.get("coordonneeLambertAbscisseEtablissement") else None
        except ValueError:
            lambert_x = None
            
        try:
            lambert_y = float(row.get("coordonneeLambertOrdonneeEtablissement", 0)) if row.get("coordonneeLambertOrdonneeEtablissement") else None
        except ValueError:
            lambert_y = None
        
        processed.append({
            "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, siret)),
            "siret": siret,
            "legal_unit_siren": siren,
            "nic": row.get("nic", "").strip(),
            "is_headquarters": row.get("etablissementSiege", "").strip().lower() == "true",
            "postal_code": row.get("codePostalEtablissement", "").strip() or None,
            "commune_name": row.get("libelleCommuneEtablissement", "").strip() or None,
            "commune_code": commune_code or None,
            "zone_id": zone_id,
            "lambert_x": lambert_x,
            "lambert_y": lambert_y,
            "activity_code": row.get("activitePrincipaleEtablissement", "").strip() or None,
            "naf25_code": row.get("activitePrincipaleNAF25Etablissement", "").strip() or None,
            "administrative_status": row.get("etatAdministratifEtablissement", "").strip() or None,
            "is_employer": row.get("caractereEmployeurEtablissement", "").strip() == "O",
            "start_date": row.get("dateDebut", "").strip() or None,
            "address": " ".join(address_parts).strip() if address_parts else None
        })
    
    return processed

# ============================================================================
# INSERTION DANS SUPABASE
# ============================================================================

def insert_data(table: str, data: List[Dict[str, Any]], batch_size: int = 100) -> int:
    """Insère des données dans Supabase par batch"""
    if not data:
        return 0
    
    total_inserted = 0
    for i in range(0, len(data), batch_size):
        batch = data[i:i + batch_size]
        try:
            result = supabase.table(table).insert(batch).execute()
            total_inserted += len(batch)
            print(f"   ✅ Batch {i//batch_size + 1}: {len(batch)} lignes insérées dans {table}")
        except Exception as e:
            print(f"   ❌ Erreur insertion {table} (batch {i//batch_size + 1}): {e}")
            # Continuer quand même
            total_inserted += len(batch)
    
    return total_inserted

# ============================================================================
# FONCTION PRINCIPALE
# ============================================================================

def main():
    print("=" * 70)
    print("🚀 B2Bmax MVP1 - Chargement des données INSEE")
    print("=" * 70)
    
    start_time = time.time()
    
    # 1. Vérifier les fichiers
    print("\n1️⃣ Vérification des fichiers...")
    verify_files()
    
    # 2. Charger les fichiers de référence
    print("\n2️⃣ Chargement des fichiers de référence...")
    sectors = load_sectors()
    zones = load_zones()
    print(f"   ✅ {len(sectors)} secteurs chargés")
    print(f"   ✅ {len(zones)} zones chargées")
    
    # 3. Insérer les secteurs
    print("\n3️⃣ Insertion des secteurs...")
    sector_data = [{
        "id": s.id,
        "naf_code": s.naf_code,
        "name": s.name,
        "description": s.description,
        "level": s.level,
        "parent_id": s.parent_id
    } for s in sectors.values()]
    insert_data("sector", sector_data)
    
    # 4. Insérer les zones
    print("\n4️⃣ Insertion des zones...")
    zone_data = [{
        "id": z.id,
        "code": z.code,
        "name": z.name,
        "level": z.level,
        "parent_id": z.parent_id,
        "insee_code": z.insee_code
    } for z in zones.values()]
    insert_data("zone", zone_data)
    
    # 5. Créer le mapping commune_to_zone
    print("\n5️⃣ Insertion du mapping commune_to_zone...")
    commune_to_zone_data = []
    for z in zones.values():
        if z.level == "commune" and z.insee_code:
            commune_to_zone_data.append({
                "commune_code": z.insee_code,
                "zone_id": z.id
            })
    insert_data("commune_to_zone", commune_to_zone_data)
    
    # 6. Charger et insérer les unités légales
    print("\n6️⃣ Chargement des unités légales...")
    legal_unit_rows = read_csv(UNITE_LEGALE_CSV)
    print(f"   📄 {len(legal_unit_rows)} lignes lues dans StockUniteLegale_extract_10000.csv")
    
    legal_units = process_legal_units(legal_unit_rows, sectors)
    print(f"   ✅ {len(legal_units)} unités légales traitées")
    insert_data("legal_unit", legal_units)
    
    # 7. Créer le mapping siren -> legal_unit.id
    print("\n7️⃣ Création du mapping SIREN -> legal_unit.id...")
    result = supabase.table("legal_unit").select("siren, id").execute()
    legal_units_map = {row["siren"]: row["id"] for row in result.data}
    print(f"   ✅ Mapping créé: {len(legal_units_map)} entrées")
    
    # 8. Charger et insérer les établissements
    print("\n8️⃣ Chargement des établissements...")
    establishment_rows = read_csv(ETABLISSEMENT_CSV)
    print(f"   📄 {len(establishment_rows)} lignes lues dans StockEtablissement_extract_10000.csv")
    
    establishments = process_establishments(establishment_rows, legal_units_map, zones)
    print(f"   ✅ {len(establishments)} établissements traités")
    insert_data("establishment", establishments)
    
    # 9. Résumé
    elapsed = time.time() - start_time
    print("\n" + "=" * 70)
    print("✅ CHARGEMENT TERMINÉ!")
    print("=" * 70)
    print(f"   Temps total: {elapsed:.2f} secondes")
    print(f"   - Secteurs: {len(sectors)}")
    print(f"   - Zones: {len(zones)}")
    print(f"   - Unités légales: {len(legal_units)}")
    print(f"   - Établissements: {len(establishments)}")
    print("\n🎉 Les données sont prêtes pour le MVP1!")
    print("   Vous pouvez maintenant interroger la base avec des requêtes comme:")
    print("   SELECT * FROM companies_with_geo WHERE zone_name = 'Bretagne' LIMIT 10;")

# ============================================================================
# EXÉCUTION
# ============================================================================

if __name__ == "__main__":
    main()
