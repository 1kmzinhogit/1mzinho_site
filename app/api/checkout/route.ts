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
  shirtNumber?: string
  shoeNumber?: string
}

function normalizarCategoria(gender?: string, isElderly?: boolean) {
  const value = String(gender || '').toLowerCase()

  if (isElderly || value.includes('60')) return 'MAIOR_60'
  if (value.includes('fem')) return 'FEMININO'
  if (value.includes('lgbt')) return 'LGBTQIA'

  return 'MASCULINO'
}

function buscarKitConfiavel(kitId?: string): RaceKit {
  const kit = raceKits.find(item => item.id === kitId)

  if (!kit) {
    throw new Error('Evento/kit selecionado nao foi encontrado.')
  }

  return kit
}

function criarPayloadApi(dados: FrontendCheckoutPayload) {
  const kit = buscarKitConfiavel(dados.kitId)
  const valor = kit.price
  const nomeEvento = kit.raceName
  const distancia = kit.distance

  return {
    cpf: dados.user?.cpf,
    nomeEvento,
    contato: dados.user?.phone,
    lote: `Lote ${kit.lot}`,
    valorIngresso: valor,
    nomeNaCamisa: dados.user?.name,
    dataNascimento: dados.user?.dataNascimento,
    nomePessoa: dados.user?.name,
    corCamisa: dados.shirtSize,
    equipe: dados.team ?? dados.teamName ?? '',
    categoria: normalizarCategoria(dados.gender, dados.isElderly),
    numeroCamisa: dados.shirtNumber ?? dados.shoeNumber ?? '',
    itens: [
      {
        id: kit.id,
        titulo: `${nomeEvento} - ${distancia}`,
        quantidade: 1,
        valor_unitario: valor,
      },
    ],
  }
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

    const response = await fetch(`${API_BASE_URL}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(25000),
    })

    const text = await response.text()
    let result: { erro?: string; message?: string; linkPagamento?: string } | null = null

    try {
      result = text ? JSON.parse(text) : null
    } catch {
      result = text ? { erro: text } : null
    }

    if (!response.ok) {
      return NextResponse.json(
        result ?? { erro: 'Erro ao criar checkout.' },
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
