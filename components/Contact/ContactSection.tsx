'use client'

import { Mail, Phone, Instagram, Facebook, MessageCircle } from 'lucide-react'
import { eventInfo } from '@/data/race-data'
import {
  Section, Container, SectionHeader, SectionTitle, SectionSubtitle, Grid, ContactCard, IconWrapper,
  ContactTitle, ContactValue, SocialGrid, SocialButton
 } from './Style'

import {
  
} from './Style'

export default function ContactSection() {
  const { contact } = eventInfo

  return (
    <Section id="contato">
      <Container>
        <SectionHeader>
          <SectionTitle>Entre em <strong>Contato</strong></SectionTitle>
          <SectionSubtitle>
            Ficou com alguma dúvida? Fale conosco através dos canais abaixo
          </SectionSubtitle>
        </SectionHeader>
        
        <Grid>
          <ContactCard href={`mailto:${contact.email}`}>
            <IconWrapper className="icon-wrapper">
              <Mail size={24} />
            </IconWrapper>
            <ContactTitle>E-mail</ContactTitle>
            <ContactValue>{contact.email}</ContactValue>
          </ContactCard>
          
          <ContactCard href={`tel:${contact.phone.replace(/\D/g, '')}`}>
            <IconWrapper className="icon-wrapper">
              <Phone size={24} />
            </IconWrapper>
            <ContactTitle>Telefone</ContactTitle>
            <ContactValue>{contact.phone}</ContactValue>
          </ContactCard>
          
          <ContactCard 
            href={`https://wa.me/${contact.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconWrapper className="icon-wrapper">
              <MessageCircle size={24} />
            </IconWrapper>
            <ContactTitle>WhatsApp</ContactTitle>
            <ContactValue>Enviar mensagem</ContactValue>
          </ContactCard>
        </Grid>
        
        <SocialGrid>
          <SocialButton 
            href={`https://instagram.com/${contact.instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <Instagram size={22} />
          </SocialButton>
          
          <SocialButton 
            href={`https://facebook.com${contact.facebook}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <Facebook size={22} />
          </SocialButton>
        </SocialGrid>
      </Container>
    </Section>
  )
}
