import styled from 'styled-components'

export const Section = styled.section`
  background: linear-gradient(180deg, #081638 0%, #0b1f4a 100%);
  padding: 5rem 0;
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
  color: #d7ff32;
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
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

export const Card = styled.div`
  background: linear-gradient(145deg, #0b1f4a 0%, #081638 100%);
  border-radius: 20px;
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.6);
    transform: translateY(-5px);
  }
`

export const CardIcon = styled.div`
  width: 60px;
  height: 60px;
  background: rgba(215, 255, 50, 0.14);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  
  svg {
    color: #d7ff32;
  }
`

export const CardTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 1.5rem;
`

export const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  
  svg {
    color: #39FF14;
    flex-shrink: 0;
    margin-top: 2px;
  }
`

export const InfoContent = styled.div`
  h4 {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  
  p {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
    line-height: 1.5;
  }
`

export const MapButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(215, 255, 50, 0.12);
  color: #d7ff32;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  margin-top: 1.5rem;
  transition: all 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.45);
  
  &:hover {
    background: rgba(215, 255, 50, 0.2);
    transform: translateX(5px);
  }
`
