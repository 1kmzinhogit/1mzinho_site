'use client'

import { eventInfo } from '@/data/race-data'
import { FooterWrapper, Container, FooterContent, Logo, FooterNav, Divider, Copyright } from './Style'

export default function Footer() {
  return (
    <FooterWrapper>
      <Container>
        <FooterContent>
          <Logo>
            <strong>1km</strong>zinho
          </Logo>
          
          <FooterNav>
            <a href="#inicio">Início</a>
            <a href="#corridas">Corridas</a>
            <a href="#local">Local</a>
            <a href="#contato">Contato</a>
          </FooterNav>
          
          <Divider />
          
          <Copyright>
            &copy; {new Date().getFullYear()} {eventInfo.name}. Todos os direitos reservados.
          </Copyright>
        </FooterContent>
      </Container>
    </FooterWrapper>
  )
}
