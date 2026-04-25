'use client'

import { useEffect, useState } from 'react'
import { Check, AlertCircle, Zap, UserPlus, CreditCard, X } from 'lucide-react'
import { raceKits } from '@/data/race-data'
import type { RaceKit, ShirtSize, GenderCategory } from '@/types/race'
import { loadMercadoPago } from "@mercadopago/sdk-js";


import { 
  Section, Container, SectionHeader, SectionTitle, SectionSubtitle, Grid, Card, FeaturedBadge,
  Distance, RaceName, Description, LotInfo, LotHeader, LotBadge, Slots, Price, FormGroup, Label, Input,
  ButtonGroup, ActionButton, Message, ModalOverlay, ModalContent, ModalClose, ModalTitle,
  ModalSubtitle, PriceTag, SizeSelector, SizeButton, ShoeNumberInput, ConfirmButton,
  GenderSelector, GenderButton, ElderlyCheckbox, TeamNameInput, ColorSelector, ColorButton, ColorLabel,
  ProgressBarContainer, ProgressBarFill, ProgressLabel, BannerCorrida
} from './Style'


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

function RaceCard({ kit, featured = false }: { kit: RaceKit; featured?: boolean }) {
  useEffect(() => {
    // Evita acesso ao window durante SSR/build na Vercel.
    void loadMercadoPago()
  }, [])

  const [state, setState] = useState<CardState>({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    message: null,
    subscribeSuccess: false
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
    userData: null
  })

  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, cpf: formatCpf(e.target.value) }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, phone: formatPhone(e.target.value) }))
  }

  const isFormValid = state.name.trim() && 
    state.email.trim() && 
    state.cpf.replace(/\D/g, '').length === 11 &&
    state.phone.replace(/\D/g, '').length >= 10

  const handleSubscribe = () => {
    if (!isFormValid) {
      setState(prev => ({ 
        ...prev, 
        message: { type: 'error', text: 'Preencha todos os campos corretamente' } 
      }))
      return
    }

    // Simula inscrição sem pagamento
    setState(prev => ({ 
      ...prev, 
      subscribeSuccess: true,
      message: { type: 'success', text: 'Inscrição realizada com sucesso! Aguarde confirmacao por e-mail.' }
    }))

    setTimeout(() => {
      setState({
        name: '',
        email: '',
        cpf: '',
        phone: '',
        message: null,
        subscribeSuccess: false
      })
    }, 3000)
  }

  const handleBuyClick = () => {
    if (!isFormValid) {
      setState(prev => ({ 
        ...prev, 
        message: { type: 'error', text: 'Preencha todos os campos corretamente' } 
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
      kitColor: '#d7ff32',
      kit: kit,
      userData: {
        name: state.name,
        email: state.email,
        cpf: state.cpf,
        phone: state.phone
      }
    })
  }

  const handleConfirmPurchase = () => {
    // TODO: Integrar com Mercado Pago aqui
    // Redirecionar para URL do Mercado Pago com os dados:
    // - modal.kit (informacoes da corrida)
    // - modal.userData (dados do usuario)
    // - modal.size (tamanho da camisa)
    // - modal.shoeNumber (numeracao)
    
    const paymentData = {
      kit: modal.kit,
      user: modal.userData,
      shirtSize: modal.size,
      gender: modal.gender,
      isElderly: modal.isElderly,
      shoeNumber: modal.shoeNumber,
      teamName: modal.teamName,
      kitColor: modal.kitColor,
      amount: modal.kit?.price
    }
    
    console.log('Dados para pagamento Mercado Pago:', paymentData)
    
    // TODO: Substituir esta URL pela URL de checkout do Mercado Pago
    // Exemplo: window.location.href = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`
    window.location.href = `/pagamento/processar?data=${encodeURIComponent(JSON.stringify(paymentData))}`
  }

  return (
    <>
      <Card $featured={featured}>
        {featured && (
          <FeaturedBadge>
            <Zap size={12} />
            Mais Popular
          </FeaturedBadge>
        )}
        
        {/* aqui */}
        <Distance>{kit.distance}</Distance>
        <BannerCorrida src={kit.img}/>
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
            onChange={(e) => setState(prev => ({ ...prev, name: e.target.value }))}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>E-mail</Label>
          <Input 
            type="email" 
            placeholder="seu@email.com"
            value={state.email}
            onChange={(e) => setState(prev => ({ ...prev, email: e.target.value }))}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>CPF</Label>
          <Input 
            type="text" 
            placeholder="000.000.000-00"
            value={state.cpf}
            onChange={handleCpfChange}
            maxLength={14}
          />
        </FormGroup>

        <FormGroup>
          <Label>Telefone / WhatsApp</Label>
          <Input 
            type="text" 
            placeholder="(00) 00000-0000"
            value={state.phone}
            onChange={handlePhoneChange}
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
              <>
                <Check size={18} />
                Inscrito!
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Inscrever
              </>
            )}
          </ActionButton>
          
          <ActionButton 
            $variant="buy"
            onClick={handleBuyClick}
            disabled={!isFormValid}
          >
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

      {/* Modal de Compra */}
      <ModalOverlay $isOpen={modal.isOpen} onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalClose onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}>
            <X size={24} />
          </ModalClose>
          
          <ModalTitle>Finalizar Compra</ModalTitle>
          <ModalSubtitle>Escolha a categoria, tamanho da camisa e numeracao</ModalSubtitle>
          
          <PriceTag>
            <span>R$ {kit.price.toFixed(2).replace('.', ',')}</span>
          </PriceTag>
          
          <FormGroup>
            <Label>Categoria</Label>
            <GenderSelector>
              {(['Masculino', 'Feminino', 'LGBTQIA+', '60+'] as GenderCategory[]).map(gender => (
                <GenderButton
                  key={gender}
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
              onChange={(e) => setModal(prev => ({ ...prev, isElderly: e.target.checked }))}
            />
            <span>Idoso (60+)</span>
          </ElderlyCheckbox>
          
          <FormGroup>
            <Label>Tamanho da Camisa</Label>
            <SizeSelector>
              {(['PP', 'P', 'M', 'G', 'GG'] as ShirtSize[]).map(size => (
                <SizeButton
                  key={size}
                  $selected={modal.size === size}
                  onClick={() => setModal(prev => ({ ...prev, size }))}
                >
                  {size}
                </SizeButton>
              ))}
            </SizeSelector>
          </FormGroup>

          <ShoeNumberInput>
            <Label>Numeracao (opcional)</Label>
            <Input 
              type="text" 
              placeholder="Ex: 42"
              value={modal.shoeNumber}
              onChange={(e) => setModal(prev => ({ ...prev, shoeNumber: e.target.value.replace(/\D/g, '').slice(0, 2) }))}
              maxLength={2}
            />
          </ShoeNumberInput>
          
          <TeamNameInput>
            <Label>Nome da Equipe (opcional)</Label>
            <Input 
              type="text" 
              placeholder="Ex: Corredores do Bairro"
              value={modal.teamName}
              onChange={(e) => setModal(prev => ({ ...prev, teamName: e.target.value }))}
            />
          </TeamNameInput>
          
          <FormGroup>
            <ColorLabel>Cor do Kit</ColorLabel>
            <ColorSelector>
              {[
                { color: '#d7ff32', name: 'Amarelo' },
                { color: '#ffffff', name: 'Branco' },
                { color: '#000000', name: 'Preto' },
                { color: '#ff6b6b', name: 'Vermelho' },
                { color: '#4ecdc4', name: 'Azul' },
                { color: '#9b59b6', name: 'Roxo' }
              ].map(({ color, name }) => (
                <ColorButton
                  key={color}
                  $selected={modal.kitColor === color}
                  $color={color}
                  onClick={() => setModal(prev => ({ ...prev, kitColor: color }))}
                  title={name}
                />
              ))}
            </ColorSelector>
          </FormGroup>
          
          <ConfirmButton onClick={handleConfirmPurchase}>
            <CreditCard size={18} />
            Ir para Pagamento
          </ConfirmButton>
        </ModalContent>
      </ModalOverlay>
    </>
  )
}

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
            <RaceCard 
              key={kit.id} 
              kit={kit} 
              featured={index === 2}
            />
          ))}
        </Grid>
      </Container>
    </Section>
  )
}
