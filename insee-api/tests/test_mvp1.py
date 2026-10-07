"""
Tests pour le MVP1 B2Bmax

Ces tests vérifient que l'API fonctionne correctement avec la base de données Supabase.

Pour exécuter les tests:
    pip install pytest pytest-httpx httpx
    pytest tests/test_mvp1.py -v
"""

import pytest
from fastapi.testclient import TestClient
from main import app, data_loader
import os
import sys

# Ajouter le répertoire parent au path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Créer un client de test
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup():
    """Initialisation avant chaque test"""
    # S'assurer que les données sont chargées
    if not data_loader._loaded:
        data_loader.load()


# ============================================================================
# TESTS DE SANTÉ
# ============================================================================

def test_health_endpoint():
    """Test que l'endpoint de santé fonctionne"""
    response = client.get("/v1/health")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert "version" in data


# ============================================================================
# TESTS DES DONNÉES DE RÉFÉRENCE
# ============================================================================

def test_list_sectors():
    """Test la liste des secteurs"""
    response = client.get("/v1/sectors")
    
    assert response.status_code == 200
    sectors = response.json()
    assert len(sectors) > 0
    
    # Vérifier que les secteurs attendus sont présents
    sector_ids = [s["id"] for s in sectors]
    assert "56" in sector_ids  # Restauration
    assert "J" in sector_ids  # Information et communication


def test_list_zones():
    """Test la liste des zones"""
    response = client.get("/v1/zones")
    
    assert response.status_code == 200
    zones = response.json()
    assert len(zones) > 0
    
    # Vérifier que les zones attendues sont présentes
    zone_ids = [z["id"] for z in zones]
    assert "BRE" in zone_ids  # Bretagne
    assert "69" in zone_ids  # Rhône


def test_get_specific_sector():
    """Test l'obtention d'un secteur spécifique"""
    response = client.get("/v1/sectors/56")
    
    assert response.status_code == 200
    sector = response.json()
    assert sector["id"] == "56"
    assert sector["name"] == "Restauration"


def test_get_specific_zone():
    """Test l'obtention d'une zone spécifique"""
    response = client.get("/v1/zones/BRE")
    
    assert response.status_code == 200
    zone = response.json()
    assert zone["id"] == "BRE"
    assert zone["name"] == "Bretagne"


# ============================================================================
# TESTS DE RECHERCHE
# ============================================================================

def test_search_with_sector():
    """Test la recherche par secteur"""
    # Rechercher des entreprises avec un code NAF spécifique
    response = client.post("/v1/searches", params={
        "naf_code": "56",
        "limit": 10
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "total_companies" in data
    assert "companies" in data


def test_search_with_zone():
    """Test la recherche par zone"""
    # Rechercher des entreprises dans une zone spécifique
    response = client.post("/v1/searches", params={
        "zone_id": "69",  # Rhône
        "limit": 10
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "total_companies" in data
    assert "companies" in data


def test_search_with_sector_and_zone():
    """Test la recherche par secteur et zone"""
    response = client.post("/v1/searches", params={
        "sector_id": "56",  # Restauration
        "zone_id": "69",    # Rhône
        "limit": 10
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "total_companies" in data


# ============================================================================
# TESTS DE CHAT
# ============================================================================

def test_chat_simple_query():
    """Test une requête simple dans le chat"""
    response = client.post("/v1/chat/messages", json={
        "message": "PME en Bretagne"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "entities" in data
    assert "next_actions" in data


def test_chat_with_sector():
    """Test une requête avec un secteur identifiable"""
    response = client.post("/v1/chat/messages", json={
        "message": "restauration à Lyon"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "entities" in data
    # Devrait identifier le secteur "restauration"
    assert data["entities"].get("sector") is not None


def test_chat_with_zone():
    """Test une requête avec une zone identifiable"""
    response = client.post("/v1/chat/messages", json={
        "message": "entreprises en Île-de-France"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "entities" in data
    # Devrait identifier la zone "Île-de-France"
    assert data["entities"].get("zone") is not None


def test_chat_with_both():
    """Test une requête avec secteur et zone"""
    response = client.post("/v1/chat/messages", json={
        "message": "PME du numérique en Bretagne"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "entities" in data
    # Devrait identifier les deux
    assert data["entities"].get("sector") is not None or data["entities"].get("zone") is not None


def test_chat_ambiguous_query():
    """Test une requête ambiguë"""
    response = client.post("/v1/chat/messages", json={
        "message": "Comment va le marché ?"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    # Devrait demander une clarification
    assert "vague" in data["message"].lower() or "préciser" in data["message"].lower()


# ============================================================================
# TESTS D'EXTRACTION D'ENTITÉS
# ============================================================================

def test_extract_entities_restauration():
    """Test l'extraction d'entités pour la restauration"""
    response = client.post("/v1/extract-entities", json={
        "message": "entreprises de restauration"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "entities" in data
    assert data["entities"]["sector"] is not None


def test_extract_entities_bretagne():
    """Test l'extraction d'entités pour la Bretagne"""
    response = client.post("/v1/extract-entities", json={
        "message": "en Bretagne"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "entities" in data
    assert data["entities"]["zone"] is not None


def test_extract_entities_programmation():
    """Test l'extraction d'entités pour la programmation informatique"""
    response = client.post("/v1/extract-entities", json={
        "message": "secteur de la programmation informatique"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "entities" in data
    assert data["entities"]["sector"] is not None


# ============================================================================
# TESTS DES CAS D'USAGE MVP1
# ============================================================================

def test_usecase_pme_numerique_bretagne():
    """Test le cas d'usage: PME numérique Bretagne"""
    response = client.post("/v1/chat/messages", json={
        "message": "Quelles sont les PME en Bretagne dans le secteur du numérique ?"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "query_result" in data
    if data["query_result"]:
        assert data["query_result"]["total_companies"] >= 0


def test_usecase_restauration_lyon():
    """Test le cas d'usage: restauration à Lyon"""
    response = client.post("/v1/chat/messages", json={
        "message": "Quelles sont les entreprises de restauration à Lyon ?"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "query_result" in data


def test_usecase_pme_numerique_france():
    """Test le cas d'usage: PME du numérique en France"""
    response = client.post("/v1/chat/messages", json={
        "message": "PME du numérique en France"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "query_result" in data


# ============================================================================
# TESTS D'ERREURS
# ============================================================================

def test_nonexistent_sector():
    """Test l'obtention d'un secteur inexistant"""
    response = client.get("/v1/sectors/INVALID")
    
    assert response.status_code == 404


def test_nonexistent_zone():
    """Test l'obtention d'une zone inexistante"""
    response = client.get("/v1/zones/INVALID")
    
    assert response.status_code == 404


# ============================================================================
# RAPPORT DE TESTS
# ============================================================================

if __name__ == "__main__":
    print("\n" + "="*60)
    print("EXÉCUTION DES TESTS MVP1")
    print("="*60)
    
    # Exécuter pytest
    import subprocess
    result = subprocess.run([
        "pytest", "-v", "--tb=short", __file__
    ], capture_output=True, text=True)
    
    print(result.stdout)
    if result.stderr:
        print("Erreurs:", result.stderr)
    
    print("\n" + "="*60)
    print("TESTS TERMINÉS")
    print("="*60)
    
    sys.exit(result.returncode)