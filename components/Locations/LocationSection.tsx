'use client'

import { MapPin, Calendar, Clock, FileText, ExternalLink } from 'lucide-react'
import { raceKits } from '@/data/race-data'
import { 
  Section, Container, SectionHeader, SectionTitle, SectionSubtitle, Grid, Card, CardIcon,
  CardTitle, InfoList, InfoItem, InfoContent
} from'./Style'

export default function LocationSection() {
  const eventosComLocal = raceKits.filter(evento => evento.locationInfo?.length)

  return (
    <Section id="local">
      <Container>
        <SectionHeader>
        <SectionTitle>Locais e <strong>Datas</strong></SectionTitle>
          <SectionSubtitle>
            Locais, entregas e datas informados no regulamento de cada evento
          </SectionSubtitle>
        </SectionHeader>
        
        {eventosComLocal.length > 0 && (
          <Grid>
            {eventosComLocal.flatMap(evento => evento.locationInfo!.map((local, index) => (
              <Card key={`${evento.id}-${index}`}>
                <CardIcon><MapPin size={28} /></CardIcon>
                <CardTitle>{evento.raceName}</CardTitle>
                <InfoList>
                  <InfoItem>
                    <MapPin size={18} />
                    <InfoContent>
                      <h4>{local.label}</h4>
                      <p>{local.name}</p>
                      {local.address && <p>{local.address}</p>}
                      {local.city && <p>{local.city}</p>}
                    </InfoContent>
                  </InfoItem>
                  {local.date && <InfoItem><Calendar size={18} /><InfoContent><h4>Data</h4><p>{local.date}</p></InfoContent></InfoItem>}
                  {local.time && <InfoItem><Clock size={18} /><InfoContent><h4>Horário</h4><p>{local.time}</p></InfoContent></InfoItem>}
                </InfoList>
                {evento.documents?.filter(document => /regulamento/i.test(document.label)).map(document => (
                  <a
                    key={document.href}
                    href={document.href}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', color: '#d7ff32', textDecoration: 'none' }}
                  >
                    <FileText size={16} />Consultar regulamento<ExternalLink size={15} />
                  </a>
                ))}
              </Card>
            )))}
          </Grid>
        )}
      </Container>
    </Section>
  )
}
