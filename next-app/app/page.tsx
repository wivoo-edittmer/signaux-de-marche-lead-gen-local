import Link from 'next/link';

export default function HomePage() {
  const endpoints = [
    { method: 'GET', path: '/api/health', description: 'Vérification de santé de l&apos;API' },
    { method: 'GET', path: '/api/sectors', description: 'Liste tous les secteurs NAF' },
    { method: 'GET', path: '/api/sectors/[id]', description: 'Obtient un secteur spécifique' },
    { method: 'GET', path: '/api/zones', description: 'Liste toutes les zones géographiques' },
    { method: 'GET', path: '/api/zones/[id]', description: 'Obtient une zone spécifique' },
    { method: 'POST', path: '/api/chat/messages', description: 'Envoie un message dans le chat' },
    { method: 'POST', path: '/api/searches', description: 'Effectue une recherche d&apos;entreprises' },
    { method: 'GET', path: '/api/searches/[id]', description: 'Obtient les résultats d&apos;une recherche' },
    { method: 'POST', path: '/api/extract-entities', description: 'Extrait les entités d&apos;un message' },
    { method: 'POST', path: '/api/transcribe', description: 'Transcription audio batch (Mistral Voxtral)' },
    { method: 'POST', path: '/api/transcribe/stream', description: 'Transcription audio en streaming SSE (Mistral Voxtral)' },
  ];

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      <h1>B2Bmax API</h1>
      <p>Agent Conversationnel de Prospection INSEE - Backend Next.js</p>

      <h2>Endpoints disponibles</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
            <th style={{ padding: '0.5rem' }}>Méthode</th>
            <th style={{ padding: '0.5rem' }}>Chemin</th>
            <th style={{ padding: '0.5rem' }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {endpoints.map((ep) => (
            <tr key={ep.path} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.5rem' }}>
                <code style={{
                  background: ep.method === 'GET' ? '#e6f3ff' : '#fff3e6',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 4,
                }}>
                  {ep.method}
                </code>
              </td>
              <td style={{ padding: '0.5rem' }}>
                <Link href={ep.path.replace('[id]', 'example')} style={{ color: '#0066cc' }}>
                  {ep.path}
                </Link>
              </td>
              <td style={{ padding: '0.5rem' }}>{ep.description}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: '2rem' }}>Exemples d&apos;utilisation</h2>

      <h3>Chat</h3>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: 8, overflow: 'auto' }}>
{`curl -X POST http://localhost:3000/api/chat/messages \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Quelles sont les PME du numérique en Bretagne ?"}'`}
      </pre>

      <h3>Recherche</h3>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: 8, overflow: 'auto' }}>
{`curl -X POST http://localhost:3000/api/searches \\
  -H "Content-Type: application/json" \\
  -d '{"sector_id": "J", "zone_id": "BRE", "limit": 10}'`}
      </pre>

      <h3>Extraction d&apos;entités</h3>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: 8, overflow: 'auto' }}>
{`curl -X POST http://localhost:3000/api/extract-entities \\
  -H "Content-Type: application/json" \\
  -d '{"message": "PME restauration à Lyon"}'`}
      </pre>

      <h3>Transcription audio (batch)</h3>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: 8, overflow: 'auto' }}>
{`curl -X POST http://localhost:3000/api/transcribe \\
  -F "file=@audio.mp3" \\
  -F "language=fr" \\
  -F "timestamp_granularities=segment"`}
      </pre>

      <h3>Transcription audio (streaming SSE)</h3>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: 8, overflow: 'auto' }}>
{`curl -X POST http://localhost:3000/api/transcribe/stream \\
  -F "file=@audio.webm" \\
  -F "language=fr" \\
  --no-buffer`}
      </pre>

      <h3>Transcription depuis une URL</h3>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: 8, overflow: 'auto' }}>
{`curl -X POST http://localhost:3000/api/transcribe \\
  -H "Content-Type: application/json" \\
  -d '{"file_url": "https://example.com/audio.mp3", "language": "fr"}'`}
      </pre>

      <footer style={{ marginTop: '3rem', color: '#666', fontSize: '0.9rem' }}>
        <p>B2Bmax API v1.0.0 - Déployé sur Vercel</p>
      </footer>
    </main>
  );
}
