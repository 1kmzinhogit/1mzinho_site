import { NextResponse } from 'next/server'
import { raceKits } from '@/data/race-data'
import type { RaceKit } from '@/types/race'

const API_BASE_URL = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'https://api-1kmzinho.onrender.com').replace(/\/$/, '')

type FrontendCheckoutPayload = {
  kitId?: string
  user?: {
    name?: string
    email?: string
    cpf?: string
    phone?: string
    dataNascimento?: string
  }
  shirtSize?: string
  gender?: string
  isElderly?: boolean
  team?: string
  teamName?: string
  kitColor?: string
  kitColorName?: string
  shirtNumber?: string
  shoeNumber?: string
}

type ApiCategoria = 'MASCULINO' | 'FEMININO' | 'MAIOR_60' | 'LGBTQIA'

type ApiCheckoutPayload = {
  kitId: string
  cpf: string
  contato: string
  nomeNaCamisa: string
  dataNascimento: string
  nomePessoa: string
  corCamisa: string
  categoria: ApiCategoria
  equipe: string
  numeroCamisa: string
}

type CheckoutApiResult = {
  erro?: string
  message?: string
  detail?: string
  linkPagamento?: string
}

const REQUIRED_FIELDS: Array<keyof Pick<
  ApiCheckoutPayload,
  'kitId' | 'cpf' | 'contato' | 'nomeNaCamisa' | 'dataNascimento' | 'nomePessoa' | 'corCamisa'
>> = [
  'kitId',
  'cpf',
  'contato',
  'nomeNaCamisa',
  'dataNascimento',
  'nomePessoa',
  'corCamisa',
]

function onlyDigits(value?: string) {
  return String(value ?? '').replace(/\D/g, '')
}

function normalizarCategoria(gender?: string, isElderly?: boolean): ApiCategoria {
  const value = String(gender || '').toLowerCase()

  if (isElderly || value.includes('60')) return 'MAIOR_60'
  if (value.includes('fem')) return 'FEMININO'
  if (value.includes('lgbt')) return 'LGBTQIA'

  return 'MASCULINO'
}

function buscarKitLocal(kitId?: string): RaceKit | undefined {
  return raceKits.find(item => item.id === kitId)
}

function buscarNomeCorCamisa(kit: RaceKit | undefined, dados: FrontendCheckoutPayload) {
  const colorName = dados.kitColorName?.trim()

  if (colorName) return colorName

  const color = dados.kitColor?.trim()
  const selectedColor = kit?.kitColors?.find(item => item.color === color)

  return selectedColor?.name ?? color ?? ''
}

function criarNomeNaCamisa(nomePessoa: string) {
  return nomePessoa.trim().split(/\s+/)[0]?.toUpperCase() ?? ''
}

function validarPayloadApi(payload: ApiCheckoutPayload) {
  const emptyField = REQUIRED_FIELDS.find(field => !payload[field]?.trim())

  if (emptyField) {
    throw new Error(`Campo obrigatorio ausente no checkout: ${emptyField}.`)
  }

  if (!['MASCULINO', 'FEMININO', 'MAIOR_60', 'LGBTQIA'].includes(payload.categoria)) {
    throw new Error('Categoria invalida no checkout.')
  }
}

function criarPayloadApi(dados: FrontendCheckoutPayload): ApiCheckoutPayload {
  const kitId = dados.kitId?.trim() ?? ''
  const kit = buscarKitLocal(kitId)
  const nomePessoa = dados.user?.name?.trim() ?? ''

  const payload: ApiCheckoutPayload = {
    kitId,
    cpf: onlyDigits(dados.user?.cpf),
    contato: onlyDigits(dados.user?.phone),
    nomeNaCamisa: criarNomeNaCamisa(nomePessoa),
    dataNascimento: dados.user?.dataNascimento ?? '',
    nomePessoa,
    corCamisa: buscarNomeCorCamisa(kit, dados),
    categoria: normalizarCategoria(dados.gender, dados.isElderly),
    equipe: dados.team ?? dados.teamName ?? '',
    numeroCamisa: dados.shirtNumber ?? dados.shoeNumber ?? '',
  }

  validarPayloadApi(payload)

  return payload
}

export async function POST(request: Request) {
  try {
    const dados = await request.json() as FrontendCheckoutPayload
    let payload: ReturnType<typeof criarPayloadApi>

    try {
      payload = criarPayloadApi(dados)
    } catch (error) {
      return NextResponse.json(
        {
          erro: error instanceof Error ? error.message : 'Dados de checkout invalidos.',
        },
        { status: 400 },
      )
    }

    console.log('Payload final enviado para /checkout:', payload)

    const response = await fetch(`${API_BASE_URL}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(25000),
    })

    const text = await response.text()
    let result: CheckoutApiResult | null = null

    try {
      result = text ? JSON.parse(text) : null
    } catch {
      result = text ? { erro: text } : null
    }

    if (!response.ok) {
      console.error('Erro retornado pela API /checkout:', {
        url: `${API_BASE_URL}/checkout`,
        status: response.status,
        payload,
        response: result ?? text,
      })

      const apiMessage = result?.erro ?? result?.message ?? (text || 'Erro ao criar checkout.')

      return NextResponse.json(
        {
          erro: apiMessage,
          detail: `API /checkout retornou status ${response.status}.`,
          backendStatus: response.status,
          backendResponse: result ?? text,
        },
        { status: response.status },
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro ao conectar com a API de checkout:', error)

    return NextResponse.json(
      {
        erro: 'Nao foi possivel conectar com a API de checkout.',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    )
  }
}
