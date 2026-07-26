'use client'

import { useEffect } from 'react'

export default function RaceRedirect({ slug }: { slug: string }) {
  useEffect(() => {
    window.location.replace(`/#corrida-${slug}`)
  }, [slug])

  return (
    <main style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: '2rem',
      background: '#081638',
      color: '#fff',
      textAlign: 'center',
    }}>
      <div>
        <p>Abrindo a corrida...</p>
        <a href={`/#corrida-${slug}`} style={{ color: '#d7ff32' }}>
          Clique aqui se não abrir automaticamente
        </a>
      </div>
    </main>
  )
}
