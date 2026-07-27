'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, AlertCircle, Zap, UserPlus, CreditCard, X, Calendar, FileText, ChevronDown, ExternalLink, Loader2, Share2 } from 'lucide-react'
import { raceKits } from '@/data/race-data'
import type { RaceKit, ShirtSize, GenderCategory } from '@/types/race'
import { loadMercadoPago } from '@mercadopago/sdk-js'

import {
  Section, Container, SectionHeader, SectionTitle, SectionSubtitle, Grid, Card, FeaturedBadge,
  Distance, RaceName, Description, LotInfo, LotBadge, Price, FormGroup, Label, Input,
  ButtonGroup, ActionButton, Message, ModalOverlay, ModalContent, ModalClose, ModalTitle,
  ModalSubtitle, PriceTag, SizeSelector, SizeButton, ShoeNumberInput, ConfirmButton,
  GenderSelector, GenderButton, ElderlyCheckbox, TeamNameInput, ColorSelector, ColorButton, ColorLabel,
  BannerCorrida, DocumentsPanel, DocumentLink, DocumentButtonRow,
  KitOptionSelector, KitOptionButton, CheckoutLoadingOverlay, CheckoutLoadingCard,
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
  precos: LotePreco[]
  percentualVendido: number
  vendidos: number
  capacidade: number
  vagasRestantes: number
  disponivel: boolean
  possuiPrecoPcdAtivo: boolean
  motivoIndisponibilidade?: string
  raw: Record<string, unknown>
}

type RaceKitWithStatus = RaceKit & {
  shareSlug: string
  backendKitId: string
  backendLotLabel: string
  backendLotOrder: number
  backendPrice?: number
  precos: LotePreco[]
  percentualVendido: number
  vendidos: number
  capacidade: number
  vagasRestantes: number
  disponivel: boolean
  possuiPrecoPcdAtivo: boolean
  motivoIndisponibilidade?: string
}

type ApiCategoria = 'MASCULINO' | 'FEMININO' | 'MAIOR_60' | 'LGBTQIA' | 'PCD'

type LotePreco = {
  categoria: string
  valor: number
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

function normalizarCategoriaPreco(categoria?: string): ApiCategoria | null {
  const value = String(categoria || '').toLowerCase()

  if (value === 'pcd' || value.includes('pcd')) return 'PCD'
  if (value.includes('60') || value.includes('maior_60')) return 'MAIOR_60'
  if (value.includes('fem')) return 'FEMININO'
  if (value.includes('lgbt')) return 'LGBTQIA'
  if (value.includes('masc')) return 'MASCULINO'

  return null
}

function normalizePrecos(source: Record<string, unknown>): LotePreco[] {
  const precos = source.precos
  if (!Array.isArray(precos)) return []

  return precos.map(preco => {
    const record = asRecord(preco)
    if (!record) return null

    const categoria = getString(record, ['categoria'])
    const valor = getNumber(record, ['valor'], Number.NaN)

    if (!categoria || !Number.isFinite(valor)) return null

    return { categoria, valor }
  }).filter(Boolean) as LotePreco[]
}

function hasActiveCategoryPrice(source: Record<string, unknown>, category: string) {
  const precos = normalizePrecos(source)
  const normalizedCategory = normalizarCategoriaPreco(category)
  if (!normalizedCategory) return false

  return precos.some(preco => {
    return normalizarCategoriaPreco(preco.categoria) === normalizedCategory && preco.valor > 0
  })
}

function getPrecoLote(lote: { precos?: LotePreco[]; backendPrice?: number; price?: number }, categoriaSelecionada?: string) {
  const precos = Array.isArray(lote.precos) ? lote.precos : []
  const categoriaNormalizada = normalizarCategoriaPreco(categoriaSelecionada)

  const precoPorCategoria = categoriaNormalizada
    ? precos.find(preco => normalizarCategoriaPreco(preco.categoria) === categoriaNormalizada)?.valor
    : undefined

  const precoFallback = precos[0]?.valor
  const valor = Number(precoPorCategoria ?? precoFallback ?? lote.backendPrice ?? lote.price)

  return Number.isFinite(valor) ? valor : null
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
    const lotName = getString(item, ['lote', 'nomeLote', 'nome', 'descricaoLote'])
    const precos = normalizePrecos(item)

    return {
      id,
      nomeEvento: getString(item, ['nomeEvento', 'evento', 'eventName']),
      distance: getString(item, ['distance', 'distancia']) as RaceKit['distance'],
      lotLabel: lotName || `Lote ${lotOrder}`,
      lotOrder,
      price: getPrecoLote({ precos, backendPrice: getNumber(item, ['preco', 'price', 'valor'], Number.NaN) }) ?? undefined,
      precos,
      percentualVendido,
      vendidos,
      capacidade,
      vagasRestantes,
      disponivel,
      possuiPrecoPcdAtivo: hasActiveCategoryPrice(item, 'PCD'),
      motivoIndisponibilidade: getString(item, ['motivoIndisponibilidade', 'motivo', 'statusMensagem']),
      raw: item,
    }
  }).filter(item => item.id)
}

function formatCurrency(value?: number | null) {
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
  kitOptions,
  featured = false,
  openDocumentsKitId,
  onToggleDocuments,
}: {
  kit: RaceKitWithStatus
  kitOptions: RaceKitWithStatus[]
  featured?: boolean
  openDocumentsKitId: string | null
  onToggleDocuments: (kitId: string) => void
}) {
  const [selectedKitId, setSelectedKitId] = useState(kitOptions[0]?.backendKitId ?? kit.backendKitId)
  const selectedKit = kitOptions.find(option => option.backendKitId === selectedKitId) ?? kitOptions[0] ?? kit
  const sharedCapacity = kit.availableSlots
  const sharedSoldSlots = kitOptions.reduce((total, option) => total + option.vendidos, 0)
  const sharedAvailableSlots = Math.max(0, sharedCapacity - sharedSoldSlots)
  const isEventAvailable = sharedAvailableSlots > 0
  const kitColors = selectedKit.kitColors?.length ? selectedKit.kitColors : defaultKitColors
  const initialKitColor = kitColors[0]?.color ?? '#d7ff32'
  const documents = kit.documents ?? []
  const isDocumentsOpen = openDocumentsKitId === kit.backendKitId
  const cardPrice = formatCurrency(getPrecoLote(selectedKit))
  const selectedKitConfig = kit.kitOptions?.find(option => option.id === selectedKit.backendKitId)
  const includesShirt = selectedKitConfig?.includesShirt !== false
  const availableCategories = useMemo<GenderCategory[]>(() => {
    const categoryLabels: Array<{ apiCategory: ApiCategoria; label: GenderCategory }> = [
      { apiCategory: 'MASCULINO', label: 'Masculino' },
      { apiCategory: 'FEMININO', label: 'Feminino' },
      { apiCategory: 'LGBTQIA', label: 'LGBTQIA+' },
      { apiCategory: 'MAIOR_60', label: '60+' },
      { apiCategory: 'PCD', label: 'PCD' },
    ]

    return categoryLabels
      .filter(({ apiCategory }) => selectedKit.precos.some(preco => (
        normalizarCategoriaPreco(preco.categoria) === apiCategory && preco.valor > 0
      )))
      .map(({ label }) => label)
  }, [selectedKit.precos])

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
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [shareCopied, setShareCopied] = useState(false)

  const handleShare = async () => {
    const version = kit.shareVersion ? `?v=${kit.shareVersion}` : ''
    const url = `${window.location.origin}/corrida/${kit.shareSlug}${version}`

    try {
      if (navigator.share) {
        await navigator.share({ url })
        return
      }

      await navigator.clipboard.writeText(url)
      setShareCopied(true)
      window.setTimeout(() => setShareCopied(false), 2500)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return

      try {
        await navigator.clipboard.writeText(url)
        setShareCopied(true)
        window.setTimeout(() => setShareCopied(false), 2500)
      } catch {
        window.prompt('Copie o link da corrida:', url)
      }
    }
  }

  useScrollLock(modal.isOpen)

  const modalPriceCategory = modal.isElderly ? '60+' : modal.gender
  const modalPrice = formatCurrency(getPrecoLote(modal.kit ?? selectedKit, modalPriceCategory))

  useEffect(() => {
    if (!kitOptions.some(option => option.backendKitId === selectedKitId)) {
      setSelectedKitId(kitOptions[0]?.backendKitId ?? kit.backendKitId)
    }
  }, [kit.backendKitId, kitOptions, selectedKitId])

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

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())

  const isFormValid =
    Boolean(state.name.trim()) &&
    isEmailValid &&
    Boolean(state.dataNascimento) &&
    state.cpf.replace(/\D/g, '').length === 11 &&
    state.phone.replace(/\D/g, '').length >= 10

  const showValidationError = () =>
    setState(prev => ({
      ...prev,
      message: {
        type: 'error',
        text: state.email.trim() && !isEmailValid
          ? 'Informe um e-mail válido para receber o comprovante eletrônico'
          : 'Preencha todos os campos obrigatórios corretamente',
      },
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
    if (!isEventAvailable) {
      setState(prev => ({
        ...prev,
        message: {
          type: 'error',
          text: selectedKit.motivoIndisponibilidade || 'Este kit não está disponível para compra.',
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
      kit: selectedKit,
      userData: {
        name: state.name,
        email: state.email,
        cpf: state.cpf,
        phone: state.phone,
        dataNascimento: state.dataNascimento,
      },
    })
  }

  const closeModal = () => {
    if (isCheckoutLoading) return
    setCheckoutError(null)
    setModal(prev => ({ ...prev, isOpen: false }))
  }

  const handleConfirmPurchase = async () => {
    if (isCheckoutLoading) return

    if (!isFormValid || !modal.userData) {
      setCheckoutError('Preencha todos os campos obrigatórios corretamente, incluindo um e-mail válido.')
      return
    }

    const selectedKitColor = kitColors.find(({ color }) => color === modal.kitColor)
    const paymentData = {
      kitId: modal.kit?.backendKitId,
      eventName: modal.kit?.raceName,
      distance: modal.kit?.distance,
      user: modal.userData,
      shirtSize: includesShirt ? modal.size : undefined,
      gender: modal.gender,
      categoria: modal.gender,
      isElderly: modal.isElderly,
      shoeNumber: modal.shoeNumber,
      teamName: modal.teamName,
      kitColor: includesShirt ? modal.kitColor : undefined,
      kitColorName: includesShirt ? (selectedKitColor?.name ?? '') : undefined,
    }

    setCheckoutError(null)
    setIsCheckoutLoading(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      })
      const result = await response.json() as {
        linkPagamento?: string
        init_point?: string
        sandbox_init_point?: string
        url?: string
        erro?: string
        message?: string
      }

      if (!response.ok) {
        throw new Error(result.erro ?? result.message ?? 'Não foi possível preparar o pagamento.')
      }

      const paymentUrl = result.linkPagamento ?? result.init_point ?? result.sandbox_init_point ?? result.url

      if (!paymentUrl) {
        throw new Error('A API não retornou o link de pagamento.')
      }

      window.location.assign(paymentUrl)
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Não foi possível preparar o pagamento.')
      setIsCheckoutLoading(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <Card id={`corrida-${kit.shareSlug}`} $featured={featured}>
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
          <LotBadge>Lote {selectedKit.backendLotOrder}</LotBadge>
        </LotInfo>

        <Price>
          {cardPrice ?? 'Preço no checkout'} <small>/ kit</small>
        </Price>

        <FormGroup>
          <Label>Escolha seu kit</Label>
          <KitOptionSelector>
            {kitOptions.map(option => (
              (() => {
                const configuredOption = kit.kitOptions?.find(config => config.id === option.backendKitId)
                const siteFee = configuredOption?.siteFee ?? 0
                const basePrice = configuredOption?.price ?? getPrecoLote(option)
                const priceLabel = siteFee > 0 && basePrice !== null
                  ? `${formatCurrency(basePrice)} + ${formatCurrency(siteFee)} taxa`
                  : formatCurrency(getPrecoLote(option)) ?? 'Preço no checkout'

                return (
                  <KitOptionButton
                    key={option.backendKitId}
                    type="button"
                    $selected={selectedKit.backendKitId === option.backendKitId}
                    onClick={() => setSelectedKitId(option.backendKitId)}
                  >
                    <strong>{option.backendLotLabel}</strong>
                    <span>{priceLabel}</span>
                  </KitOptionButton>
                )
              })()
            ))}
          </KitOptionSelector>
        </FormGroup>

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
          <Label>E-mail *</Label>
          <Input
            type="email"
            placeholder="seu@email.com"
            value={state.email}
            onChange={e => setState(prev => ({ ...prev, email: e.target.value }))}
            autoComplete="email"
            required
            aria-required="true"
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
          {/* <ActionButton
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
          </ActionButton> */}
          <ActionButton type="button" $variant="buy" onClick={handleBuyClick} disabled={!isFormValid || !isEventAvailable}>
            <CreditCard size={18} />
            {isEventAvailable ? 'Comprar Kit' : 'Indisponível'}
          </ActionButton>
        </ButtonGroup>

        {!isEventAvailable && selectedKit.motivoIndisponibilidade && (
          <Message $type="error">
            <AlertCircle size={16} />
            {selectedKit.motivoIndisponibilidade}
          </Message>
        )}

        <DocumentButtonRow>
          <ActionButton
            type="button"
            $variant="share"
            onClick={handleShare}
          >
            {shareCopied ? <Check size={18} /> : <Share2 size={18} />}
            {shareCopied ? 'Link copiado!' : 'Compartilhar'}
          </ActionButton>
          {documents.length > 0 && (
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
          )}
        </DocumentButtonRow>

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
        <ModalContent onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby={`checkout-title-${kit.id}`}>
          <ModalClose onClick={closeModal} disabled={isCheckoutLoading} aria-label="Fechar">
            <X size={24} />
          </ModalClose>

          <ModalTitle id={`checkout-title-${kit.id}`}>Finalizar Compra</ModalTitle>
          <ModalSubtitle>
            {includesShirt ? 'Escolha a categoria e o tamanho da camisa' : 'Escolha a categoria da inscrição'}
          </ModalSubtitle>

          <PriceTag>
            <span>{modalPrice ?? 'Preço no checkout'}</span>
          </PriceTag>

          <FormGroup>
            <Label>Categoria</Label>
            <GenderSelector>
              {availableCategories.map(gender => (
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

          {availableCategories.includes('60+') && (
            <ElderlyCheckbox>
              <input
                type="checkbox"
                checked={modal.isElderly}
                onChange={e => setModal(prev => ({ ...prev, isElderly: e.target.checked }))}
              />
              <span>Idoso (60+)</span>
            </ElderlyCheckbox>
          )}

          {includesShirt && (
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
          )}

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

          {includesShirt && (
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
          )}

          {checkoutError && (
            <Message $type="error" role="alert">
              <AlertCircle size={16} />
              {checkoutError}
            </Message>
          )}

          <ConfirmButton type="button" onClick={handleConfirmPurchase} disabled={!isEventAvailable || isCheckoutLoading}>
            <CreditCard size={18} />
            Ir para Pagamento
          </ConfirmButton>
        </ModalContent>
      </ModalOverlay>

      {isCheckoutLoading && (
        <CheckoutLoadingOverlay>
          <CheckoutLoadingCard role="status" aria-live="polite" aria-busy="true">
            <Loader2 size={42} aria-hidden="true" />
            <strong>Estamos preparando seu pagamento seguro…</strong>
            <p>Não feche esta página. Você será direcionado ao Mercado Pago.</p>
          </CheckoutLoadingCard>
        </CheckoutLoadingOverlay>
      )}
    </>
  )
}

// ─── RaceCards (export default) ───────────────────────────────────────────────

export default function RaceCards() {
  const [openDocumentsKitId, setOpenDocumentsKitId] = useState<string | null>(null)
  const [statusByEvent, setStatusByEvent] = useState<Record<string, LoteStatus[]>>({})
  const [statusError, setStatusError] = useState<string | null>(null)
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)

  const refreshStatuses = useCallback(async () => {
    try {
      const response = await fetch('/api/lotes/status', {
        cache: 'no-store',
      })
      const payload = await response.json()

      if (!response.ok) {
        const message = payload?.erro ?? payload?.message ?? 'Nao foi possivel consultar lotes.'
        throw new Error(message)
      }

      const groupedStatuses = normalizeLoteStatus(payload).reduce<Record<string, LoteStatus[]>>((groups, status) => {
        const nomeEvento = status.nomeEvento?.trim()
        if (!nomeEvento) return groups

        return {
          ...groups,
          [nomeEvento]: [...(groups[nomeEvento] ?? []), status],
        }
      }, {})

      setStatusByEvent(groupedStatuses)
      setStatusError(null)
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Nao foi possivel consultar os lotes agora.')
    } finally {
      setIsLoadingStatus(false)
    }
  }, [])

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

  const kitsWithStatus = useMemo<RaceKitWithStatus[]>(() => {
    return raceKits.flatMap(kit => {
      const statuses = [...(statusByEvent[kit.raceName] ?? [])].sort((a, b) =>
        String(a.distance || kit.distance).localeCompare(String(b.distance || kit.distance)) ||
        a.lotOrder - b.lotOrder
      )

      const configuredOptions = kit.kitOptions?.length
        ? kit.kitOptions
        : [{
            id: kit.id,
            label: kit.lotLabel ?? `Lote ${kit.lot}`,
            price: kit.price,
            siteFee: 0,
            lot: kit.lot,
            availableSlots: kit.availableSlots,
            soldSlots: kit.soldSlots,
          }]

      return configuredOptions.flatMap(option => {
        const matchingStatuses = statuses.filter(status => status.id === option.id)

        if (matchingStatuses.length === 0) {
          const vendidos = option.soldSlots ?? 0
          const capacidade = option.availableSlots
          const valorFinal = option.price + (option.siteFee ?? 0)
        const percentualVendido = capacidade > 0 ? Math.min(100, Math.round((vendidos / capacidade) * 100)) : 0

        return [{
          ...kit,
          shareSlug: kit.id,
          backendKitId: option.id,
          backendLotLabel: option.label,
          backendLotOrder: option.lot,
          backendPrice: valorFinal,
          precos: [
            { categoria: 'MASCULINO', valor: valorFinal },
            { categoria: 'FEMININO', valor: valorFinal },
          ],
          percentualVendido,
          vendidos,
          capacidade,
          vagasRestantes: Math.max(0, capacidade - vendidos),
          disponivel: capacidade > vendidos,
          possuiPrecoPcdAtivo: false,
          motivoIndisponibilidade: undefined,
        }]
        }

        return matchingStatuses.map(status => ({
        ...kit,
        shareSlug: kit.id,
        id: status.id,
        distance: status.distance || kit.distance,
        backendKitId: status.id,
        backendLotLabel: status.lotLabel,
        backendLotOrder: status.lotOrder,
        backendPrice: status.price,
        precos: status.precos,
        percentualVendido: status.percentualVendido,
        vendidos: status.vendidos,
        capacidade: status.capacidade,
        vagasRestantes: status.vagasRestantes,
        disponivel: status.disponivel,
        possuiPrecoPcdAtivo: status.possuiPrecoPcdAtivo,
        motivoIndisponibilidade: status.motivoIndisponibilidade,
        }))
      })
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

  const cardGroups = useMemo(() => {
    return kitsWithStatus.reduce<Record<string, RaceKitWithStatus[]>>((groups, kit) => {
      const key = `${kit.raceName}::${kit.distance}`
      groups[key] = [...(groups[key] ?? []), kit]
      return groups
    }, {})
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
            Selecione a opção ideal para você e garanta sua inscrição no evento
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
          {Object.entries(cardGroups).map(([groupKey, kitOptions]) => {
            const kit = kitOptions[0]
            return (
              <RaceCard
                key={groupKey}
                kit={kit}
                kitOptions={kitOptions}
                featured={kitOptions.some(option => featuredLotIds.has(option.backendKitId))}
                openDocumentsKitId={openDocumentsKitId}
                onToggleDocuments={handleToggleDocuments}
              />
            )
          })}
        </Grid>
      </Container>
    </Section>
  )
}
