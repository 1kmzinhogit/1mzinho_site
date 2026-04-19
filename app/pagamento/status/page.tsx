'use client'

import styled from 'styled-components'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Clock, Home, RotateCcw } from 'lucide-react'
import { Suspense } from 'react'

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`

const Container = styled.div`
  max-width: 500px;
  width: 100%;
  text-align: center;
`

const IconWrapper = styled.div<{ $status: 'success' | 'error' | 'pending' }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  background: ${({ $status }) => {
    switch ($status) {
      case 'success': return 'rgba(57, 255, 20, 0.15)';
      case 'error': return 'rgba(245, 1, 135, 0.15)';
      case 'pending': return 'rgba(0, 164, 245, 0.15)';
    }
  }};
  border: 2px solid ${({ $status }) => {
    switch ($status) {
      case 'success': return '#39FF14';
      case 'error': return '#F50187';
      case 'pending': return '#00A4F5';
    }
  }};
  
  svg {
    color: ${({ $status }) => {
      switch ($status) {
        case 'success': return '#39FF14';
        case 'error': return '#F50187';
        case 'pending': return '#00A4F5';
      }
    }};
  }
`

const Title = styled.h1<{ $status: 'success' | 'error' | 'pending' }>`
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: ${({ $status }) => {
    switch ($status) {
      case 'success': return '#39FF14';
      case 'error': return '#F50187';
      case 'pending': return '#00A4F5';
    }
  }};
`

const Description = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
`

const Card = styled.div`
  background: linear-gradient(145deg, #141414 0%, #1a1a1a 100%);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
`

const CardTitle = styled.h3`
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  
  &:last-child {
    border-bottom: none;
  }
`

const InfoLabel = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
`

const InfoValue = styled.span`
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`

const Button = styled.a<{ $variant: 'primary' | 'secondary' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s;
  cursor: pointer;
  
  ${({ $variant }) => $variant === 'primary' ? `
    background: linear-gradient(135deg, #F50187 0%, #00A4F5 100%);
    color: #fff;
    border: none;
    
    &:hover {
      transform: scale(1.05);
    }
  ` : `
    background: transparent;
    color: #00A4F5;
    border: 1px solid #00A4F5;
    
    &:hover {
      background: rgba(0, 164, 245, 0.1);
    }
  `}
`

const TransactionId = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1.5rem;
  
  span {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.8rem;
    display: block;
    margin-bottom: 0.5rem;
  }
  
  code {
    color: #00A4F5;
    font-family: monospace;
    font-size: 0.9rem;
  }
`

function PaymentStatusContent() {
  const searchParams = useSearchParams()
  
  // TODO: Pegar status real do Mercado Pago
  // Parametros que o Mercado Pago envia:
  // - collection_status: approved, pending, rejected
  // - payment_id: ID do pagamento
  // - external_reference: referencia externa (pode ser o ID da inscricao)
  
  const status = (searchParams.get('status') as 'success' | 'error' | 'pending') || 'pending'
  const paymentId = searchParams.get('payment_id') || 'MP-' + Math.random().toString(36).substr(2, 9).toUpperCase()
  
  // Dados mockados - substituir pelos dados reais vindos do Mercado Pago
  const orderData = {
    raceName: searchParams.get('race') || '5km - Corrida Intermediária',
    userName: searchParams.get('name') || 'Participante',
    shirtSize: searchParams.get('size') || 'M',
    amount: searchParams.get('amount') || '99,90'
  }

  const statusConfig = {
    success: {
      icon: <CheckCircle size={60} />,
      title: 'Pagamento Confirmado!',
      description: 'Sua inscricao foi confirmada com sucesso. Voce receberá um e-mail com todas as informacoes sobre a retirada do kit.'
    },
    error: {
      icon: <XCircle size={60} />,
      title: 'Pagamento Recusado',
      description: 'Infelizmente seu pagamento não foi aprovado. Verifique os dados do cartao ou tente outra forma de pagamento.'
    },
    pending: {
      icon: <Clock size={60} />,
      title: 'Pagamento Pendente',
      description: 'Seu pagamento está sendo processado. Assim que for confirmado, voce receberá um e-mail com a confirmação da sua inscrição.'
    }
  }

  const config = statusConfig[status]

  return (
    <PageWrapper>
      <Container>
        <IconWrapper $status={status}>
          {config.icon}
        </IconWrapper>
        
        <Title $status={status}>{config.title}</Title>
        <Description>{config.description}</Description>
        
        {status !== 'error' && (
          <Card>
            <CardTitle>Detalhes da Compra</CardTitle>
            <InfoRow>
              <InfoLabel>Corrida</InfoLabel>
              <InfoValue>{orderData.raceName}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Participante</InfoLabel>
              <InfoValue>{orderData.userName}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Tamanho Camisa</InfoLabel>
              <InfoValue>{orderData.shirtSize}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Valor</InfoLabel>
              <InfoValue>R$ {orderData.amount}</InfoValue>
            </InfoRow>
            
            <TransactionId>
              <span>ID da Transacao</span>
              <code>{paymentId}</code>
            </TransactionId>
          </Card>
        )}
        
        <ButtonGroup>
          <Button href="/" $variant="primary">
            <Home size={18} />
            Voltar ao Início
          </Button>
          
          {status === 'error' && (
            <Button href="/#corridas" $variant="secondary">
              <RotateCcw size={18} />
              Tentar Novamente
            </Button>
          )}
        </ButtonGroup>
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
    <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
      <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem' }}>Carregando...</p>
    </div>
  </div>
)

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentStatusContent />
    </Suspense>
  )
}
