'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, AlertCircle, Zap, UserPlus, CreditCard, X } from 'lucide-react'
import { raceKits } from '@/data/race-data'
import type { RaceKit, ShirtSize, GenderCategory } from '@/types/race'
import { loadMercadoPago } from '@mercadopago/sdk-js'

import {
  Section, Container, SectionHeader, SectionTitle, SectionSubtitle, Grid, Card, FeaturedBadge,
  Distance, RaceName, Description, LotInfo, LotHeader, LotBadge, Slots, Price, FormGroup, Label, Input,
  ButtonGroup, ActionButton, Message, ModalOverlay, ModalContent, ModalClose, ModalTitle,
  ModalSubtitle, PriceTag, SizeSelector, SizeButton, ShoeNumberInput, ConfirmButton,
  GenderSelector, GenderButton, ElderlyCheckbox, TeamNameInput, ColorSelector, ColorButton, ColorLabel,
  ProgressBarContainer, ProgressBarFill, ProgressLabel, BannerCorrida,
} from './Style'

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface CardState {
  name: string
  email: string
  cpf: string
  phone: string
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
  kit: RaceKit | null
  userData: { name: string; email: string; cpf: string; phone: string } | null
}

// ─── RaceCard ─────────────────────────────────────────────────────────────────

function RaceCard({ kit, featured = false }: { kit: RaceKit; featured?: boolean }) {
  const router = useRouter()

  useEffect(() => {
    void loadMercadoPago()
  }, [])

  const [state, setState] = useState<CardState>({
    name: '',
    email: '',
    cpf: '',
    phone: '',
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
    kitColor: '#d7ff32',
    kit: null,
    userData: null,
  })

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

  // ── Validation ───────────────────────────────────────────────────────────────

  const isFormValid =
    Boolean(state.name.trim()) &&
    Boolean(state.email.trim()) &&
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
      setState({ name: '', email: '', cpf: '', phone: '', message: null, subscribeSuccess: false })
    }, 3000)
  }

  const handleBuyClick = () => {
    if (!isFormValid) { showValidationError(); return }

    setModal({
      isOpen: true,
      size: 'M',
      gender: 'Masculino',
      isElderly: false,
      shoeNumber: '',
      teamName: '',
      kitColor: '#d7ff32',
      kit,
      userData: {
        name: state.name,
        email: state.email,
        cpf: state.cpf,
        phone: state.phone,
      },
    })
  }

  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }))

  const handleConfirmPurchase = () => {
    const paymentData = {
      kit: modal.kit,
      user: modal.userData,
      shirtSize: modal.size,
      gender: modal.gender,
      isElderly: modal.isElderly,
      shoeNumber: modal.shoeNumber,
      teamName: modal.teamName,
      kitColor: modal.kitColor,
      amount: modal.kit?.price,
    }

    // Salva no sessionStorage — nenhum dado sensível vai para a URL
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
            Mais Popular
          </FeaturedBadge>
        )}

        <Distance>{kit.distance}</Distance>
        {kit.img && <BannerCorrida src={kit.img} alt={kit.raceName} />}
        <RaceName>{kit.raceName}</RaceName>
        <Description>{kit.description}</Description>

        <LotInfo>
          <LotHeader>
            <LotBadge>Lote {kit.lot}</LotBadge>
            <Slots>{kit.availableSlots} vagas disponíveis</Slots>
          </LotHeader>

          {kit.soldSlots !== undefined && (
            <>
              <ProgressBarContainer>
                <ProgressBarFill
                  $percentage={Math.min((kit.soldSlots / kit.availableSlots) * 100, 100)}
                  $critical={(kit.soldSlots / kit.availableSlots) >= 0.9}
                />
              </ProgressBarContainer>
              <ProgressLabel>
                <span>{kit.soldSlots} vendidas</span>
                <span>{Math.round((kit.soldSlots / kit.availableSlots) * 100)}% ocupado</span>
              </ProgressLabel>
            </>
          )}
        </LotInfo>

        <Price>
          R$ {kit.price.toFixed(2).replace('.', ',')} <small>/ kit</small>
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

          <ActionButton $variant="buy" onClick={handleBuyClick} disabled={!isFormValid}>
            <CreditCard size={18} />
            Comprar Kit
          </ActionButton>
        </ButtonGroup>

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
            <span>R$ {kit.price.toFixed(2).replace('.', ',')}</span>
          </PriceTag>

          {/* Categoria */}
          <FormGroup>
            <Label>Categoria</Label>
            <GenderSelector>
              {(['Masculino', 'Feminino', 'LGBTQIA+', '60+', 'PCD'] as GenderCategory[]).map(gender => (
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

          {/* Idoso */}
          <ElderlyCheckbox>
            <input
              type="checkbox"
              checked={modal.isElderly}
              onChange={e => setModal(prev => ({ ...prev, isElderly: e.target.checked }))}
            />
            <span>Idoso (60+)</span>
          </ElderlyCheckbox>

          {/* Tamanho */}
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

          {/* Numeração */}
          <ShoeNumberInput>
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
          </ShoeNumberInput>

          {/* Equipe */}
          <TeamNameInput>
            <Label>Nome da Equipe (opcional)</Label>
            <Input
              type="text"
              placeholder="Ex: Corredores do Bairro"
              value={modal.teamName}
              onChange={e => setModal(prev => ({ ...prev, teamName: e.target.value }))}
            />
          </TeamNameInput>

          {/* Cor do kit */}
          <FormGroup>
            <ColorLabel>Cor do Kit</ColorLabel>
            <ColorSelector>
              {[
                { color: '#d7ff32', name: 'Amarelo' },
                { color: '#ffffff', name: 'Branco' },
                { color: '#000000', name: 'Preto' },
                { color: '#ff6b6b', name: 'Vermelho' },
                { color: '#4ecdc4', name: 'Azul' },
                { color: '#9b59b6', name: 'Roxo' },
              ].map(({ color, name }) => (
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

          <ConfirmButton type="button" onClick={handleConfirmPurchase}>
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
  return (
    <Section id="corridas">
      <Container>
        <SectionHeader>
          <SectionTitle>Escolha sua <strong>Corrida</strong></SectionTitle>
          <SectionSubtitle>
            Selecione a distância ideal para você e garanta seu kit com a camisa oficial do evento
          </SectionSubtitle>
        </SectionHeader>

        <Grid>
          {raceKits.map((kit, index) => (
            <RaceCard key={kit.id} kit={kit} featured={index === 2} />
          ))}
        </Grid>
      </Container>
    </Section>
  )
}