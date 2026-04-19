import styled, { keyframes } from 'styled-components'

export const Section = styled.section`
  background: #0b1f4a;
  padding: 3rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
`

export const SectionTitle = styled.h3`
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 3px;
  margin-bottom: 2rem;
  font-weight: 500;
`

export const scroll = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
`

export const SliderWrapper = styled.div`
  overflow: hidden;
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
`

export const SliderTrack = styled.div`
  display: flex;
  gap: 4rem;
  animation: ${scroll} 20s linear infinite;
  width: fit-content;
`

export const SponsorItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 150px;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(215, 255, 50, 0.14);
    border-color: rgba(255, 255, 255, 0.5);
  }
  
  span {
    color: #d7ff32;
    font-weight: 600;
    font-size: 1.1rem;
    letter-spacing: 1px;
  }
`
