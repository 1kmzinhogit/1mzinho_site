import { NextResponse } from 'next/server'

const API_BASE_URL = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'https://api-1kmzinho.onrender.com').replace(/\/$/, '')

type BackendError = {
  erro?: string
  message?: string
  detail?: string
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null
}

function filterByNomeEvento(payload: unknown, nomeEvento: string) {
  const record = asRecord(payload)
  const lotes = record?.lotes

  if (!Array.isArray(lotes)) return payload

  const normalizedNomeEvento = nomeEvento.trim().toLowerCase()

  return {
    ...record,
    lotes: lotes.filter(item => {
      const lote = asRecord(item)
      const itemNomeEvento = String(lote?.nomeEvento ?? '').trim().toLowerCase()

      return itemNomeEvento === normalizedNomeEvento
    }),
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const nomeEvento = searchParams.get('nomeEvento')?.trim()

  try {
    const response = await fetch(`${API_BASE_URL}/lotes/status`, {
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

    return NextResponse.json(nomeEvento ? filterByNomeEvento(result, nomeEvento) : result, {
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
