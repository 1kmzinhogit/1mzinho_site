'use client'

import styled from 'styled-components'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { breakpoints } from '@/lib/breakpoints'

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;

  @media (max-width: ${breakpoints.tablet}) {
    padding: 1rem;
    align-items: flex-start;
  }
`

const Container = styled.div`
  max-width: 480px;
  width: 100%;
  background: linear-gradient(145deg, #141414 0%, #1a1a1a 100%);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.08);

  @media (max-width: ${breakpoints.tablet}) {
    margin-top: 5rem;
    padding: 1.25rem;
    border-radius: 14px;
  }
`

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.78);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.7rem 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
  transition: all 0.2s ease;

  &:hover {
    color: #fff;
    border-color: rgba(0, 164, 245, 0.35);
    background: rgba(0, 164, 245, 0.08);
  }

  @media (max-width: ${breakpoints.tablet}) {
    width: fit-content;
    font-size: 0.85rem;
    padding: 0.65rem 0.8rem;
  }
`

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #39FF14 0%, #F50187 50%, #00A4F5 100%);
  -webkit-background-clip: text;
  color: transparent;

  @media (max-width: ${breakpoints.tablet}) {
    font-size: 1.3rem;
  }
`

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  margin-bottom: 1.5rem;

  @media (max-width: ${breakpoints.tablet}) {
    font-size: 0.9rem;
    line-height: 1.5;
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
`

const Input = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: #00A4F5;
    box-shadow: 0 0 0 1px rgba(0, 164, 245, 0.4);
  }

  @media (max-width: ${breakpoints.tablet}) {
    font-size: 0.9rem;
  }
`

const Button = styled.button`
  margin-top: 1rem;
  width: 100%;
  padding: 0.9rem 1.5rem;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #39FF14 0%, #F50187 50%, #00A4F5 100%);
  color: #0a0a0a;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 10px 30px rgba(0, 164, 245, 0.35);
  }

  @media (max-width: ${breakpoints.tablet}) {
    padding: 0.85rem 1rem;
    font-size: 0.9rem;
  }
`

const Helper = styled.p`
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.55);
`

export default function AlterarDadosPage() {
  const [cpf, setCpf] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    if (!cpf) {
      setMessage('Informe um CPF válido.')
      return
    }

    try {
      setLoading(true)

      // Endpoint de exemplo para buscar pedido por CPF.
      // Ajuste a URL caso a API esteja atrás de proxy/rota diferente.
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/orders/by-cpf?cpf=${encodeURIComponent(cpf)}`)

      if (res.status === 404) {
        setMessage('Nenhuma inscrição encontrada para este CPF.')
        return
      }

      if (!res.ok) {
        setMessage('Não foi possível localizar os dados. Tente novamente.')
        return
      }

      const data = await res.json()
      // Aqui você pode redirecionar para uma tela de edição detalhada
      // ou abrir um modal. Por enquanto, apenas confirma a localização.
      setMessage(`Inscrição localizada para ${data.raceName}. Em breve, tela de edição completa.`)
    } catch (err) {
      console.error(err)
      setMessage('Erro ao consultar o CPF. Verifique sua conexão e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper>
      <Container>
        <BackButton href="/">
          <ArrowLeft size={16} />
          Voltar
        </BackButton>

        <Title>Alterar dados da inscrição</Title>
        <Subtitle>
          Informe o CPF utilizado na compra para localizar sua inscrição e permitir ajustes
          de dados como camisa, contato e outras informações.
        </Subtitle>

        <Form onSubmit={handleSubmit}>
          <Label>
            CPF do participante
            <Input
              type="text"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
            />
          </Label>

          <Button type="submit" disabled={loading}>
            {loading ? 'Buscando inscrição...' : 'Buscar inscrição pelo CPF'}
          </Button>
        </Form>

        <Helper>
          Por segurança, apenas uma compra por CPF é permitida por evento de corrida. Caso
          precise trocar dados, localize primeiro a sua inscrição pelo CPF.
        </Helper>

        {message && (
          <Helper style={{ marginTop: '1rem', color: '#39FF14' }}>
            {message}
          </Helper>
        )}
      </Container>
    </PageWrapper>
  )
}

