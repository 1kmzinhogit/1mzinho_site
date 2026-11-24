'use client'

import { FileText } from 'lucide-react'
import { 
  Section, Container, SectionHeader, SectionTitle, SectionSubtitle
} from'./Style'

export default function LocationSection() {
  return (
    <Section id="local">
      <Container>
        <SectionHeader>
        <SectionTitle>Local do <strong>Evento</strong></SectionTitle>
          <SectionSubtitle>
            Consulte o regulamento no card de cada corrida para conferir locais, horários, datas e demais informações do evento.
          </SectionSubtitle>
        </SectionHeader>
      </Container>
    </Section>
  )
}
