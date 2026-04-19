import styled from 'styled-components'

export const HeroWrapper = styled.section<{ $banner: string; $bannerPosition?: string }>`
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url("${({ $banner }) => $banner}") no-repeat ${({ $bannerPosition }) => $bannerPosition ?? 'center center'};
  background-size: cover;
  overflow: hidden;
  transition: background-image 0.8s ease-in-out;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(215, 255, 50, 0.14) 0%, transparent 40%),
      radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.08) 0%, transparent 40%);
    pointer-events: none;
  }
`

export const Content = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 2rem;
  max-width: 900px;
`

export const Badge = styled.span`
  display: inline-block;
  background: rgba(215, 255, 50, 0.16);
  color: #d7ff32;
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.4);
`

export const Title = styled.h1`
  font-size: clamp(3rem, 10vw, 7rem);
  font-weight: 900;
  color: #fff;
  line-height: 1;
  margin-bottom: 0.5rem;
  
  strong {
    color: #d7ff32;
  }
`

export const TitleImage = styled.img`
  display: block;
  margin: 0 auto 0.5rem;
  width: 90vh;
  max-width: 600px;
  height: auto;
`

export const Subtitle = styled.p`
  font-size: clamp(1rem, 3vw, 1.5rem);
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 2rem;
  font-weight: 300;
  letter-spacing: 3px;
  text-transform: uppercase;
`

export const InfoGrid = styled.div`
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
`

export const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  
  svg {
    color: #d7ff32;
  }
  
  span {
    font-size: 1rem;
  }
`

export const CTAButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, rgba(215, 255, 50, 0.24) 0%, rgba(255, 255, 255, 0.15) 100%);
  color: #d7ff32;
  padding: 1rem 3rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1.1rem;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, rgba(215, 255, 50, 0.35) 0%, rgba(255, 255, 255, 0.22) 100%);
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(215, 255, 50, 0.24);
  }
`

export const CarouselDots = styled.div`
  position: absolute;
  bottom: 5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  z-index: 3;
`

export const Dot = styled.button<{ $active: boolean }>`
  width: ${({ $active }) => ($active ? '2rem' : '0.5rem')};
  height: 0.5rem;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: ${({ $active }) => ($active ? '#d7ff32' : 'rgba(255,255,255,0.4)')};
  transition: all 0.3s ease;
  padding: 0;

  &:hover {
    background: ${({ $active }) => ($active ? '#d7ff32' : 'rgba(255,255,255,0.7)')};
  }
`

export const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  animation: bounce 2s infinite;
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateX(-50%) translateY(0);
    }
    40% {
      transform: translateX(-50%) translateY(-10px);
    }
    60% {
      transform: translateX(-50%) translateY(-5px);
    }
  }
  
  a {
    color: rgba(255, 255, 255, 0.5);
    transition: color 0.2s;
    
    &:hover {
      color: #d7ff32;
    }
  }
`

export const RunnerSilhouette = styled.div`
  position: absolute;
  right: -5%;
  bottom: 10%;
  width: 40%;
  height: 70%;
  background: linear-gradient(to right, transparent, rgba(215, 255, 50, 0.07));
  clip-path: polygon(30% 100%, 35% 85%, 40% 70%, 50% 55%, 55% 45%, 65% 35%, 70% 25%, 75% 15%, 80% 5%, 85% 0%, 100% 0%, 100% 100%);
  pointer-events: none;
  
  @media (max-width: 768px) {
    display: none;
  }
`