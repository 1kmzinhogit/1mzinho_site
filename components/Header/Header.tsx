'use client'

import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import {
  HeaderWrapper,
  Container,
  Logo,
  Nav,
  NavLink,
  RightSection,
  CTAButton,
  MobileMenuButton,
  TitleImage,
  MobileNavActions,
  DesktopNavActions,
} from'./Style'


export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <HeaderWrapper>
      <Container>
        <Logo href="#inicio">
          {/* Alterna entre as logos neon/azul/branca que estão em /public */}
          <TitleImage
            src="/logo_neon.png"
            alt="1kmzinho"
            onMouseEnter={(e) => { e.currentTarget.src = '/logo_azul.png' }}
            onMouseLeave={(e) => { e.currentTarget.src = '/logo_branca.png' }}
          />
        </Logo>
        
        <Nav $isOpen={isMenuOpen}>
          <NavLink href="#inicio" onClick={() => setIsMenuOpen(false)}>Início</NavLink>
          <NavLink href="#corridas" onClick={() => setIsMenuOpen(false)}>Corridas</NavLink>
          <NavLink href="#local" onClick={() => setIsMenuOpen(false)}>Local</NavLink>
          <NavLink href="#contato" onClick={() => setIsMenuOpen(false)}>Contato</NavLink>
          <MobileNavActions>
            <CTAButton href="/pagamento/alterar-dados" $variant="ghost" onClick={() => setIsMenuOpen(false)}>
              Alterar dados
            </CTAButton>
            <CTAButton href="#corridas" onClick={() => setIsMenuOpen(false)}>
              Inscrever-se
            </CTAButton>
          </MobileNavActions>
        </Nav>
        
        <RightSection>
          <DesktopNavActions>
            <CTAButton href="/pagamento/alterar-dados" $variant="ghost">
              Alterar dados
            </CTAButton>
            <CTAButton href="#corridas">
              Inscrever-se
            </CTAButton>
          </DesktopNavActions>

          <MobileMenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </MobileMenuButton>
        </RightSection>
      </Container>
    </HeaderWrapper>
  )
}
