'use client'

import { useState, useEffect } from 'react'
import { Calendar, MapPin, ChevronDown } from 'lucide-react'
import { eventInfo } from '@/data/race-data'
import {
  HeroWrapper, RunnerSilhouette, Content, Badge, Subtitle,
  InfoGrid, InfoItem, CTAButton, ScrollIndicator,
  CarouselDots, Dot
} from './Style'

const banners = [
  { src: "banner.png",  position: "center center" },
  { src: "banner2.png", position: "center center" },
  { src: "banner3.png", position: "center top" },   // ajusta para não cortar o rosto
]

export default function HeroBanner() {
  const [currentBanner, setCurrentBanner] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <HeroWrapper id="inicio" $banner={banners[currentBanner].src} $bannerPosition={banners[currentBanner].position}>
      <RunnerSilhouette />
      <Content>
        <Badge>Corrida de Rua 2026</Badge>
        <Subtitle>{eventInfo.tagline}</Subtitle>

        <InfoGrid>
          <InfoItem>
            <Calendar size={20} />
            <span>{eventInfo.date}</span>
          </InfoItem>
          <InfoItem>
            <MapPin size={20} />
            <span>{eventInfo.location.name}</span>
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