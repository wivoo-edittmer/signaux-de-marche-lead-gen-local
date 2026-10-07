#!/usr/bin/env python3
"""
Script simple pour charger les données dans Supabase en utilisant psycopg2
"""

import psycopg2
import csv
import json
from pathlib import Path
import os

# Configuration Supabase
# Utiliser les informations obtenues depuis MCP
DB_HOST = "aws-0-eu-west-1.pooler.supabase.com"
DB_PORT = "5432"
DB_NAME = "postgres"
DB_USER = "postgres.zzqyokefesatkgvtdqqt"
DB_PASSWORD = "wivoox-mistral-2026"  # À remplacer par le vrai mot de passe

# Fonction pour mapper la tranche d'effectifs à une taille
def map_tranche_to_size(tranche):
    if not tranche:
        return None
    
    tranche_mappings = {
        'NN': 'unknown',
        '00': 'micro', '01': 'micro', '02': 'micro',
        '03': 'small', '04': 'small', '05': 'small',
        '11': 'medium', '12': 'medium', '21': 'medium',
        '22': 'large', '31': 'large', '32': 'large',
        '41': 'large', '42': 'very_large', '51': 'very_large',
    }
    
    return tranche_mappings.get(tranche, 'unknown')

def create_connection():
    """Crée une connexion à la base de données"""
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            sslmode="require"
        )
        return conn
    except Exception as e:
        print(f"Erreur de connexion: {e}")
        return None

def load_data():
    """Charge les données depuis les fichiers CSV"""
    print("Début du chargement des données...")
    
    # Se connecter à la base de données
    conn = create_connection()
    if not conn:
        print("Impossible de se connecter à la base de données")
        return
    
    cursor = conn.cursor()
    
    try:
        # Charger les entreprises
        csv_path = Path("/Users/mathurinbody/Documents/workspaces/wivooxmistral/data/StockUniteLegale_extract_10000.csv")
        
        if not csv_path.exists():
            print(f"Fichier non trouvé: {csv_path}")
            return
        
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            batch = []
            for i, row in enumerate(reader):
                siren = row.get('siren', '')
                if not siren:
                    continue
                
                # Normaliser le code NAF
                naf_code = row.get('activitePrincipaleUniteLegale', '')
                if naf_code:
                    naf_code = naf_code.replace('.', '').upper()
                
                # Déterminer la taille
                tranche_effectifs = row.get('trancheEffectifsUniteLegale', '')
                size = map_tranche_to_size(tranche_effectifs)
                
                # Construire la requête
                batch.append({
                    'siren': siren,
                    'name': row.get('denominationUniteLegale', '') or row.get('nomUniteLegale', ''),
                    'legal_form': row.get('categorieJuridiqueUniteLegale', ''),
                    'date_created': row.get('dateCreationUniteLegale', ''),
                    'sector_id': None,  # À mettre à jour plus tard
                    'naf_code': naf_code,
                    'zone_id': None,
                    'postal_code': None,
                    'commune': None,
                    'address': None,
                    'size': size,
                    'category': row.get('categorieEntreprise', ''),
                    'is_active': row.get('etatAdministratifUniteLegale', '') == 'A'
                })
                
                # Insérer par lots de 50
                if len(batch) >= 50:
                    insert_batch(cursor, 'companies', batch)
                    batch.clear()
                    print(f"Insertion de {i + 1} entreprises...")
            
            # Insérer le dernier lot
            if batch:
                insert_batch(cursor, 'companies', batch)
                print(f"Dernier lot: {len(batch)} entreprises")
        
        # Charger les établissements
        est_csv_path = Path("/Users/mathurinbody/Documents/workspaces/wivooxmistral/data/StockEtablissement_extract_10000.csv")
        
        if est_csv_path.exists():
            with open(est_csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                
                batch = []
                for i, row in enumerate(reader):
                    siren = row.get('siren', '')
                    siret = row.get('siret', '')
                    
                    if not siren or not siret:
                        continue
                    
                    # Formater l'adresse
                    address_parts = []
                    if row.get('numeroVoieEtablissement'):
                        address_parts.append(row['numeroVoieEtablissement'])
                    if row.get('typeVoieEtablissement'):
                        address_parts.append(row['typeVoieEtablissement'])
                    if row.get('libelleVoieEtablissement'):
                        address_parts.append(row['libelleVoieEtablissement'])
                    
                    address = ' '.join(address_parts) if address_parts else None
                    
                    batch.append({
                        'siret': siret,
                        'siren': siren,
                        'address': address,
                        'complement_adresse': row.get('complementAdresseEtablissement', ''),
                        'code_postal': row.get('codePostalEtablissement', ''),
                        'commune': row.get('libelleCommuneEtablissement', ''),
                        'code_commune': row.get('codeCommuneEtablissement', ''),
                        'is_active': row.get('etatAdministratifEtablissement', '') == 'A'
                    })
                    
                    # Insérer par lots de 50
                    if len(batch) >= 50:
                        insert_batch(cursor, 'establishments', batch)
                        batch.clear()
                        print(f"Insertion de {i + 1} établissements...")
                
                # Insérer le dernier lot
                if batch:
                    insert_batch(cursor, 'establishments', batch)
                    print(f"Dernier lot: {len(batch)} établissements")
        
        # Commit des changements
        conn.commit()
        print("Données chargées avec succès!")
        
        # Compter les enregistrements
        cursor.execute("SELECT COUNT(*) FROM companies")
        companies_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM establishments")
        establishments_count = cursor.fetchone()[0]
        
        print(f"Entreprises: {companies_count}")
        print(f"Établissements: {establishments_count}")
        
    except Exception as e:
        conn.rollback()
        print(f"Erreur: {e}")
    finally:
        cursor.close()
        conn.close()

def insert_batch(cursor, table, batch):
    """Insère un lot de données dans la table spécifiée"""
    if not batch:
        return
    
    if table == 'companies':
        query = """
            INSERT INTO companies 
            (siren, name, legal_form, date_created, sector_id, naf_code, zone_id, 
             postal_code, commune, address, size, category, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (siren) DO NOTHING
        """
        data = [(
            item['siren'],
            item['name'],
            item['legal_form'],
            item['date_created'],
            item['sector_id'],
            item['naf_code'],
            item['zone_id'],
            item['postal_code'],
            item['commune'],
            item['address'],
            item['size'],
            item['category'],
            item['is_active']
        ) for item in batch]
        
    elif table == 'establishments':
        query = """
            INSERT INTO establishments 
            (siret, siren, address, complement_adresse, code_postal, 
             commune, code_commune, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (siret) DO NOTHING
        """
        data = [(
            item['siret'],
            item['siren'],
            item['address'],
            item['complement_adresse'],
            item['code_postal'],
            item['commune'],
            item['code_commune'],
            item['is_active']
        ) for item in batch]
    else:
        return
    
    try:
        cursor.executemany(query, data)
    except Exception as e:
        print(f"Erreur lors de l'insertion du lot: {e}")
        # Essayer une par une
        for item_data in data:
            try:
                cursor.execute(query, item_data)
            except Exception as e2:
                print(f"Erreur avec l'élément: {e2}")

if __name__ == "__main__":
    load_data()