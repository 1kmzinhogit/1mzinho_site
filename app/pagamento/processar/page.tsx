'use client'

import styled from 'styled-components'
import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// ─── Styles ───────────────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`

const Container = styled.div`
  max-width: 400px;
  width: 100%;
  text-align: center;
`

const SpinnerWrapper = styled.div`
  margin-bottom: 2rem;

  svg {
    color: #00A4F5;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
`

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 1rem;
`

const Description = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  line-height: 1.5;
`

const DebugInfo = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  text-align: left;

  pre {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.75rem;
    white-space: pre-wrap;
    word-break: break-all;
  }
`

// ─── Content ──────────────────────────────────────────────────────────────────

function ProcessPaymentContent() {
  const router = useRouter()
  const [paymentData, setPaymentData] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    // Lê do sessionStorage — dados nunca ficam expostos na URL
    const raw = sessionStorage.getItem('pendingPayment')

    if (!raw) {
      router.push('/')
      return
    }

    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>
      sessionStorage.removeItem('pendingPayment') // limpa após ler
      setPaymentData(parsed)

      // TODO: Criar preferência no backend e redirecionar para o Mercado Pago
      //
      // const response = await fetch('/api/mercadopago/create-preference', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(parsed),
      // })
      // const { init_point } = await response.json()
      // window.location.href = init_point

      // ── Simulação — remova quando integrar o Mercado Pago ──
      window.setTimeout(() => {
        const statuses = ['success', 'pending', 'error']
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        router.push(`/pagamento/status?status=${status}&payment_id=MP-${Date.now()}`)
      }, 3000)
      // ── fim da simulação ──

    } catch {
      router.push('/')
    }
  }, [router])

  return (
    <PageWrapper>
      <Container>
        <SpinnerWrapper>
          <Loader2 size={60} />
        </SpinnerWrapper>

        <Title>Processando Pagamento</Title>
        <Description>
          Aguarde enquanto redirecionamos você para o ambiente seguro de pagamento do Mercado Pago…
        </Description>

        {/* Só aparece em desenvolvimento para depuração */}
        {process.env.NODE_ENV === 'development' && paymentData && (
          <DebugInfo>
            <pre>{JSON.stringify(paymentData, null, 2)}</pre>
          </DebugInfo>
        )}
      </Container>
    </PageWrapper>
  )
}

// ─── Loading fallback ─────────────────────────────────────────────────────────

const LoadingFallback = () => (
  <div style={{
    minHeight: '100vh',
    background: '#0a0a0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <Loader2 size={60} style={{ color: '#00A4F5' }} />
  </div>
)

// ─── Page export ──────────────────────────────────────────────────────────────

export default function ProcessPaymentPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ProcessPaymentContent />
    </Suspense>
  )
}