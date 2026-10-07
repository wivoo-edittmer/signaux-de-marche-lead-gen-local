"""
Tests pour le MVP1 - B2Bmax

Ces tests valident que le backend fonctionne correctement avec les données locales.
Pas d'appel à l'API INSEE, uniquement les CSV locaux.
"""

import pytest
from fastapi.testclient import TestClient
import json
import sys
from pathlib import Path

# Ajouter le dossier parent au path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Importer l'application
from main import app, data_loader

# Créer un client de test
client = TestClient(app)


# ============================================================================
# Fixtures
# ============================================================================

@pytest.fixture(autouse=True, scope="module")
def load_data():
    """Charge les données avant les tests"""
    # Les données sont déjà chargées au démarrage de l'application
    pass


# ============================================================================
# Tests de Santé
# ============================================================================

def test_health_endpoint():
    """Test l'endpoint de santé"""
    response = client.get("/v1/health")
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert "data_loader" in data
    assert data["data_loader"]["loaded"] is True


def test_data_loader_loaded():
    """Test que le data loader a bien chargé les données"""
    response = client.get("/v1/health")
    data = response.json()
    
    assert data["data_loader"]["sectors_count"] > 0
    assert data["data_loader"]["zones_count"] > 0
    # Les entreprises peuvent être 0 si les fichiers CSV ne sont pas trouvés
    # mais les secteurs et zones doivent être chargés depuis les JSON


# ============================================================================
# Tests des Secteurs
# ============================================================================

def test_list_sectors():
    """Test la liste des secteurs"""
    response = client.get("/v1/sectors")
    assert response.status_code == 200
    
    data = response.json()
    assert "sectors" in data
    assert len(data["sectors"]) > 0
    
    # Vérifier que le secteur Restauration (56) est présent
    sector_ids = [s["id"] for s in data["sectors"]]
    assert "56" in sector_ids
    
    # Vérifier que le secteur Numérique (J ou 62) est présent
    assert "J" in sector_ids or "62" in sector_ids


def test_sector_structure():
    """Test la structure des données des secteurs"""
    response = client.get("/v1/sectors")
    data = response.json()
    
    # Vérifier la structure du premier secteur
    first_sector = data["sectors"][0]
    assert "id" in first_sector
    assert "naf_code" in first_sector
    assert "name" in first_sector
    assert "level" in first_sector


# ============================================================================
# Tests des Zones
# ============================================================================

def test_list_zones():
    """Test la liste des zones"""
    response = client.get("/v1/zones")
    assert response.status_code == 200
    
    data = response.json()
    assert "zones" in data
    assert len(data["zones"]) > 0
    
    # Vérifier que la Bretagne (BRE) est présente
    zone_ids = [z["id"] for z in data["zones"]]
    assert "BRE" in zone_ids
    
    # Vérifier que Lyon (69) est présente
    assert "69" in zone_ids or "69001" in zone_ids


def test_zone_structure():
    """Test la structure des données des zones"""
    response = client.get("/v1/zones")
    data = response.json()
    
    # Vérifier la structure de la première zone
    first_zone = data["zones"][0]
    assert "id" in first_zone
    assert "code" in first_zone
    assert "name" in first_zone
    assert "level" in first_zone


# ============================================================================
# Tests du Chat
# ============================================================================

def test_chat_message_basic():
    """Test l'envoi d'un message basique dans le chat"""
    response = client.post(
        "/v1/chat/messages",
        json={"message": "Quelles sont les PME en Bretagne dans le secteur du numérique ?"}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Vérifier la structure de la réponse
    assert "id" in data
    assert "conversation_id" in data
    assert "content" in data
    assert data["role"] == "assistant"
    assert "created_at" in data


def test_chat_message_with_entities():
    """Test que les entités sont extraites correctement"""
    response = client.post(
        "/v1/chat/messages",
        json={"message": "PME numérique Bretagne"}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Vérifier que c'est une synthèse
    assert data.get("type") == "summary"
    assert "data" in data
    
    # Vérifier que les entités sont détectées
    assert "sector" in data["data"]
    assert "zone" in data["data"]


def test_chat_message_restauration_lyon():
    """Test la détection de la restauration à Lyon"""
    response = client.post(
        "/v1/chat/messages",
        json={"message": "restauration à Lyon"}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Vérifier que c'est une synthèse
    assert data.get("type") == "summary"
    
    # Vérifier les entités
    assert data["data"]["sector"]["id"] == "56"
    assert "Lyon" in data["data"]["zone"]["name"] or "69" in data["data"]["zone"]["id"]


def test_chat_message_vague():
    """Test qu'une requête vague retourne une demande de clarification"""
    response = client.post(
        "/v1/chat/messages",
        json={"message": "Comment va le marché ?"}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Vérifier que c'est une erreur de clarification
    assert data.get("type") == "error"
    assert "AMBIGUOUS_QUERY" in data.get("data", {}).get("error", "")


def test_chat_message_statistics():
    """Test que les statistiques sont calculées"""
    response = client.post(
        "/v1/chat/messages",
        json={"message": "entreprises en Bretagne"}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Vérifier les statistiques
    assert "statistics" in data["data"]
    stats = data["data"]["statistics"]
    assert "total_companies" in stats
    assert "creations" in stats
    assert "radiations" in stats
    assert "net_change" in stats
    assert "trend" in stats


def test_chat_message_actions():
    """Test que les actions suivantes sont proposées"""
    response = client.post(
        "/v1/chat/messages",
        json={"message": "PME numérique"}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Vérifier les actions
    assert "actions" in data["data"]
    actions = data["data"]["actions"]
    assert len(actions) == 3
    
    # Vérifier les types d'actions
    action_types = [a["type"] for a in actions]
    assert "report" in action_types
    assert "agent" in action_types
    assert "follow" in action_types


# ============================================================================
# Tests des Recherches
# ============================================================================

def test_create_search_basic():
    """Test la création d'une recherche basique"""
    response = client.post(
        "/v1/searches",
        json={"sector_id": "56", "zone_id": "BRE"}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Vérifier la structure
    assert "id" in data
    assert "statistics" in data
    assert "companies" in data
    assert "insight" in data
    assert "actions" in data


def test_create_search_statistics():
    """Test que les statistiques sont calculées dans une recherche"""
    response = client.post(
        "/v1/searches",
        json={"sector_id": "62", "zone_id": "BRE"}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    stats = data["statistics"]
    assert "total_companies" in stats
    assert "creations" in stats
    assert "radiations" in stats
    assert "net_change" in stats
    assert isinstance(stats["total_companies"], int)
    assert isinstance(stats["creations"], int)
    assert isinstance(stats["radiations"], int)


def test_create_search_sector_only():
    """Test une recherche par secteur uniquement"""
    response = client.post(
        "/v1/searches",
        json={"sector_id": "56"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "statistics" in data


def test_create_search_zone_only():
    """Test une recherche par zone uniquement"""
    response = client.post(
        "/v1/searches",
        json={"zone_id": "BRE"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "statistics" in data


# ============================================================================
# Tests des Cas d'Usage
# ============================================================================

def test_cas_usage_banque():
    """Test le cas d'usage banque: restauration à Lyon"""
    response = client.post(
        "/v1/chat/messages",
        json={"message": "Quelles sont les entreprises de restauration à Lyon ?"}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Vérifier que c'est une synthèse
    assert data.get("type") == "summary"
    
    # Vérifier le secteur
    assert data["data"]["sector"]["id"] == "56"
    
    # Vérifier la zone (Lyon ou Rhône)
    zone = data["data"]["zone"]
    assert zone["id"] in ["69", "69001", "69002"] or "Lyon" in zone["name"]


def test_cas_usage_editeur():
    """Test le cas d'usage éditeur: numérique en France"""
    response = client.post(
        "/v1/chat/messages",
        json={"message": "PME du numérique en France"}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Vérifier que c'est une synthèse
    assert data.get("type") == "summary"
    
    # Vérifier le secteur (J ou 62 pour numérique)
    sector = data["data"]["sector"]
    assert sector["id"] in ["J", "62", "6201Z"]


def test_cas_usage_bretagne():
    """Test le cas d'usage: PME en Bretagne dans le secteur du numérique"""
    response = client.post(
        "/v1/chat/messages",
        json={"message": "Quelles sont les PME en Bretagne dans le secteur du numérique ?"}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Vérifier que c'est une synthèse
    assert data.get("type") == "summary"
    
    # Vérifier le secteur
    sector = data["data"]["sector"]
    assert sector["id"] in ["J", "62", "6201Z"]
    
    # Vérifier la zone
    zone = data["data"]["zone"]
    assert zone["id"] == "BRE" or zone["name"] == "Bretagne"


# ============================================================================
# Tests d'Intégration
# ============================================================================

def test_full_flow():
    """Test un flux complet: message -> synthèse -> actions"""
    # Étape 1: Envoyer un message
    chat_response = client.post(
        "/v1/chat/messages",
        json={"message": "PME numérique Bretagne"}
    )
    assert chat_response.status_code == 200
    chat_data = chat_response.json()
    assert chat_data["type"] == "summary"
    
    # Étape 2: Vérifier que les actions sont présentes
    assert "actions" in chat_data["data"]
    assert len(chat_data["data"]["actions"]) == 3
    
    # Étape 3: Vérifier les statistiques
    stats = chat_data["data"]["statistics"]
    assert stats["total_companies"] >= 0
    assert stats["creations"] >= 0
    assert stats["radiations"] >= 0


# ============================================================================
# Exécution des tests
# ============================================================================

if __name__ == "__main__":
    # Exécuter les tests
    pytest.main([__file__, "-v", "--tb=short"])
