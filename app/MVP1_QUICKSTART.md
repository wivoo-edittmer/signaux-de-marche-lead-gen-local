# MVP1 Quickstart - B2Bmax (Données Locales Uniquement)

**Objectif**: Démarrer rapidement avec le MVP1 en utilisant **uniquement les données locales** depuis `/data/`.

**Pas d'API INSEE** - **Pas de Supabase** - **Pas d'authentification** pour le MVP1.

---

## 📌 Prérequis

- Python 3.10+
- Node.js 18+ (optionnel, pour le frontend)
- Les fichiers de données dans `/Users/mathurinbody/Documents/workspaces/wivooxmistral/data/`

---

## 🚀 Setup Backend (5 minutes)

### 1. Aller dans le dossier backend

```bash
cd /Users/mathurinbody/Documents/workspaces/wivooxmistral/insee-api
```

### 2. Installer les dépendances

```bash
# Créer un environnement virtuel
python -m venv venv

# Activer l'environnement
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt
```

### 3. Copier et configurer .env

```bash
cp .env.example .env
```

**Optionnel**: Si vous voulez utiliser Mistral API (sinon, des mocks seront utilisés) :
```bash
# Éditer .env et ajouter votre clé Mistral
MISTRAL_API_KEY=your_mistral_api_key_here
```

### 4. Démarrer le backend

```bash
uvicorn main:app --reload --port 8000
```

**Vérifier**:
```bash
# Tester l'endpoint santé
curl http://localhost:8000/v1/health

# Vous devriez voir:
# {"status": "healthy", "data_loader": {"loaded": true, "companies_count": X, ...}}
```

---

## ✅ Tests du Backend

### Tester avec cURL

```bash
# Test 1: Extraction d'entités et synthèse via chat
curl -X POST http://localhost:8000/v1/chat/messages \
  -H "Content-Type: application/json" \
  -d '{"message": "Quelles sont les PME en Bretagne dans le secteur du numérique ?"}'

# Résultat attendu:
# {
#   "id": "...",
#   "conversation_id": "...",
#   "content": "Le marché Information et communication à Bretagne est en croissance nette de +X entreprises...",
#   "role": "assistant",
#   "type": "summary",
#   "data": {
#     "search_id": "...",
#     "statistics": {"total_companies": Y, "creations": Z, ...},
#     "actions": [...]
#   }
# }

# Test 2: Recherche directe
curl -X POST http://localhost:8000/v1/searches \
  -H "Content-Type: application/json" \
  -d '{"sector_id": "62", "zone_id": "BRE"}'

# Test 3: Lister les secteurs disponibles
curl http://localhost:8000/v1/sectors

# Test 4: Lister les zones disponibles
curl http://localhost:8000/v1/zones
```

### Tester avec Python

```python
# Dans un terminal Python
import requests
import json

# Test extraction d'entités
response = requests.post(
    "http://localhost:8000/v1/chat/messages",
    json={"message": "PME numérique Bretagne"}
)
result = response.json()
print(json.dumps(result, indent=2, ensure_ascii=False))

# Test recherche directe
response = requests.post(
    "http://localhost:8000/v1/searches",
    json={"sector_id": "56", "zone_id": "69"}
)
result = response.json()
print(f"Total entreprises: {result['statistics']['total_companies']}")
print(f"Créations: {result['statistics']['creations']}")
print(f"Radiations: {result['statistics']['radiations']}")
```

---

## 🎯 Cas d'Usage à Valider

### Cas 1: Banque Régionale (Restauration à Lyon)

**Requête**: "Quelles sont les entreprises de restauration à Lyon ?"

**Résultat attendu**:
- Secteur détecté: 56 (Restauration)
- Zone détectée: 69 (Rhône) ou Lyon
- Synthèse avec chiffres clés pour la restauration à Lyon

**Test cURL**:
```bash
curl -X POST http://localhost:8000/v1/chat/messages \
  -H "Content-Type: application/json" \
  -d '{"message": "Quelles sont les entreprises de restauration à Lyon ?"}'
```

### Cas 2: Éditeur de Logiciels (Numérique en France)

**Requête**: "PME du numérique en France"

**Résultat attendu**:
- Secteur détecté: J ou 62 (Information et communication / Programmation)
- Zone détectée: Aucune (France entière)
- Synthèse avec chiffres clés pour le numérique en France

**Test cURL**:
```bash
curl -X POST http://localhost:8000/v1/chat/messages \
  -H "Content-Type: application/json" \
  -d '{"message": "Quelles sont les PME du numérique en France ?"}'
```

### Cas 3: Requête Précise (Bretagne)

**Requête**: "Quelles sont les PME en Bretagne dans le secteur du numérique ?"

**Résultat attendu**:
- Secteur détecté: J ou 62
- Zone détectée: BRE (Bretagne)
- Synthèse avec chiffres clés pour le numérique en Bretagne

**Test cURL**:
```bash
curl -X POST http://localhost:8000/v1/chat/messages \
  -H "Content-Type: application/json" \
  -d '{"message": "Quelles sont les PME en Bretagne dans le secteur du numérique ?"}'
```

---

## 📊 Vérification des Données

### 1. Vérifier que les données sont chargées

```bash
curl http://localhost:8000/v1/health
```

**Vérifier que**:
- `"data_loader": {"loaded": true, ...}`
- `"companies_count"` > 0 (au moins quelques centaines/milliers)
- `"sectors_count"` > 0
- `"zones_count"` > 0

### 2. Vérifier les secteurs disponibles

```bash
curl http://localhost:8000/v1/sectors | python -m json.tool
```

**Vérifier que**:
- Secteur "56" (Restauration) est présent
- Secteur "J" ou "62" (Numérique) est présent

### 3. Vérifier les zones disponibles

```bash
curl http://localhost:8000/v1/zones | python -m json.tool
```

**Vérifier que**:
- Zone "BRE" (Bretagne) est présente
- Zone "69" (Rhône) est présente

### 4. Tester une recherche par sector_id et zone_id

```bash
# Recherche: Restauration en Bretagne
curl -X POST http://localhost:8000/v1/searches \
  -H "Content-Type: application/json" \
  -d '{"sector_id": "56", "zone_id": "BRE"}' | python -m json.tool

# Vérifier que:
# - total_companies > 0
# - creations, radiations, net_change sont calculés
# - companies liste contient des entreprises
```

---

## 🎨 Frontend Minimal (Optionnel pour MVP1)

Pour un MVP1 complet, vous pouvez créer un frontend minimal avec Next.js.

### Setup rapide Next.js

```bash
# Créer un nouveau projet Next.js
npx create-next-app@latest b2bmax-frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd b2bmax-frontend

# Installer axios pour les requêtes API
npm install axios

# Créer un fichier .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
```

### Code minimal pour le chat

Créer `src/app/page.tsx`:

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{
    id: string;
    content: string;
    role: 'user' | 'assistant';
    type?: string;
    data?: any;
  }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      content: input,
      role: 'user' as const,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/v1/chat/messages`, {
        message: input,
      });

      const assistantMessage = response.data;
      setMessages((prev) => [...prev, {
        ...assistantMessage,
        role: 'assistant' as const,
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        content: "Désolé, une erreur est survenue. Veuillez réessayer.",
        role: 'assistant',
        type: 'error',
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">B2Bmax - Agent Conversationnel</h1>
        <p className="text-sm opacity-90">Analysez les données INSEE par secteur et zone géographique</p>
      </header>

      <main className="flex-1 overflow-auto p-4">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">Bienvenue sur B2Bmax</h2>
              <p className="text-gray-600 mb-4">
                Posez une question sur les entreprises françaises par secteur et zone géographique.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Exemples:</p>
                <p className="font-medium">- "Quelles sont les PME en Bretagne dans le secteur du numérique ?"</p>
                <p className="font-medium">- "Combien d'entreprises de restauration à Lyon ?"</p>
                <p className="font-medium">- "Quelles sont les nouvelles entreprises créées cette année ?"</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.type === 'summary' && msg.data && (
                      <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                        <h4 className="font-semibold mb-2">Synthèse INSEE</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Total:</span> 
                            {msg.data.statistics?.total_companies ?? 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Créations:</span> 
                            {msg.data.statistics?.creations ?? 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Radiations:</span> 
                            {msg.data.statistics?.radiations ?? 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Net:</span> 
                            {msg.data.statistics?.net_change ?? 'N/A'}
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium">Tendance:</span> 
                            {msg.data.statistics?.trend ?? 'N/A'}
                          </div>
                        </div>
                        
                        {msg.data.actions && (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm font-medium">Prochaines actions:</p>
                            <div className="flex flex-wrap gap-2">
                              {msg.data.actions.map((action: any, index: number) => (
                                <button
                                  key={index}
                                  className="px-3 py-1 bg-gray-100 rounded-full text-xs hover:bg-gray-200"
                                >
                                  {action.icon} {action.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {msg.type === 'error' && (
                      <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                        <p className="text-sm text-red-600">{msg.content}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Posez votre question... (ex: PME du numérique en Bretagne)"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? '...' : 'Envoyer'}
          </button>
        </div>
      </footer>
    </div>
  );
}
```

### Créer le fichier de configuration Next.js

Créer `src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'B2Bmax - Agent Conversationnel INSEE',
  description: 'Analysez les entreprises françaises par secteur et zone géographique',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

### Démarrer le frontend

```bash
npm run dev
```

**Accéder à**: http://localhost:3000

---

## 🎯 Checklist MVP1

### Backend

- [ ] Le backend démarre sans erreur (`uvicorn main:app --reload`)
- [ ] L'endpoint `/v1/health` retourne `"status": "healthy"`
- [ ] L'endpoint `/v1/sectors` retourne la liste des secteurs
- [ ] L'endpoint `/v1/zones` retourne la liste des zones
- [ ] L'endpoint `/v1/chat/messages` extrait les entités et génère une synthèse
- [ ] L'endpoint `/v1/searches` effectue une recherche et retourne des statistiques

### Tests des Requêtes

- [ ] Requête "PME numérique Bretagne" → secteur: J/62, zone: BRE
- [ ] Requête "restauration à Lyon" → secteur: 56, zone: 69
- [ ] Requête "entreprises en Île-de-France" → zone: IDF
- [ ] Requête vague → retourne une demande de clarification

### Performance

- [ ] Réponse en moins de 5 secondes
- [ ] Pas d'erreurs 500
- [ ] Pas de timeouts

---

## 🐛 Résolution des Problèmes

### Problème: Données non chargées

**Symptôme**: `"data_loader": {"loaded": false, "companies_count": 0, ...}`

**Solution**:
1. Vérifier que les fichiers CSV existent dans `/data/`
2. Vérifier que `sectors.json` et `zones.json` existent dans `/data/`
3. Vérifier les chemins dans `data_loader.py`
4. Exécuter `python insee-api/data/data_loader.py` pour tester le chargement

### Problème: Erreur "No module named data_loader"

**Symptôme**: Erreur au démarrage du backend

**Solution**:
```bash
# Ajouter le dossier data au PYTHONPATH
cd insee-api
export PYTHONPATH=$PYTHONPATH:.
uvicorn main:app --reload
```

### Problème: Fichiers CSV introuvables

**Symptôme**: `FileNotFoundError` pour les fichiers CSV

**Solution**:
1. Vérifier que les fichiers existent:
   ```bash
   ls /Users/mathurinbody/Documents/workspaces/wivooxmistral/data/
   ```
2. Si les fichiers sont dans un autre dossier, mettre à jour `DATA_DIR` dans `.env`:
   ```env
   DATA_DIR=/chemin/correct/vers/data/
   ```

### Problème: Données incomplètes

**Symptôme**: Peu ou pas d'entreprises chargées

**Solution**:
1. Utiliser les fichiers extraits (plus petits) pour les tests:
   ```python
   # Dans data_loader.py, modifier:
   extract_path = self.BASE_DATA_DIR / "extract" / "StockUniteLegale_extract.csv"
   ```
2. Vérifier que les fichiers CSV ont des données valides

---

## 📚 Documentation Complète

- **[Spécification Complète](../specs/001-b2bmax-chat-insee/spec.md)**
- **[Plan d'Implémentation](../specs/001-b2bmax-chat-insee/plan.md)**
- **[Modèle de Données](../specs/001-b2bmax-chat-insee/data-model.md)**
- **[Contrats API](../specs/001-b2bmax-chat-insee/contracts/)**

---

## ✅ MVP1 Terminé

Une fois que tous les tests passent, votre MVP1 est prêt !

**Fonctionnalités implémentées**:
- ✅ Chat conversationnel avec extraction d'entités
- ✅ Recherche d'entreprises par secteur et zone
- ✅ Génération de synthèses avec chiffres clés
- ✅ Utilisation exclusive des données locales
- ✅ Interface frontend minimale (optionnelle)

**Prochaine étape**: Passer au MVP2 pour ajouter les agents de prospection, les abonnements et l'authentification.
