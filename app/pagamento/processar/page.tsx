'use client'

import styled from 'styled-components'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

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
    to { transform: rotate(360deg); }
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

function ProcessPaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [paymentData, setPaymentData] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    const data = searchParams.get('data')
    
    if (data) {
      try {
        const parsed = JSON.parse(decodeURIComponent(data))
        setPaymentData(parsed)
        
        // TODO: Aqui voce deve integrar com a API do Mercado Pago
        // 1. Criar uma preferencia de pagamento no backend
        // 2. Redirecionar para a URL de checkout do Mercado Pago
        //
        // Exemplo de integracao:
        // const response = await fetch('/api/mercadopago/create-preference', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(parsed)
        // })
        // const { init_point } = await response.json()
        // window.location.href = init_point
        
        // Simulacao - redireciona para status apos 3 segundos
        // REMOVER ESTA SIMULACAO quando integrar com Mercado Pago
        setTimeout(() => {
          const statuses = ['success', 'pending', 'error']
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
          
          router.push(`/pagamento/status?status=${randomStatus}&payment_id=MP-${Date.now()}&race=${encodeURIComponent(parsed.kit?.raceName || '')}&name=${encodeURIComponent(parsed.user?.name || '')}&size=${parsed.shirtSize}&amount=${parsed.amount?.toFixed(2).replace('.', ',')}`)
        }, 3000)
        
      } catch {
        router.push('/')
      }
    } else {
      router.push('/')
    }
  }, [searchParams, router])

  return (
    <PageWrapper>
      <Container>
        <SpinnerWrapper>
          <Loader2 size={60} />
        </SpinnerWrapper>
        
        <Title>Processando Pagamento</Title>
        <Description>
          Aguarde enquanto redirecionamos voce para o ambiente seguro de pagamento do Mercado Pago...
        </Description>
        
        {process.env.NODE_ENV === 'development' && paymentData && (
          <DebugInfo>
            <pre>{JSON.stringify(paymentData, null, 2)}</pre>
          </DebugInfo>
        )}
      </Container>
    </PageWrapper>
  )
}

const LoadingFallback = () => (
  <div style={{
    minHeight: '100vh',
    background: '#0a0a0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem'
  }}>
    <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Loader2 size={60} style={{ color: '#00A4F5', animation: 'spin 1s linear infinite' }} />
      </div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>Carregando...</h1>
    </div>
  </div>
)

export default function ProcessPaymentPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ProcessPaymentContent />
    </Suspense>
  )
}
