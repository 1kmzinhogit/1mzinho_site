import { NextResponse } from 'next/server'

const API_BASE_URL = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'https://api-1kmzinho.onrender.com').replace(/\/$/, '')

type BackendError = {
  erro?: string
  message?: string
  detail?: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const nomeEvento = searchParams.get('nomeEvento')?.trim()

  if (!nomeEvento) {
    return NextResponse.json(
      { erro: 'Parametro obrigatorio ausente: nomeEvento.' },
      { status: 400 },
    )
  }

  try {
    const response = await fetch(`${API_BASE_URL}/lotes/status?nomeEvento=${encodeURIComponent(nomeEvento)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    })

    const text = await response.text()
    let result: unknown = null

    try {
      result = text ? JSON.parse(text) : null
    } catch {
      result = text
    }

    if (!response.ok) {
      const error = result as BackendError | null

      return NextResponse.json(
        {
          erro: error?.erro ?? error?.message ?? (text || 'Erro ao consultar status dos lotes.'),
          detail: error?.detail ?? `API /lotes/status retornou status ${response.status}.`,
          backendStatus: response.status,
          backendResponse: result,
        },
        { status: response.status },
      )
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        erro: 'Nao foi possivel consultar o status dos lotes.',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    )
  }
}
