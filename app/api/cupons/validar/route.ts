import { NextResponse } from 'next/server'

const API_BASE_URL = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'https://api-1kmzinho.onrender.com').replace(/\/$/, '')

type Body = {
  kitId?: string
  cupom?: string
  gender?: string
  categoria?: string
  isElderly?: boolean
}

type ValidationResult = {
  erro?: string
  message?: string
  codigoCupom?: string
  valorIngresso?: number
  descontoCupom?: number
  taxaServico?: number
  total?: number
}

function normalizarCategoria(body: Body) {
  const value = String(body.categoria ?? body.gender ?? '').toLowerCase()
  if (body.isElderly || value.includes('60')) return 'MAIOR_60'
  if (value.includes('fem')) return 'FEMININO'
  if (value.includes('lgbt')) return 'LGBTQIA'
  if (value.includes('pcd')) return 'PCD'
  return 'MASCULINO'
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Body
    const kitId = body.kitId?.trim() ?? ''
    const cupom = body.cupom?.trim() ?? ''

    if (!kitId || !cupom) {
      return NextResponse.json({ erro: 'Informe o cupom para validar.' }, { status: 400 })
    }

    const response = await fetch(`${API_BASE_URL}/cupons/validar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ kitId, cupom, categoria: normalizarCategoria(body) }),
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    })

    const text = await response.text()
    let result: ValidationResult | null = null
    try {
      result = text ? JSON.parse(text) as ValidationResult : null
    } catch {
      result = text ? { erro: text } : null
    }

    if (!response.ok) {
      return NextResponse.json(
        { erro: result?.erro ?? result?.message ?? 'Não foi possível validar o cupom.' },
        { status: response.status },
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        erro: 'Não foi possível validar o cupom agora.',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    )
  }
}
