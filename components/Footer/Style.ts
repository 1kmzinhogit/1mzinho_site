import styled from 'styled-components'

export const FooterWrapper = styled.footer`
  background: #081638;
  padding: 3rem 0 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
`

export const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
`

export const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  
  strong {
    color: #d7ff32;
  }
`

export const FooterNav = styled.nav`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
  
  a {
    color: rgba(255, 255, 255, 0.82);
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.2s;
    
    &:hover {
      color: #d7ff32;
    }
  }
`

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: 1.5rem 0;
`

export const Copyright = styled.p`
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.85rem;
`
