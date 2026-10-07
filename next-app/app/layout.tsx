import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'B2Bmax API',
  description: 'API B2Bmax - Agent Conversationnel de Prospection INSEE',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
