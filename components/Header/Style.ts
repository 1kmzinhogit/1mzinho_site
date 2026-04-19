import styled from 'styled-components'
import { breakpoints } from '@/lib/breakpoints'

export const HeaderWrapper = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(8, 22, 56, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
  display: block;
`

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.9rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-height: 100px; /* controla a altura do header */
  overflow: visible; /* deixa a imagem "sair" do header */

  @media (max-width: ${breakpoints.desktop}) {
    padding: 0.85rem 1.25rem;
    gap: 1rem;
  }

  @media (max-width: ${breakpoints.tablet}) {
    padding: 0.8rem 1rem;
  }
`

export const TitleImage = styled.img`
  height: 150px;
  width: auto;
  margin: 0; /* remove o margin auto */
  flex-shrink: 0;
  position: relative; /* pode ser absolute se quiser sobrepor */
  left: 0; /* garante que fique na esquerda */

  @media (max-width: ${breakpoints.tablet}) {
    height: 48px;
  }
`

export const Logo = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  
  span {
    font-size: 1.5rem;
    font-weight: 800;
    color: #fff;
    
    strong {
      color: #d7ff32;
    }
  }
`

export const Nav = styled.nav<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: 1.4rem;

  @media (max-width: ${breakpoints.desktop}) {
    gap: 1rem;
  }

  @media (max-width: ${breakpoints.tablet}) {
    position: fixed;
    top: 68px;
    left: 1rem;
    right: 1rem;
    background: rgba(8, 22, 56, 0.98);
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
    padding: 1rem;
    border-radius: 16px;
    transform: ${({ $isOpen }) => $isOpen ? 'translateY(0)' : 'translateY(-120%)'};
    opacity: ${({ $isOpen }) => $isOpen ? 1 : 0};
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.22);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
    pointer-events: ${({ $isOpen }) => ($isOpen ? 'auto' : 'none')};
  }
`

export const NavLink = styled.a`
  color: #d7ff32;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;

  &:hover {
    color: #ffffff;
  }

  @media (max-width: ${breakpoints.tablet}) {
    padding: 0.9rem 1rem;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.06);
    font-size: 0.9rem;
  }
`

export const CTAButton = styled.a<{ $variant?: 'solid' | 'ghost' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  background: ${({ $variant }) =>
    $variant === 'ghost'
      ? 'transparent'
      : 'linear-gradient(135deg, rgba(215, 255, 50, 0.2) 0%, rgba(255, 255, 255, 0.12) 100%)'};
  color: ${({ $variant }) => ($variant === 'ghost' ? '#ffffff' : '#d7ff32')};
  border: 1px solid
    ${({ $variant }) =>
      $variant === 'ghost' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(215, 255, 50, 0.45)'};
  padding: 0.68rem 1rem;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  font-size: 0.82rem;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(255, 255, 255, 0.8);
    box-shadow: 0 10px 22px rgba(215, 255, 50, 0.2);
  }

  @media (max-width: ${breakpoints.desktop}) {
    padding: 0.64rem 0.9rem;
    font-size: 0.78rem;
  }

  @media (max-width: ${breakpoints.tablet}) {
    width: 100%;
    padding: 0.9rem 1rem;
    border-radius: 12px;
    font-size: 0.9rem;
  }
`

export const MobileMenuButton = styled.button`
  display: none;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
  padding: 0.5rem;

  @media (max-width: ${breakpoints.tablet}) {
    display: block;
  }
`

export const DesktopNavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;

  @media (max-width: ${breakpoints.tablet}) {
    display: none;
  }
`

export const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: ${breakpoints.tablet}) {
    gap: 0.5rem;
  }
`

export const MobileNavActions = styled.div`
  display: none;

  @media (max-width: ${breakpoints.tablet}) {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
`