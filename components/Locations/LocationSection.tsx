'use client'

import { MapPin, Calendar, Clock, Navigation } from 'lucide-react'
import { eventInfo } from '@/data/race-data'
import { 
  Section, Container, SectionHeader, SectionTitle, SectionSubtitle, Grid, Card, CardIcon,
  CardTitle, InfoList, InfoItem, InfoContent, MapButton
} from'./Style'

export default function LocationSection() {
  const { location, kitPickup } = eventInfo

  return (
    <Section id="local">
      <Container>
        <SectionHeader>
          <SectionTitle>Local do <strong>Evento</strong></SectionTitle>
          <SectionSubtitle>
            Confira onde será a largada e os pontos de retirada do seu kit
          </SectionSubtitle>
        </SectionHeader>
        
        <Grid>
          <Card>
            <CardIcon>
              <MapPin size={28} />
            </CardIcon>
            <CardTitle>Local da Corrida</CardTitle>
            
            <InfoList>
              <InfoItem>
                <MapPin size={18} />
                <InfoContent>
                  <h4>{location.name}</h4>
                  <p>{location.address}</p>
                  <p>{location.city}</p>
                </InfoContent>
              </InfoItem>
              
              <InfoItem>
                <Calendar size={18} />
                <InfoContent>
                  <h4>Data do Evento</h4>
                  <p>{eventInfo.date}</p>
                </InfoContent>
              </InfoItem>
              
              <InfoItem>
                <Clock size={18} />
                <InfoContent>
                  <h4>Horário da Largada</h4>
                  <p>{eventInfo.time}h</p>
                </InfoContent>
              </InfoItem>
            </InfoList>
            
            <MapButton 
              href={`https://www.google.com/maps?q=${location.coordinates.lat},${location.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation size={16} />
              Ver no Google Maps
            </MapButton>
          </Card>
          
          <Card>
            <CardIcon>
              <Calendar size={28} />
            </CardIcon>
            <CardTitle>Retirada do Kit</CardTitle>
            
            <InfoList>
              <InfoItem>
                <MapPin size={18} />
                <InfoContent>
                  <h4>{kitPickup.name}</h4>
                  <p>{kitPickup.address}</p>
                  <p>{kitPickup.city}</p>
                </InfoContent>
              </InfoItem>
              
              <InfoItem>
                <Calendar size={18} />
                <InfoContent>
                  <h4>Datas de Retirada</h4>
                  <p>{kitPickup.dates}</p>
                </InfoContent>
              </InfoItem>
              
              <InfoItem>
                <Clock size={18} />
                <InfoContent>
                  <h4>Horário de Funcionamento</h4>
                  <p>{kitPickup.time}</p>
                </InfoContent>
              </InfoItem>
            </InfoList>
            
            <MapButton 
              href={`https://www.google.com/maps?q=${location.coordinates.lat},${location.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation size={16} />
              Ver no Google Maps
            </MapButton>
          </Card>
        </Grid>
      </Container>
    </Section>
  )
}
