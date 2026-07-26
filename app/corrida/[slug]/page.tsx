import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { raceKits } from '@/data/race-data'
import RaceRedirect from './RaceRedirect'

type RacePageProps = {
  params: Promise<{ slug: string }>
}

async function getOrigin() {
  const requestHeaders = await headers()
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host')
  const protocol = requestHeaders.get('x-forwarded-proto') ?? (host?.includes('localhost') ? 'http' : 'https')

  return host ? `${protocol}://${host}` : 'http://localhost:3000'
}

export async function generateMetadata({ params }: RacePageProps): Promise<Metadata> {
  const { slug } = await params
  const race = raceKits.find(item => item.id === slug)

  if (!race) {
    return { title: 'Corrida não encontrada | 1kmzinho' }
  }

  const origin = await getOrigin()
  const imageUrl = race.img ? new URL(race.img, origin).toString() : undefined
  const pageUrl = `${origin}/corrida/${race.id}`
  const title = `${race.raceName} | 1kmzinho`

  return {
    title,
    description: race.description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description: race.description,
      url: pageUrl,
      siteName: '1kmzinho',
      type: 'website',
      images: imageUrl ? [{ url: imageUrl, alt: race.raceName }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: race.description,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default async function RacePage({ params }: RacePageProps) {
  const { slug } = await params
  const race = raceKits.find(item => item.id === slug)

  if (!race) notFound()

  return <RaceRedirect slug={race.id} />
}
