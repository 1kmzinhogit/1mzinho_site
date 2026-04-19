import styled from 'styled-components'

export const Section = styled.section`
  background: #081638;
  padding: 5rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
`

export const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`

export const SectionTitle = styled.h2`
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  color: #fff;
  margin-bottom: 1rem;
  
  strong {
    color: #d7ff32;
  }
`

export const SectionSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
`

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
`

export const ContactCard = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(145deg, #0b1f4a 0%, #081638 100%);
  border-radius: 16px;
  padding: 2rem 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.65);
    transform: translateY(-5px);
    
    .icon-wrapper {
      background: linear-gradient(135deg, rgba(215, 255, 50, 0.26) 0%, rgba(255, 255, 255, 0.22) 100%);
      
      svg {
        color: #d7ff32;
      }
    }
  }
`

export const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  background: rgba(215, 255, 50, 0.14);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  svg {
    color: #d7ff32;
    transition: all 0.3s ease;
  }
`

export const ContactTitle = styled.span`
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
`

export const ContactValue = styled.span`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  text-align: center;
`

export const SocialGrid = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 3rem;
`

export const SocialButton = styled.a`
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
  
  svg {
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.2s;
  }
  
  &:hover {
    background: linear-gradient(135deg, rgba(215, 255, 50, 0.26) 0%, rgba(255, 255, 255, 0.22) 100%);
    border-color: rgba(255, 255, 255, 0.7);
    transform: translateY(-3px);
    
    svg {
      color: #d7ff32;
    }
  }
`