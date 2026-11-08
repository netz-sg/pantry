'use client';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="de">
      <body
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          display: 'grid',
          placeItems: 'center',
          minHeight: '100vh',
          margin: 0,
          background: '#f2f2f7',
        }}
      >
        <div style={{ textAlign: 'center', padding: 24 }}>
          <h1 style={{ fontSize: 22 }}>Pantry konnte nicht geladen werden</h1>
          <p style={{ color: '#6e6e73' }}>Bitte lade die Seite neu. Deine Daten sind sicher.</p>
          <button
            onClick={reset}
            style={{
              marginTop: 12,
              padding: '10px 20px',
              borderRadius: 999,
              border: 0,
              background: '#f76b15',
              color: '#fff',
              fontWeight: 600,
            }}
          >
            Neu laden
          </button>
        </div>
      </body>
    </html>
  );
}
