'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, AlertCircle, Zap, UserPlus, CreditCard, X, Calendar, FileText, ChevronDown, ExternalLink, Loader2, Share2, ChevronLeft, ChevronRight } from 'lucide-react'
import { raceKits } from '@/data/race-data'
import type { RaceKit, ShirtSize, GenderCategory } from '@/types/race'
import { loadMercadoPago } from '@mercadopago/sdk-js'

import {
  Section, Container, SectionHeader, SectionTitle, SectionSubtitle, Grid, Card, FeaturedBadge,
  Distance, RaceName, Description, LotInfo, LotBadge, Price, FormGroup, Label, Input,
  FormHint,
  OrganizerInfo, OrganizerName, OrganizerTeam,
  ButtonGroup, ActionButton, Message, ModalOverlay, ModalContent, ModalClose, ModalTitle,
  ModalSubtitle, PriceTag, SizeSelector, SizeButton, ShoeNumberInput, ConfirmButton,
  GenderSelector, GenderButton, ElderlyCheckbox, TeamNameInput, ColorSelector, ColorButton, ColorLabel,
  BannerCorrida, BannerCarousel, BannerCarouselImage, BannerCarouselButton, BannerCarouselDots, BannerCarouselDot, DocumentsPanel, DocumentLink, DocumentButtonRow,
  CheckoutLoadingOverlay, CheckoutLoadingCard,
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

type CupomQuote = {
  codigoCupom: string
  valorIngresso: number
  descontoCupom: number
  taxaServico: number
  total: number
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

function filtrarDistanciaKm(value: string) {
  const filtered = value.replace(/[^\d.,]/g, '')
  const separatorIndex = filtered.search(/[.,]/)

  if (separatorIndex === -1) return filtered

  const integer = filtered.slice(0, separatorIndex).replace(/[.,]/g, '')
  const decimal = filtered.slice(separatorIndex + 1).replace(/[.,]/g, '')

  return `${integer}${filtered[separatorIndex]}${decimal}`
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
  confirmEmail: string
  cpf: string
  phone: string
  birthDateInput: string
  dataNascimento: string
  message: { type: 'error' | 'success'; text: string } | null
  subscribeSuccess: boolean
}

interface ModalState {
  isOpen: boolean
  distanceChoice: string
  customDistance: string
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
  const [bannerIndex, setBannerIndex] = useState(0)

  useEffect(() => {
    if (!kit.gallery || kit.gallery.length < 2) return
    const interval = window.setInterval(() => {
      setBannerIndex(index => (index + 1) % kit.gallery!.length)
    }, 4500)
    return () => window.clearInterval(interval)
  }, [kit.gallery])
  const selectedKit = kitOptions.find(option => option.backendKitId === selectedKitId) ?? kitOptions[0] ?? kit
  const sharedCapacity = kit.availableSlots
  const sharedSoldSlots = kitOptions.reduce((total, option) => total + option.vendidos, 0)
  const sharedAvailableSlots = Math.max(0, sharedCapacity - sharedSoldSlots)
  const isEventAvailable = sharedAvailableSlots > 0
  const kitColors = selectedKit.kitColors?.length ? selectedKit.kitColors : defaultKitColors
  const initialKitColor = kitColors[0]?.color ?? '#d7ff32'
  const documents = kit.documents ?? []
  const isDocumentsOpen = openDocumentsKitId === kit.backendKitId
  const selectedKitConfig = kit.kitOptions?.find(option => option.id === selectedKit.backendKitId)
  const selectedBasePrice = getPrecoLote(selectedKit)
  const cardPrice = formatCurrency(selectedBasePrice === null ? null : selectedBasePrice + (selectedKitConfig?.siteFee ?? 0))
  const includesShirt = selectedKitConfig?.includesShirt ?? kit.includesShirt ?? true
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
    confirmEmail: '',
    cpf: '',
    phone: '',
    birthDateInput: '',
    dataNascimento: '',
    message: null,
    subscribeSuccess: false,
  })

  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    distanceChoice: '',
    customDistance: '',
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
  const [cupomInput, setCupomInput] = useState('')
  const [cupomQuote, setCupomQuote] = useState<CupomQuote | null>(null)
  const [cupomLoading, setCupomLoading] = useState(false)
  const [cupomError, setCupomError] = useState<string | null>(null)
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
  const modalKit = modal.kit ?? selectedKit
  const modalBasePrice = getPrecoLote(modalKit, modalPriceCategory)
  const modalSiteFee = modalKit.kitOptions?.find(option => option.id === modalKit.backendKitId)?.siteFee ?? 0
  const modalPrice = cupomQuote
    ? formatCurrency(cupomQuote.total)
    : formatCurrency(modalBasePrice === null ? null : modalBasePrice + modalSiteFee)
  const checkoutKitId = modal.distanceChoice && modal.distanceChoice !== 'outro'
    ? `${modal.kit?.id ?? kit.id}-${modal.distanceChoice}-km`
    : modal.kit?.backendKitId

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

  const normalizedEmail = state.email.trim()
  const normalizedConfirmEmail = state.confirmEmail.trim()
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  const doEmailsMatch = normalizedEmail === normalizedConfirmEmail

  const isFormValid =
    Boolean(state.name.trim()) &&
    isEmailValid &&
    doEmailsMatch &&
    Boolean(state.dataNascimento) &&
    state.cpf.replace(/\D/g, '').length === 11 &&
    state.phone.replace(/\D/g, '').length >= 10

  const showValidationError = () =>
    setState(prev => ({
      ...prev,
      message: {
        type: 'error',
        text: normalizedEmail && !isEmailValid
          ? 'Informe um e-mail válido para receber o comprovante eletrônico'
          : normalizedConfirmEmail && !doEmailsMatch
            ? 'Os e-mails informados não coincidem.'
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
      setState({ name: '', email: '', confirmEmail: '', cpf: '', phone: '', birthDateInput: '', message: null, subscribeSuccess: false, dataNascimento: '' })
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

    setState(prev => ({
      ...prev,
      email: prev.email.trim(),
      confirmEmail: prev.confirmEmail.trim(),
    }))

    setCupomInput('')
    setCupomQuote(null)
    setCupomError(null)
    setModal({
      isOpen: true,
      distanceChoice: '',
      customDistance: '',
      size: 'M',
      gender: 'Masculino',
      isElderly: false,
      shoeNumber: '',
      teamName: '',
      kitColor: initialKitColor,
      kit: selectedKit,
      userData: {
        name: state.name,
        email: normalizedEmail,
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

  const handleApplyCoupon = async () => {
    const codigo = cupomInput.trim()
    if (!codigo || !modal.kit || !modal.distanceChoice || cupomLoading || isCheckoutLoading) return

    setCupomLoading(true)
    setCupomError(null)
    setCupomQuote(null)

    try {
      const response = await fetch('/api/cupons/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kitId: checkoutKitId,
          cupom: codigo,
          categoria: modal.gender,
          isElderly: modal.isElderly,
        }),
      })
      const result = await response.json() as CupomQuote & { erro?: string; message?: string }
      if (!response.ok) {
        throw new Error(result.erro ?? result.message ?? 'Este cupom não é válido para esta corrida.')
      }
      if (
        typeof result.descontoCupom !== 'number' ||
        typeof result.total !== 'number' ||
        typeof result.valorIngresso !== 'number' ||
        typeof result.taxaServico !== 'number'
      ) {
        throw new Error('A API não retornou os valores do desconto e do total.')
      }
      setCupomQuote(result)
      setCupomInput(result.codigoCupom ?? codigo)
    } catch (error) {
      setCupomError(error instanceof Error ? error.message : 'Não foi possível validar o cupom.')
    } finally {
      setCupomLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    if (isCheckoutLoading || cupomLoading) return
    setCupomInput('')
    setCupomQuote(null)
    setCupomError(null)
  }

  const handleConfirmPurchase = async () => {
    if (isCheckoutLoading) return

    if (!modal.distanceChoice) {
      setCheckoutError('Escolha a distância que você quer correr.')
      return
    }

    if (modal.distanceChoice === 'outro' && !/^\d+(?:[.,]\d+)?$/.test(modal.customDistance.trim())) {
      setCheckoutError('Informe a distância em quilômetros usando apenas um número.')
      return
    }

    if (cupomInput.trim() && !cupomQuote) {
      setCupomError('Aplique novamente o cupom antes de continuar. O código ainda não foi validado para esta categoria.')
      return
    }

    if (!isFormValid || !modal.userData) {
      setCheckoutError('Preencha todos os campos obrigatórios corretamente, incluindo um e-mail válido.')
      return
    }

    const selectedKitColor = kitColors.find(({ color }) => color === modal.kitColor)
    const isCustomDistance = modal.distanceChoice === 'outro'
    const customDistanceInKm = modal.customDistance.trim().replace(',', '.')
    const paymentData = {
      kitId: isCustomDistance
        ? modal.kit?.backendKitId
        : checkoutKitId,
      ...(isCustomDistance ? { distanciaPersonalizada: `${customDistanceInKm} km` } : {}),
      eventName: modal.kit?.raceName,
      distance: modal.kit?.distance,
      user: modal.userData,
      shirtSize: includesShirt ? modal.size : undefined,
      gender: modal.gender,
      categoria: modal.gender,
      isElderly: modal.isElderly,
      shoeNumber: modal.shoeNumber,
      teamName: modal.teamName,
      cupom: cupomQuote?.codigoCupom,
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
        codigoCupom?: string | null
        descontoCupom?: number
        valorIngresso?: number
        taxaServico?: number
        total?: number
        codigo?: string
      }

      if (!response.ok) {
        if (response.status === 503 && result.codigo === 'FILA_CHECKOUT_CHEIA') {
          const retryAfter = response.headers.get('Retry-After')
          const retrySeconds = retryAfter
            ? (/^\d+$/.test(retryAfter)
                ? Number(retryAfter)
                : Math.max(0, Math.ceil((Date.parse(retryAfter) - Date.now()) / 1000)))
            : 0
          const delayMs = Math.max(5, retrySeconds) * 1000
          setCheckoutError('A fila de checkout está ocupada. Aguarde para tentar novamente.')
          window.setTimeout(() => setIsCheckoutLoading(false), delayMs)
          return
        }
        throw new Error(result.erro ?? result.message ?? 'Não foi possível preparar o pagamento.')
      }

      if (cupomQuote && typeof result.descontoCupom === 'number' && typeof result.total === 'number') {
        setCupomQuote({
          codigoCupom: result.codigoCupom ?? cupomQuote.codigoCupom,
          valorIngresso: result.valorIngresso ?? cupomQuote.valorIngresso,
          descontoCupom: result.descontoCupom,
          taxaServico: result.taxaServico ?? cupomQuote.taxaServico,
          total: result.total,
        })
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
        {kit.gallery && kit.gallery.length > 1 ? (
          <BannerCarousel aria-label={`Imagens de ${kit.raceName}`}>
            <BannerCarouselImage
              src={kit.gallery[bannerIndex % kit.gallery.length]}
              alt={`${kit.raceName} — imagem ${bannerIndex + 1} de ${kit.gallery.length}`}
              $contain={kit.containGalleryImages?.includes(kit.gallery[bannerIndex % kit.gallery.length])}
            />
            <BannerCarouselButton
              type="button"
              $side="left"
              aria-label="Imagem anterior"
              onClick={() => setBannerIndex(index => (index - 1 + kit.gallery!.length) % kit.gallery!.length)}
            ><ChevronLeft size={20} /></BannerCarouselButton>
            <BannerCarouselButton
              type="button"
              $side="right"
              aria-label="Próxima imagem"
              onClick={() => setBannerIndex(index => (index + 1) % kit.gallery!.length)}
            ><ChevronRight size={20} /></BannerCarouselButton>
            <BannerCarouselDots>
              {kit.gallery.map((_, index) => (
                <BannerCarouselDot
                  key={index}
                  type="button"
                  $active={index === bannerIndex % kit.gallery!.length}
                  aria-label={`Mostrar imagem ${index + 1}`}
                  onClick={() => setBannerIndex(index)}
                />
              ))}
            </BannerCarouselDots>
          </BannerCarousel>
        ) : kit.img && <BannerCorrida src={kit.img} alt={kit.raceName} />}
        <RaceName>{kit.raceName}</RaceName>
        <Description>{kit.description}</Description>

        <LotInfo>
          <LotBadge>
            Lote disponível: {sharedAvailableSlots} {sharedAvailableSlots === 1 ? 'vaga' : 'vagas'}
          </LotBadge>
          {kit.organizer && (
            <OrganizerInfo>
              <OrganizerName>Organizador: {kit.organizer}</OrganizerName>
              {kit.organizerTeam && (
                <OrganizerTeam><strong>Equipe:</strong> {kit.organizerTeam}</OrganizerTeam>
              )}
            </OrganizerInfo>
          )}
        </LotInfo>

        <Price>
          {cardPrice ?? 'Preço no checkout'} <small>/ kit</small>
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
          <Label>E-mail *</Label>
          <Input
            type="email"
            placeholder="seu@email.com"
            value={state.email}
            onChange={e => setState(prev => ({ ...prev, email: e.target.value }))}
            onBlur={() => setState(prev => ({ ...prev, email: prev.email.trim() }))}
            autoComplete="email"
            required
            aria-required="true"
            aria-describedby={`email-hint-${kit.id}`}
          />
          <FormHint id={`email-hint-${kit.id}`}>
            Use um e-mail que você acessa normalmente. Ele será necessário para consultar sua inscrição, receber o comprovante e solicitar reembolso, se necessário.
          </FormHint>
        </FormGroup>

        <FormGroup>
          <Label>Confirmar e-mail *</Label>
          <Input
            type="email"
            placeholder="Digite o e-mail novamente"
            value={state.confirmEmail}
            onChange={e => setState(prev => ({ ...prev, confirmEmail: e.target.value }))}
            onBlur={() => setState(prev => ({ ...prev, confirmEmail: prev.confirmEmail.trim() }))}
            autoComplete="email"
            required
            aria-required="true"
            aria-invalid={Boolean(normalizedConfirmEmail && !doEmailsMatch)}
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
            <Label>Qual distância você quer correr?</Label>
            <select
              aria-label="Selecione a distância"
              value={modal.distanceChoice}
              disabled={isCheckoutLoading}
              onChange={event => {
                setModal(prev => ({ ...prev, distanceChoice: event.target.value }))
                setCheckoutError(null)
                setCupomQuote(null)
                setCupomError(null)
              }}
              style={{
                width: '100%',
                minHeight: 48,
                padding: '0.75rem 1rem',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(8,22,56,0.8)',
                color: '#fff',
                font: 'inherit',
              }}
            >
              <option value="" disabled>Selecione a distância</option>
              <option value="25">25 km</option>
              <option value="50">50 km</option>
              <option value="100">100 km</option>
              <option value="150">150 km</option>
              <option value="200">200 km</option>
              <option value="outro">Outro percurso</option>
            </select>
            {modal.distanceChoice === 'outro' && (
              <>
                <Label htmlFor={`custom-distance-${kit.id}`}>Distância personalizada (km)</Label>
                <div style={{ position: 'relative' }}>
                  <Input
                    id={`custom-distance-${kit.id}`}
                    type="text"
                    inputMode="decimal"
                    placeholder="Ex.: 5"
                    value={modal.customDistance}
                    onChange={event => {
                      setModal(prev => ({ ...prev, customDistance: filtrarDistanciaKm(event.target.value) }))
                      setCheckoutError(null)
                    }}
                    style={{ paddingRight: '3.5rem' }}
                  />
                  {modal.customDistance && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        right: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'rgba(255,255,255,0.7)',
                        fontWeight: 600,
                        pointerEvents: 'none',
                      }}
                    >
                      km
                    </span>
                  )}
                </div>
              </>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor={`coupon-${kit.id}`}>Cupom de desconto</Label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
              <Input
                id={`coupon-${kit.id}`}
                type="text"
                autoComplete="off"
                placeholder="Digite seu cupom"
                value={cupomInput}
                disabled={cupomLoading || isCheckoutLoading}
                onChange={event => {
                  setCupomInput(event.target.value)
                  setCupomQuote(null)
                  setCupomError(null)
                }}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    void handleApplyCoupon()
                  }
                }}
              />
              {cupomQuote ? (
                <ActionButton type="button" $variant="docs" onClick={handleRemoveCoupon} disabled={isCheckoutLoading}>
                  Remover
                </ActionButton>
              ) : (
                <ActionButton
                  type="button"
                  $variant="docs"
                  onClick={() => void handleApplyCoupon()}
                  disabled={!cupomInput.trim() || cupomLoading || isCheckoutLoading}
                >
                  {cupomLoading ? <><Loader2 size={16} />Validando</> : 'Aplicar'}
                </ActionButton>
              )}
            </div>
            {cupomError && <Message $type="error" role="alert"><AlertCircle size={16} />{cupomError}</Message>}
            {cupomQuote && (
              <Message $type="success" role="status" aria-live="polite">
                <Check size={16} />Cupom {cupomQuote.codigoCupom} aplicado.
                <span style={{ display: 'block', marginLeft: '1.5rem' }}>
                  Desconto: {formatCurrency(cupomQuote.descontoCupom)} · Taxa: {formatCurrency(cupomQuote.taxaServico)} · Total: {formatCurrency(cupomQuote.total)}
                </span>
              </Message>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Categoria</Label>
            <GenderSelector>
              {availableCategories.map(gender => (
                <GenderButton
                  key={gender}
                  type="button"
                  $selected={modal.gender === gender}
                  onClick={() => {
                    setModal(prev => ({ ...prev, gender }))
                    setCupomQuote(null)
                    setCupomError(null)
                  }}
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
                onChange={e => {
                  setModal(prev => ({ ...prev, isElderly: e.target.checked }))
                  setCupomQuote(null)
                  setCupomError(null)
                }}
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

          <FormHint>
            Se a página apresentar instabilidade, aguarde alguns instantes e tente novamente em alguns minutos.
          </FormHint>

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
            <strong>Aguarde, estamos processando seu pedido. Não feche esta página.</strong>
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
