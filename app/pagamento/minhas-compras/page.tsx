'use client'

import styled from 'styled-components'
import { useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { breakpoints } from '@/lib/breakpoints'

type ApiOrder = {
  id?: string | number
  idPedido?: string | number
  evento?: string
  nomeEvento?: string
  eventName?: string
  lote?: string
  nomeLote?: string
  lotName?: string
  status?: string
  codigoPedido?: string
  codigo?: string
  code?: string
  valorTotal?: number | string
  total?: number | string
  emailContato?: string | null
  dataCompra?: string
  prazoReembolsoDias?: number
  dataLimiteReembolso?: string
  eventoComDataAlterada?: boolean
  createdAt?: string
  permiteSolicitarReembolso?: boolean
  motivoIndisponibilidadeReembolso?: string | null
}

type RefundDraft = {
  emailContato: string
  observacao: string
  confirming: boolean
  loading: boolean
  message: string | null
  messageTone: 'error' | 'success' | 'info'
  idSolicitacao?: string | number
  statusSolicitacao?: string
}

type RefundRequestResponse = {
  ok?: boolean
  mensagem?: string
  message?: string
  erro?: string
  error?: string
  idSolicitacao?: string | number
  statusSolicitacao?: string
  data?: {
    idSolicitacao?: string | number
    statusSolicitacao?: string
  }
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'https://api-1kmzinho.onrender.com').replace(/\/$/, '')

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;

  @media (max-width: ${breakpoints.tablet}) {
    padding: 1rem;
    align-items: flex-start;
  }
`

const Container = styled.div`
  max-width: 720px;
  width: 100%;
  background: linear-gradient(145deg, #141414 0%, #1a1a1a 100%);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.08);

  @media (max-width: ${breakpoints.tablet}) {
    margin-top: 5rem;
    padding: 1.25rem;
    border-radius: 14px;
  }
`

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.78);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.7rem 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
  transition: all 0.2s ease;

  &:hover {
    color: #fff;
    border-color: rgba(0, 164, 245, 0.35);
    background: rgba(0, 164, 245, 0.08);
  }

  @media (max-width: ${breakpoints.tablet}) {
    width: fit-content;
    font-size: 0.85rem;
    padding: 0.65rem 0.8rem;
  }
`

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #39FF14 0%, #F50187 50%, #00A4F5 100%);
  -webkit-background-clip: text;
  color: transparent;

  @media (max-width: ${breakpoints.tablet}) {
    font-size: 1.3rem;
  }
`

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  margin-bottom: 1.5rem;

  @media (max-width: ${breakpoints.tablet}) {
    font-size: 0.9rem;
    line-height: 1.5;
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
`

const Input = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: #00A4F5;
    box-shadow: 0 0 0 1px rgba(0, 164, 245, 0.4);
  }

  @media (max-width: ${breakpoints.tablet}) {
    font-size: 0.9rem;
  }
`

const Button = styled.button`
  margin-top: 1rem;
  width: 100%;
  padding: 0.9rem 1.5rem;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #39FF14 0%, #F50187 50%, #00A4F5 100%);
  color: #0a0a0a;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 10px 30px rgba(0, 164, 245, 0.35);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
    transform: none;
    box-shadow: none;
  }

  @media (max-width: ${breakpoints.tablet}) {
    padding: 0.85rem 1rem;
    font-size: 0.9rem;
  }
`

const Helper = styled.p<{ $tone?: 'error' | 'success' | 'info' }>`
  margin-top: 0.75rem;
  font-size: 0.84rem;
  line-height: 1.5;
  color: ${({ $tone }) => {
    if ($tone === 'error') return '#ff7f7f'
    if ($tone === 'success') return '#39FF14'
    return 'rgba(255, 255, 255, 0.55)'
  }};
`

const OrdersList = styled.div`
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
`

const OrderCard = styled.article`
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
`

const OrderGrid = styled.div`
  display: grid;
  gap: 0.85rem;

  @media (min-width: 620px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const OrderItem = styled.div`
  min-width: 0;

  span {
    display: block;
    color: rgba(255, 255, 255, 0.48);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 0.25rem;
  }

  strong {
    display: block;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.92rem;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }
`

const RefundInfo = styled.div`
  margin-top: 1rem;
  padding: 0.85rem;
  border-radius: 10px;
  background: rgba(0, 164, 245, 0.07);
  border: 1px solid rgba(0, 164, 245, 0.16);
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.84rem;
  line-height: 1.5;

  strong {
    color: rgba(255, 255, 255, 0.92);
  }
`

const RefundForm = styled.div`
  display: grid;
  gap: 0.8rem;
  margin-top: 1rem;
`

const TextArea = styled.textarea`
  min-height: 84px;
  resize: vertical;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: #00A4F5;
    box-shadow: 0 0 0 1px rgba(0, 164, 245, 0.4);
  }
`

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(5px);
`

const ModalContent = styled.div`
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.25rem;
  border-radius: 16px;
  border: 1px solid rgba(57, 255, 20, 0.18);
  background: linear-gradient(145deg, #141414 0%, #1a1a1a 100%);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.42);

  @media (max-width: ${breakpoints.tablet}) {
    padding: 1rem;
  }
`

const ConfirmationBox = styled.div`
  display: grid;
  gap: 0.8rem;
`

const ConfirmationTitle = styled.h3`
  margin: 0;
  color: rgba(255, 255, 255, 0.94);
  font-size: 1rem;
  font-weight: 800;
`

const ActionRow = styled.div`
  display: grid;
  gap: 0.6rem;

  @media (min-width: 520px) {
    grid-template-columns: 1fr 1fr;
  }
`

const RefundButton = styled.button`
  margin-top: 1rem;
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(57, 255, 20, 0.35);
  cursor: pointer;
  font-weight: 700;
  font-size: 0.9rem;
  background: rgba(57, 255, 20, 0.08);
  color: #39FF14;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(57, 255, 20, 0.14);
    border-color: rgba(57, 255, 20, 0.55);
  }

  &:disabled {
    cursor: not-allowed;
    color: rgba(255, 255, 255, 0.42);
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.1);
  }
`

const SecondaryButton = styled.button`
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  font-weight: 700;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.78);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.22);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`

const RequestStatus = styled.div`
  margin-top: 1rem;
  padding: 0.85rem;
  border-radius: 10px;
  background: rgba(57, 255, 20, 0.08);
  border: 1px solid rgba(57, 255, 20, 0.2);
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.84rem;
  line-height: 1.5;

  strong {
    color: #39FF14;
  }
`

function normalizeCPF(value: string) {
  return value.replace(/\D/g, '')
}

function readOrders(payload: unknown): ApiOrder[] {
  if (Array.isArray(payload)) return payload as ApiOrder[]
  if (payload && typeof payload === 'object') {
    const data = payload as { pedidos?: unknown; orders?: unknown; data?: unknown }

    if (Array.isArray(data.pedidos)) return data.pedidos as ApiOrder[]
    if (Array.isArray(data.orders)) return data.orders as ApiOrder[]
    if (Array.isArray(data.data)) return data.data as ApiOrder[]
  }

  return []
}

function formatCurrency(value: ApiOrder['valorTotal']) {
  if (value === undefined || value === null || value === '') return 'Não informado'

  const amount = typeof value === 'number'
    ? value
    : Number(String(value).replace(',', '.'))

  if (Number.isNaN(amount)) return String(value)

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount)
}

function formatDate(value?: string) {
  if (!value) return 'Não informado'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function getOrderKey(order: ApiOrder, index: number) {
  return String(order.idPedido ?? order.id ?? order.codigoPedido ?? order.codigo ?? order.code ?? index)
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function getRefundRequestId(data: RefundRequestResponse) {
  return data.idSolicitacao ?? data.data?.idSolicitacao
}

function getRefundRequestStatus(data: RefundRequestResponse) {
  return data.statusSolicitacao ?? data.data?.statusSolicitacao
}

export default function MinhasComprasPage() {
  const [cpf, setCpf] = useState('')
  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [refundDrafts, setRefundDrafts] = useState<Record<string, RefundDraft>>({})
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [messageTone, setMessageTone] = useState<'error' | 'success' | 'info'>('info')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage(null)
    setOrders([])
    setRefundDrafts({})
    setHasSearched(false)

    const normalizedCpf = normalizeCPF(cpf)

    if (normalizedCpf.length !== 11) {
      setMessageTone('error')
      setMessage('Informe um CPF com 11 dígitos para buscar sua compra.')
      return
    }

    try {
      setLoading(true)

      const res = await fetch(`${API_BASE_URL}/pedidos/consulta?cpf=${encodeURIComponent(normalizedCpf)}`)

      if (res.status === 404) {
        setHasSearched(true)
        return
      }

      if (!res.ok) {
        setMessageTone('error')
        setMessage('Não foi possível consultar as compras agora. Tente novamente.')
        return
      }

      const data = await res.json()
      const foundOrders = readOrders(data)

      setOrders(foundOrders)
      setRefundDrafts(
        foundOrders.reduce<Record<string, RefundDraft>>((drafts, order, index) => {
          drafts[getOrderKey(order, index)] = {
            emailContato: order.emailContato ?? '',
            observacao: '',
            confirming: false,
            loading: false,
            message: null,
            messageTone: 'info',
          }

          return drafts
        }, {})
      )
      setHasSearched(true)
    } catch (err) {
      console.error(err)
      setMessageTone('error')
      setMessage('Erro ao consultar o CPF. Verifique sua conexão e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function updateRefundDraft(orderKey: string, patch: Partial<RefundDraft>) {
    setRefundDrafts(prev => {
      const current = prev[orderKey] ?? {
        emailContato: '',
        observacao: '',
        confirming: false,
        loading: false,
        message: null,
        messageTone: 'info',
      }

      return {
        ...prev,
        [orderKey]: {
          ...current,
          ...patch,
        },
      }
    })
  }

  function handleRefundRequest(orderKey: string) {
    updateRefundDraft(orderKey, {
      confirming: true,
      message: null,
      messageTone: 'info',
    })
  }

  async function confirmRefundRequest(order: ApiOrder, orderKey: string) {
    const normalizedCpf = normalizeCPF(cpf)
    const idPedido = order.idPedido ?? order.id
    const draft = refundDrafts[orderKey]
    const emailContato = draft?.emailContato.trim() ?? ''

    if (!idPedido) {
      updateRefundDraft(orderKey, {
        message: 'Não foi possível identificar o pedido para solicitar reembolso.',
        messageTone: 'error',
      })
      return
    }

    if (!isValidEmail(emailContato)) {
      updateRefundDraft(orderKey, {
        message: 'Informe um e-mail válido para contato.',
        messageTone: 'error',
      })
      return
    }

    try {
      updateRefundDraft(orderKey, { loading: true, message: null })

      const res = await fetch(`${API_BASE_URL}/pedidos/${encodeURIComponent(String(idPedido))}/solicitar-reembolso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf: normalizedCpf,
          emailContato,
          observacao: draft?.observacao.trim() || undefined,
        }),
      })

      const data = (await res.json().catch(() => ({}))) as RefundRequestResponse
      const responseMessage = data.mensagem ?? data.message ?? data.erro ?? data.error

      if (!res.ok || data.ok === false) {
        updateRefundDraft(orderKey, {
          loading: false,
          message: responseMessage ?? 'Não foi possível solicitar o reembolso agora. Tente novamente.',
          messageTone: 'error',
        })
        return
      }

      updateRefundDraft(orderKey, {
        confirming: false,
        loading: false,
        message: responseMessage ?? 'Solicitação de reembolso enviada com sucesso.',
        messageTone: 'success',
        idSolicitacao: getRefundRequestId(data),
        statusSolicitacao: getRefundRequestStatus(data),
      })
    } catch (err) {
      console.error(err)
      updateRefundDraft(orderKey, {
        loading: false,
        message: 'Não foi possível enviar a solicitação. Tente novamente.',
        messageTone: 'error',
      })
    }
  }

  const confirmationEntry = orders
    .map((order, index) => ({
      order,
      orderKey: getOrderKey(order, index),
    }))
    .find(({ orderKey }) => refundDrafts[orderKey]?.confirming)

  return (
    <PageWrapper>
      <Container>
        <BackButton href="/">
          <ArrowLeft size={16} />
          Voltar
        </BackButton>

        <Title>Minha compra</Title>
        <Subtitle>
          Informe o CPF utilizado na compra para localizar seus pedidos e consultar os dados
          da inscrição.
        </Subtitle>

        <Form onSubmit={handleSubmit}>
          <Label>
            CPF do participante
            <Input
              type="text"
              inputMode="numeric"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
            />
          </Label>

          <Button type="submit" disabled={loading}>
            {loading ? 'Buscando compra...' : 'Buscar compra'}
          </Button>
        </Form>

        <Helper>
          O CPF pode ser digitado com ou sem pontos e traço.
        </Helper>

        {message && (
          <Helper $tone={messageTone} style={{ marginTop: '1rem' }}>
            {message}
          </Helper>
        )}

        {hasSearched && orders.length === 0 && !message && (
          <Helper $tone="info" style={{ marginTop: '1rem' }}>
            Nenhuma compra foi localizada para esse CPF. Confira os números digitados ou fale
            com a organização.
          </Helper>
        )}

        {orders.length > 0 && (
          <OrdersList>
            {orders.map((order, index) => {
              const eventName = order.nomeEvento ?? order.evento ?? order.eventName ?? 'Não informado'
              const lotName = order.nomeLote ?? order.lote ?? order.lotName ?? 'Não informado'
              const orderCode = order.codigoPedido ?? order.codigo ?? order.code ?? 'Não informado'
              const orderId = getOrderKey(order, index)
              const refundDeadlineText = formatDate(order.dataLimiteReembolso)
              const refundPolicyText = order.eventoComDataAlterada
                ? 'Prazo estendido para 30 dias por alteração na data do evento.'
                : 'Prazo padrão de 7 dias a partir da compra.'
              const draft = refundDrafts[orderId] ?? {
                emailContato: order.emailContato ?? '',
                observacao: '',
                confirming: false,
                loading: false,
                message: null,
                messageTone: 'info',
              }
              const canRequestRefund = Boolean(order.permiteSolicitarReembolso && isValidEmail(draft.emailContato))

              return (
                <OrderCard key={`${orderId}-${index}`}>
                  <OrderGrid>
                    <OrderItem>
                      <span>Evento</span>
                      <strong>{eventName}</strong>
                    </OrderItem>
                    <OrderItem>
                      <span>Lote</span>
                      <strong>{lotName}</strong>
                    </OrderItem>
                    <OrderItem>
                      <span>Status</span>
                      <strong>{order.status ?? 'Não informado'}</strong>
                    </OrderItem>
                    <OrderItem>
                      <span>Código do pedido</span>
                      <strong>{orderCode}</strong>
                    </OrderItem>
                    <OrderItem>
                      <span>Valor total</span>
                      <strong>{formatCurrency(order.valorTotal ?? order.total)}</strong>
                    </OrderItem>
                    <OrderItem>
                      <span>Data da compra</span>
                      <strong>{formatDate(order.dataCompra)}</strong>
                    </OrderItem>
                    <OrderItem>
                      <span>Prazo para reembolso</span>
                      <strong>
                        {order.prazoReembolsoDias !== undefined
                          ? `${order.prazoReembolsoDias} dias`
                          : 'Não informado'}
                      </strong>
                    </OrderItem>
                    <OrderItem>
                      <span>Data limite do reembolso</span>
                      <strong>{refundDeadlineText}</strong>
                    </OrderItem>
                    {order.emailContato && (
                      <OrderItem>
                        <span>E-mail de contato</span>
                        <strong>{order.emailContato}</strong>
                      </OrderItem>
                    )}
                  </OrderGrid>

                  <RefundInfo>
                    <strong>Reembolso:</strong> {refundPolicyText}
                  </RefundInfo>

                  <RefundForm>
                    <Label>
                      {order.emailContato ? 'E-mail para contato' : 'E-mail para contato obrigatório'}
                      <Input
                        type="email"
                        placeholder="voce@email.com"
                        value={draft.emailContato}
                        onChange={(e) => updateRefundDraft(orderId, {
                          emailContato: e.target.value,
                          message: null,
                        })}
                      />
                    </Label>

                    <Label>
                      Observação opcional
                      <TextArea
                        placeholder="Se quiser, deixe uma observação para a organização."
                        value={draft.observacao}
                        onChange={(e) => updateRefundDraft(orderId, { observacao: e.target.value })}
                      />
                    </Label>
                  </RefundForm>

                  <RefundButton
                    type="button"
                    disabled={!canRequestRefund || draft.loading}
                    onClick={() => handleRefundRequest(orderId)}
                  >
                    {draft.loading ? 'Enviando...' : 'Solicitar reembolso'}
                  </RefundButton>

                  {!order.permiteSolicitarReembolso && order.motivoIndisponibilidadeReembolso && (
                    <Helper $tone="error">
                      {order.motivoIndisponibilidadeReembolso}
                    </Helper>
                  )}

                  {order.permiteSolicitarReembolso && draft.emailContato && !isValidEmail(draft.emailContato) && (
                    <Helper $tone="error">
                      Informe um e-mail válido para habilitar a solicitação de reembolso.
                    </Helper>
                  )}

                  {order.permiteSolicitarReembolso && !draft.emailContato.trim() && (
                    <Helper $tone="error">
                      Informe um e-mail de contato para solicitar o reembolso.
                    </Helper>
                  )}

                  {draft.message && (
                    <Helper $tone={draft.messageTone}>
                      {draft.message}
                    </Helper>
                  )}

                  {(draft.idSolicitacao || draft.statusSolicitacao) && (
                    <RequestStatus>
                      <strong>Solicitação registrada.</strong>
                      {draft.idSolicitacao && (
                        <>
                          <br />
                          Código da solicitação: {draft.idSolicitacao}
                        </>
                      )}
                      {draft.statusSolicitacao && (
                        <>
                          <br />
                          Status: {draft.statusSolicitacao}
                        </>
                      )}
                    </RequestStatus>
                  )}
                </OrderCard>
              )
            })}
          </OrdersList>
        )}
      </Container>

      {confirmationEntry && (() => {
        const { order, orderKey } = confirmationEntry
        const draft = refundDrafts[orderKey]
        const eventName = order.nomeEvento ?? order.evento ?? order.eventName ?? 'Não informado'
        const refundDeadlineText = formatDate(order.dataLimiteReembolso)
        const purchaseDateText = formatDate(order.dataCompra)

        return (
          <ModalOverlay
            role="presentation"
            onClick={() => {
              if (!draft?.loading) updateRefundDraft(orderKey, { confirming: false })
            }}
          >
            <ModalContent
              role="dialog"
              aria-modal="true"
              aria-labelledby="refund-confirmation-title"
              onClick={(e) => e.stopPropagation()}
            >
              <ConfirmationBox>
                <ConfirmationTitle id="refund-confirmation-title">
                  Confirmar solicitação de reembolso
                </ConfirmationTitle>

                <OrderGrid>
                  <OrderItem>
                    <span>Evento</span>
                    <strong>{eventName}</strong>
                  </OrderItem>
                  <OrderItem>
                    <span>Data da compra</span>
                    <strong>{purchaseDateText}</strong>
                  </OrderItem>
                  <OrderItem>
                    <span>Prazo limite</span>
                    <strong>{refundDeadlineText}</strong>
                  </OrderItem>
                  <OrderItem>
                    <span>E-mail de contato</span>
                    <strong>{draft?.emailContato ?? 'Não informado'}</strong>
                  </OrderItem>
                </OrderGrid>

                {draft?.observacao.trim() && (
                  <OrderItem>
                    <span>Observação</span>
                    <strong>{draft.observacao.trim()}</strong>
                  </OrderItem>
                )}

                {draft?.message && draft.messageTone === 'error' && (
                  <Helper $tone="error">
                    {draft.message}
                  </Helper>
                )}

                <ActionRow>
                  <SecondaryButton
                    type="button"
                    disabled={draft?.loading}
                    onClick={() => updateRefundDraft(orderKey, { confirming: false })}
                  >
                    Cancelar
                  </SecondaryButton>
                  <RefundButton
                    type="button"
                    disabled={draft?.loading}
                    onClick={() => confirmRefundRequest(order, orderKey)}
                  >
                    {draft?.loading ? 'Enviando...' : 'Confirmar solicitação'}
                  </RefundButton>
                </ActionRow>
              </ConfirmationBox>
            </ModalContent>
          </ModalOverlay>
        )
      })()}
    </PageWrapper>
  )
}
