'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, AlertCircle, Zap, UserPlus, CreditCard, X, Calendar, FileText, ChevronDown, ExternalLink } from 'lucide-react'
import { raceKits } from '@/data/race-data'
import type { RaceKit, ShirtSize, GenderCategory } from '@/types/race'
import { loadMercadoPago } from '@mercadopago/sdk-js'

import {
  Section, Container, SectionHeader, SectionTitle, SectionSubtitle, Grid, Card, FeaturedBadge,
  Distance, RaceName, Description, LotInfo, LotHeader, LotBadge, Slots, Price, FormGroup, Label, Input,
  ButtonGroup, ActionButton, Message, ModalOverlay, ModalContent, ModalClose, ModalTitle,
  ModalSubtitle, PriceTag, SizeSelector, SizeButton, ShoeNumberInput, ConfirmButton,
  GenderSelector, GenderButton, ElderlyCheckbox, TeamNameInput, ColorSelector, ColorButton, ColorLabel,
  ProgressBarContainer, ProgressBarFill, ProgressLabel, BannerCorrida, DocumentsPanel, DocumentLink, DocumentButtonRow,
} from './Style'

const defaultKitColors = [
  { color: '#d7ff32', name: 'Amarelo' },
  { color: '#ffffff', name: 'Branco' },
  { color: '#000000', name: 'Preto' },
]

const LOT_STATUS_POLLING_MS = 10000

type LoteStatus = {
  id: string
  nomeEvento?: string
  distance?: RaceKit['distance']
  lotLabel: string
  lotOrder: number
  price?: number
  percentualVendido: number
  vendidos: number
  capacidade: number
  vagasRestantes: number
  disponivel: boolean
  motivoIndisponibilidade?: string
  raw: Record<string, unknown>
}

type RaceKitWithStatus = RaceKit & {
  backendKitId: string
  backendLotLabel: string
  backendLotOrder: number
  backendPrice?: number
  percentualVendido: number
  vendidos: number
  capacidade: number
  vagasRestantes: number
  disponivel: boolean
  motivoIndisponibilidade?: string
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null
}

function getString(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number') return String(value)
  }

  return ''
}

function getNumber(source: Record<string, unknown>, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim()) {
      const normalized = value.replace(',', '.')
      if (Number.isFinite(Number(normalized))) return Number(normalized)
    }
  }

  return fallback
}

function getBoolean(source: Record<string, unknown>, keys: string[], fallback = false) {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase()
      if (['true', '1', 'sim', 'yes'].includes(normalized)) return true
      if (['false', '0', 'nao', 'não', 'no'].includes(normalized)) return false
    }
  }

  return fallback
}

function extractStatusItems(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload.map(asRecord).filter(Boolean) as Record<string, unknown>[]

  const record = asRecord(payload)
  if (!record) return []

  for (const key of ['lotes', 'data', 'status', 'items', 'content']) {
    const value = record[key]
    if (Array.isArray(value)) return value.map(asRecord).filter(Boolean) as Record<string, unknown>[]
  }

  return [record]
}

function normalizeLoteStatus(payload: unknown): LoteStatus[] {
  return extractStatusItems(payload).map((item, index) => {
    const id = getString(item, ['id', 'kitId', 'loteId'])
    const lotOrder = getNumber(item, ['numeroLote', 'lote', 'ordem'], index + 1)
    const vagasRestantes = getNumber(item, ['vagasRestantes', 'vagasReservaveis'])
    const capacidade = getNumber(item, ['capacidade'])
    const vendidos = getNumber(item, ['vendidos'])
    const percentualVendido = Math.max(0, Math.min(100, getNumber(item, ['percentualVendido'])))
    const disponivel = getBoolean(item, ['disponivel'], false)
    const lotName = getString(item, ['nomeLote', 'nome', 'descricaoLote'])

    return {
      id,
      nomeEvento: getString(item, ['nomeEvento', 'evento', 'eventName']),
      distance: getString(item, ['distance', 'distancia']) as RaceKit['distance'],
      lotLabel: lotName || `Lote ${lotOrder}`,
      lotOrder,
      price: getNumber(item, ['preco', 'price', 'valor'], Number.NaN),
      percentualVendido,
      vendidos,
      capacidade,
      vagasRestantes,
      disponivel,
      motivoIndisponibilidade: getString(item, ['motivoIndisponibilidade', 'motivo', 'statusMensagem']),
      raw: item,
    }
  }).filter(item => item.id)
}

function formatCurrency(value?: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// ─── Hook: trava só o overflow do body ───────────────────────────────────────

function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isLocked])
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface CardState {
  name: string
  email: string
  cpf: string
  phone: string
  birthDateInput: string
  dataNascimento: string
  message: { type: 'error' | 'success'; text: string } | null
  subscribeSuccess: boolean
}

interface ModalState {
  isOpen: boolean
  size: ShirtSize
  gender: GenderCategory
  isElderly: boolean
  shoeNumber: string
  teamName: string
  kitColor: string
  kit: RaceKitWithStatus | null
  userData: { name: string; email: string; cpf: string; phone: string; dataNascimento: string } | null
}

// ─── RaceCard ─────────────────────────────────────────────────────────────────

function RaceCard({
  kit,
  featured = false,
  openDocumentsKitId,
  onToggleDocuments,
}: {
  kit: RaceKitWithStatus
  featured?: boolean
  openDocumentsKitId: string | null
  onToggleDocuments: (kitId: string) => void
}) {
  const router = useRouter()
  const kitColors = kit.kitColors?.length ? kit.kitColors : defaultKitColors
  const initialKitColor = kitColors[0]?.color ?? '#d7ff32'
  const documents = kit.documents ?? []
  const isDocumentsOpen = openDocumentsKitId === kit.backendKitId
  const price = formatCurrency(kit.backendPrice)

  useEffect(() => {
    void loadMercadoPago()
  }, [])

  const [state, setState] = useState<CardState>({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    birthDateInput: '',
    dataNascimento: '',
    message: null,
    subscribeSuccess: false,
  })

  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    size: 'M',
    gender: 'Masculino',
    isElderly: false,
    shoeNumber: '',
    teamName: '',
    kitColor: initialKitColor,
    kit: null,
    userData: null,
  })

  useScrollLock(modal.isOpen)

  // ── Formatters ───────────────────────────────────────────────────────────────

  const formatCpf = (value: string) =>
    value.replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')

  const formatPhone = (value: string) =>
    value.replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')

  const formatBirthDate = (value: string) =>
    value.replace(/\D/g, '')
      .slice(0, 8)
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})\/(\d{2})(\d)/, '$1/$2/$3')

  const birthDateToIso = (value: string) => {
    const digits = value.replace(/\D/g, '')

    if (digits.length !== 8) return ''

    const day = digits.slice(0, 2)
    const month = digits.slice(2, 4)
    const year = digits.slice(4, 8)
    const date = new Date(Number(year), Number(month) - 1, Number(day))

    if (
      date.getFullYear() !== Number(year) ||
      date.getMonth() !== Number(month) - 1 ||
      date.getDate() !== Number(day)
    ) {
      return ''
    }

    return `${year}-${month}-${day}`
  }

  // ── Validation ───────────────────────────────────────────────────────────────

  const isFormValid =
    Boolean(state.name.trim()) &&
    Boolean(state.email.trim()) &&
    Boolean(state.dataNascimento) &&
    state.cpf.replace(/\D/g, '').length === 11 &&
    state.phone.replace(/\D/g, '').length >= 10

  const showValidationError = () =>
    setState(prev => ({
      ...prev,
      message: { type: 'error', text: 'Preencha todos os campos corretamente' },
    }))

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleSubscribe = () => {
    if (!isFormValid) { showValidationError(); return }
    setState(prev => ({
      ...prev,
      subscribeSuccess: true,
      message: { type: 'success', text: 'Inscrição realizada com sucesso! Aguarde confirmação por e-mail.' },
    }))
    window.setTimeout(() => {
      setState({ name: '', email: '', cpf: '', phone: '', birthDateInput: '', message: null, subscribeSuccess: false, dataNascimento: '' })
    }, 3000)
  }

  const handleBuyClick = () => {
    if (!isFormValid) { showValidationError(); return }
    if (!kit.disponivel) {
      setState(prev => ({
        ...prev,
        message: {
          type: 'error',
          text: kit.motivoIndisponibilidade || 'Este lote não está disponível para compra.',
        },
      }))
      return
    }

    setModal({
      isOpen: true,
      size: 'M',
      gender: 'Masculino',
      isElderly: false,
      shoeNumber: '',
      teamName: '',
      kitColor: initialKitColor,
      kit,
      userData: {
        name: state.name,
        email: state.email,
        cpf: state.cpf,
        phone: state.phone,
        dataNascimento: state.dataNascimento,
      },
    })
  }

  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }))

  const handleConfirmPurchase = () => {
    const selectedKitColor = kitColors.find(({ color }) => color === modal.kitColor)
    const paymentData = {
      kitId: modal.kit?.backendKitId,
      eventName: modal.kit?.raceName,
      distance: modal.kit?.distance,
      user: modal.userData,
      shirtSize: modal.size,
      gender: modal.gender,
      isElderly: modal.isElderly,
      shoeNumber: modal.shoeNumber,
      teamName: modal.teamName,
      kitColor: modal.kitColor,
      kitColorName: selectedKitColor?.name ?? '',
    }
    sessionStorage.setItem('pendingPayment', JSON.stringify(paymentData))
    router.push('/pagamento/processar')
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <Card $featured={featured}>
        {featured && (
          <FeaturedBadge>
            <Zap size={12} />
            Lote Atual
          </FeaturedBadge>
        )}

        <Distance>{kit.distance}</Distance>
        {kit.img && <BannerCorrida src={kit.img} alt={kit.raceName} />}
        <RaceName>{kit.raceName}</RaceName>
        <Description>{kit.description}</Description>

        <LotInfo>
          <LotHeader>
            <LotBadge>{kit.backendLotLabel}</LotBadge>
            <Slots>{kit.vagasRestantes} vagas disponíveis</Slots>
          </LotHeader>
          <ProgressBarContainer>
            <ProgressBarFill
              $percentage={kit.percentualVendido}
              $critical={kit.percentualVendido >= 90}
            />
          </ProgressBarContainer>
          <ProgressLabel>
            <span>{kit.vendidos}/{kit.capacidade} vendidas</span>
            <span>{kit.percentualVendido}% vendido</span>
          </ProgressLabel>
        </LotInfo>

        <Price>
          {price ?? 'Preço no checkout'} <small>/ kit</small>
        </Price>

        <FormGroup>
          <Label>Nome Completo</Label>
          <Input
            type="text"
            placeholder="Seu nome completo"
            value={state.name}
            onChange={e => setState(prev => ({ ...prev, name: e.target.value }))}
          />
        </FormGroup>

        <FormGroup>
          <Label>E-mail</Label>
          <Input
            type="email"
            placeholder="seu@email.com"
            value={state.email}
            onChange={e => setState(prev => ({ ...prev, email: e.target.value }))}
          />
        </FormGroup>
        <FormGroup>
          <Label>CPF</Label>
          <Input
            type="text"
            placeholder="000.000.000-00"
            value={state.cpf}
            onChange={e => setState(prev => ({ ...prev, cpf: formatCpf(e.target.value) }))}
            maxLength={14}
          />
        </FormGroup>

        <FormGroup>
          <Label>Data de Nascimento</Label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="bday"
              placeholder="DD/MM/AAAA"
              value={state.birthDateInput}
              onChange={e => {
                const formattedDate = formatBirthDate(e.target.value)

                setState(prev => ({
                  ...prev,
                  birthDateInput: formattedDate,
                  dataNascimento: birthDateToIso(formattedDate),
                }))
              }}
              onBlur={e => {
                const isoDate = birthDateToIso(e.target.value)

                setState(prev => ({
                  ...prev,
                  birthDateInput: isoDate ? prev.birthDateInput : '',
                  dataNascimento: isoDate,
                }))
              }}
              maxLength={10}
              style={{ paddingRight: '40px' }}
            />
            <Calendar size={18} style={{ position: 'absolute', right: '12px', color: '#666', pointerEvents: 'none' }} />
          </div>
        </FormGroup>

        <FormGroup>
          <Label>Telefone / WhatsApp</Label>
          <Input
            type="text"
            placeholder="(00) 00000-0000"
            value={state.phone}
            onChange={e => setState(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
            maxLength={15}
          />
        </FormGroup>

        <ButtonGroup>
          <ActionButton
            type="button"
            $variant="subscribe"
            $success={state.subscribeSuccess}
            onClick={handleSubscribe}
            disabled={!isFormValid && !state.subscribeSuccess}
          >
            {state.subscribeSuccess ? (
              <><Check size={18} />Inscrito!</>
            ) : (
              <><UserPlus size={18} />Inscrever</>
            )}
          </ActionButton>
          <ActionButton type="button" $variant="buy" onClick={handleBuyClick} disabled={!isFormValid || !kit.disponivel}>
            <CreditCard size={18} />
            {kit.disponivel ? 'Comprar Kit' : 'Indisponível'}
          </ActionButton>
        </ButtonGroup>

        {!kit.disponivel && kit.motivoIndisponibilidade && (
          <Message $type="error">
            <AlertCircle size={16} />
            {kit.motivoIndisponibilidade}
          </Message>
        )}

        {documents.length > 0 && (
          <DocumentButtonRow>
            <ActionButton
              type="button"
              $variant="docs"
              $expanded={isDocumentsOpen}
              onClick={() => onToggleDocuments(kit.backendKitId)}
              aria-expanded={isDocumentsOpen}
            >
              <FileText size={18} />
              PDFs
              <ChevronDown size={16} />
            </ActionButton>
          </DocumentButtonRow>
        )}

        {documents.length > 0 && (
          <DocumentsPanel $open={isDocumentsOpen}>
            {documents.map(document => (
              <DocumentLink key={document.href} href={document.href} target="_blank" rel="noreferrer">
                <span>
                  <FileText size={16} />
                  {document.label}
                </span>
                <ExternalLink size={15} />
              </DocumentLink>
            ))}
          </DocumentsPanel>
        )}

        {state.message && (
          <Message $type={state.message.type}>
            <AlertCircle size={16} />
            {state.message.text}
          </Message>
        )}
      </Card>

      {/* ── Modal de Compra ── */}
      <ModalOverlay $isOpen={modal.isOpen} onClick={closeModal}>
        <ModalContent onClick={e => e.stopPropagation()}>
          <ModalClose onClick={closeModal}>
            <X size={24} />
          </ModalClose>

          <ModalTitle>Finalizar Compra</ModalTitle>
          <ModalSubtitle>Escolha a categoria, tamanho da camisa e numeração</ModalSubtitle>

          <PriceTag>
            <span>{price ?? 'Preço no checkout'}</span>
          </PriceTag>

          <FormGroup>
            <Label>Categoria</Label>
            <GenderSelector>
              {(['Masculino', 'Feminino', 'LGBTQIA+', '60+'] as GenderCategory[]).map(gender => (
                <GenderButton
                  key={gender}
                  type="button"
                  $selected={modal.gender === gender}
                  onClick={() => setModal(prev => ({ ...prev, gender }))}
                >
                  {gender}
                </GenderButton>
              ))}
            </GenderSelector>
          </FormGroup>

          <ElderlyCheckbox>
            <input
              type="checkbox"
              checked={modal.isElderly}
              onChange={e => setModal(prev => ({ ...prev, isElderly: e.target.checked }))}
            />
            <span>Idoso (60+)</span>
          </ElderlyCheckbox>

          <FormGroup>
            <Label>Tamanho da Camisa</Label>
            <SizeSelector>
              {(['PP', 'P', 'M', 'G', 'GG'] as ShirtSize[]).map(size => (
                <SizeButton
                  key={size}
                  type="button"
                  $selected={modal.size === size}
                  onClick={() => setModal(prev => ({ ...prev, size }))}
                >
                  {size}
                </SizeButton>
              ))}
            </SizeSelector>
          </FormGroup>

          {/* <ShoeNumberInput>
            <Label>Numeração (opcional)</Label>
            <Input
              type="text"
              placeholder="Ex: 42"
              value={modal.shoeNumber}
              onChange={e => setModal(prev => ({
                ...prev,
                shoeNumber: e.target.value.replace(/\D/g, '').slice(0, 2),
              }))}
              maxLength={2}
            />
          </ShoeNumberInput> */}

          <TeamNameInput>
            <Label>Nome da Equipe (opcional)</Label>
            <Input
              type="text"
              placeholder="Ex: Corredores do Bairro"
              value={modal.teamName}
              onChange={e => setModal(prev => ({ ...prev, teamName: e.target.value }))}
            />
          </TeamNameInput>

          <FormGroup>
            <ColorLabel>Cor do Kit</ColorLabel>
            <ColorSelector>
              {kitColors.map(({ color, name }) => (
                <ColorButton
                  key={color}
                  type="button"
                  $selected={modal.kitColor === color}
                  $color={color}
                  onClick={() => setModal(prev => ({ ...prev, kitColor: color }))}
                  title={name}
                />
              ))}
            </ColorSelector>
          </FormGroup>

          <ConfirmButton type="button" onClick={handleConfirmPurchase} disabled={!kit.disponivel}>
            <CreditCard size={18} />
            Ir para Pagamento
          </ConfirmButton>
        </ModalContent>
      </ModalOverlay>
    </>
  )
}

// ─── RaceCards (export default) ───────────────────────────────────────────────

export default function RaceCards() {
  const [openDocumentsKitId, setOpenDocumentsKitId] = useState<string | null>(null)
  const [statusByEvent, setStatusByEvent] = useState<Record<string, LoteStatus[]>>({})
  const [statusError, setStatusError] = useState<string | null>(null)
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)

  const eventNames = useMemo(
    () => Array.from(new Set(raceKits.map(kit => kit.raceName))),
    [],
  )

  const refreshStatuses = useCallback(async () => {
    try {
      const results = await Promise.all(eventNames.map(async nomeEvento => {
        const response = await fetch(`/api/lotes/status?nomeEvento=${encodeURIComponent(nomeEvento)}`, {
          cache: 'no-store',
        })
        const payload = await response.json()

        if (!response.ok) {
          const message = payload?.erro ?? payload?.message ?? `Nao foi possivel consultar lotes de ${nomeEvento}.`
          throw new Error(message)
        }

        return [nomeEvento, normalizeLoteStatus(payload)] as const
      }))

      setStatusByEvent(Object.fromEntries(results))
      setStatusError(null)
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Nao foi possivel consultar os lotes agora.')
    } finally {
      setIsLoadingStatus(false)
    }
  }, [eventNames])

  useEffect(() => {
    void refreshStatuses()

    const intervalId = window.setInterval(() => {
      void refreshStatuses()
    }, LOT_STATUS_POLLING_MS)

    const refreshOnFocus = () => {
      void refreshStatuses()
    }

    const refreshOnCheckoutAttempt = (event: StorageEvent) => {
      if (event.key === 'lotesStatusRefreshAt') void refreshStatuses()
    }

    window.addEventListener('focus', refreshOnFocus)
    window.addEventListener('storage', refreshOnCheckoutAttempt)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refreshOnFocus)
      window.removeEventListener('storage', refreshOnCheckoutAttempt)
    }
  }, [refreshStatuses])

  const kitsWithStatus = useMemo(() => {
    return raceKits.flatMap(kit => {
      const statuses = [...(statusByEvent[kit.raceName] ?? [])].sort((a, b) =>
        String(a.distance || kit.distance).localeCompare(String(b.distance || kit.distance)) ||
        a.lotOrder - b.lotOrder
      )

      return statuses.map(status => ({
        ...kit,
        id: status.id,
        distance: status.distance || kit.distance,
        backendKitId: status.id,
        backendLotLabel: status.lotLabel,
        backendLotOrder: status.lotOrder,
        backendPrice: status.price,
        percentualVendido: status.percentualVendido,
        vendidos: status.vendidos,
        capacidade: status.capacidade,
        vagasRestantes: status.vagasRestantes,
        disponivel: status.disponivel,
        motivoIndisponibilidade: status.motivoIndisponibilidade,
      }))
    })
  }, [statusByEvent])

  const featuredLotIds = useMemo(() => {
    const seenGroups = new Set<string>()
    const ids = new Set<string>()

    kitsWithStatus.forEach(kit => {
      if (!kit.disponivel) return

      const key = `${kit.raceName}::${kit.distance}`
      if (!seenGroups.has(key)) {
        seenGroups.add(key)
        ids.add(kit.backendKitId)
      }
    })

    return ids
  }, [kitsWithStatus])

  const handleToggleDocuments = (kitId: string) => {
    setOpenDocumentsKitId(currentKitId => currentKitId === kitId ? null : kitId)
  }

  return (
    <Section id="corridas">
      <Container>
        <SectionHeader>
          <SectionTitle>Escolha sua <strong>Corrida</strong></SectionTitle>
          <SectionSubtitle>
            Selecione a distância ideal para você e garanta seu kit com a camisa oficial do evento
          </SectionSubtitle>
        </SectionHeader>
        {statusError && (
          <Message $type="error">
            <AlertCircle size={16} />
            {statusError}
          </Message>
        )}
        <Grid>
          {isLoadingStatus && kitsWithStatus.length === 0 && (
            <Message $type="success">
              Consultando lotes disponíveis...
            </Message>
          )}
          {kitsWithStatus.map(kit => (
            <RaceCard
              key={kit.backendKitId}
              kit={kit}
              featured={featuredLotIds.has(kit.backendKitId)}
              openDocumentsKitId={openDocumentsKitId}
              onToggleDocuments={handleToggleDocuments}
            />
          ))}
        </Grid>
      </Container>
    </Section>
  )
}
