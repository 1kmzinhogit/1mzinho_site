'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Calendar, MapPin, ChevronDown } from 'lucide-react'
import { raceKits } from '@/data/race-data'
import {
  HeroWrapper, RunnerSilhouette, Content, Badge, Subtitle,
  InfoGrid, InfoItem, CTAButton, ScrollIndicator,
  CarouselDots, Dot
} from './Style'

const banners = [
  { src: "/banner.png",  position: "center center" },
  { src: "/banner2.png", position: "center center" },
  { src: "/banner3.png", position: "center top" },   // ajusta para não cortar o rosto
]

export default function HeroBanner() {
  const [currentBanner, setCurrentBanner] = useState(0)
  const evento = raceKits[0]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <HeroWrapper id="inicio">
      {/* Banner de fundo */}
      <div className="banner-bg">
        <Image
          src={banners[currentBanner].src}
          alt={`Banner ${currentBanner + 1}`}
          fill
          priority
          style={{
            objectFit: 'cover',
            objectPosition: banners[currentBanner].position,
          }}
        />
      </div>

      <RunnerSilhouette />
      <Content>
        <Badge>{evento?.raceName ?? 'Corridas e desafios'}</Badge>
        <Subtitle>{evento?.organizer ?? 'Escolha uma corrida e venha participar'}</Subtitle>

        <InfoGrid>
          <InfoItem>
            <Calendar size={20} />
            <span>{evento?.distance === 'virtual' ? 'Desafio virtual' : evento?.locationInfo?.[0]?.date ?? 'Confira os eventos'}</span>
          </InfoItem>
          <InfoItem>
            <MapPin size={20} />
            <span>{evento?.locationInfo?.[0]?.name ?? 'Vários locais'}</span>
          </InfoItem>
        </InfoGrid>

        <CTAButton href="#corridas">
          Inscreva-se Agora
        </CTAButton>
      </Content>

      <CarouselDots>
        {banners.map((_, i) => (
          <Dot
            key={i}
            $active={i === currentBanner}
            onClick={() => setCurrentBanner(i)}
          />
        ))}
      </CarouselDots>

      <ScrollIndicator>
        <a href="#patrocinadores">
          <ChevronDown size={32} />
        </a>
      </ScrollIndicator>
    </HeroWrapper>
  )
}
