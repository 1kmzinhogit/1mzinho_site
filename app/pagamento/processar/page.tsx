'use client'

import styled from 'styled-components'
import { useEffect, useRef, useState, Suspense } from 'react'
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
  const hasProcessedPayment = useRef(false)
  const [paymentData, setPaymentData] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    const processPayment = async () => {
      if (hasProcessedPayment.current) return
      hasProcessedPayment.current = true

      // Lê do sessionStorage — dados nunca ficam expostos na URL
      const raw = sessionStorage.getItem('pendingPayment')

      if (!raw) {
        router.push('/')
        return
      }

      try {
        const parsed = JSON.parse(raw) as Record<string, unknown>
        setPaymentData(parsed)

        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed),
          signal: AbortSignal.timeout(30000),
        })

        const checkout = await response.json() as {
          linkPagamento?: string
          init_point?: string
          sandbox_init_point?: string
          url?: string
          erro?: string
          message?: string
          detail?: string
        }

        if (!response.ok) {
          const message = checkout.detail
            ? `${checkout.erro ?? checkout.message ?? 'Erro ao criar checkout'}: ${checkout.detail}`
            : checkout.erro ?? checkout.message ?? 'Erro ao criar checkout'

          throw new Error(message)
        }

        const paymentUrl = checkout.linkPagamento ?? checkout.init_point ?? checkout.sandbox_init_point ?? checkout.url

        if (!paymentUrl) {
          throw new Error('Link de pagamento não retornado pela API.')
        }

        sessionStorage.removeItem('pendingPayment')
        window.location.assign(paymentUrl)
      } catch (error) {
        console.error('Erro no processamento do pagamento:', error)
        const message = error instanceof Error ? error.message : 'Erro no processamento do pagamento.'
        router.push(`/pagamento/status?status=error&message=${encodeURIComponent(message)}`)
      }
    }

    processPayment()
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
