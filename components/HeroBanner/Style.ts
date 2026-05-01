import styled from 'styled-components'

// export const HeroWrapper = styled.section<{ $banner: string; $bannerPosition?: string }>`
//   position: relative;
//   min-height: 100vh;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   background: url("${({ $banner }) => $banner}") no-repeat ${({ $bannerPosition }) => $bannerPosition ?? 'center center'};
//   background-size: cover;
//   overflow: hidden;
//   transition: background-image 0.8s ease-in-out;

//   &::before {
//     content: '';
//     position: absolute;
//     top: 0;
//     left: 0;
//     right: 0;
//     bottom: 0;
//     background: 
//       radial-gradient(circle at 20% 30%, rgba(215, 255, 50, 0.14) 0%, transparent 40%),
//       radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.08) 0%, transparent 40%);
//     pointer-events: none;
//   }
// `

export const HeroWrapper = styled.section`
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .banner-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      linear-gradient(180deg, rgba(8, 22, 56, 0.72) 0%, rgba(8, 22, 56, 0.32) 42%, rgba(8, 22, 56, 0.82) 100%),
      radial-gradient(circle at 50% 44%, rgba(0, 0, 0, 0.48) 0%, rgba(0, 0, 0, 0.22) 34%, transparent 62%);
    pointer-events: none;
    z-index: 1;
  }
`


export const Content = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 2rem;
  max-width: 900px;
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.55);
`

export const Badge = styled.span`
  display: inline-block;
  background: rgba(8, 22, 56, 0.78);
  color: #efff73;
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(215, 255, 50, 0.72);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(10px);
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
  color: #fff;
  margin-bottom: 2rem;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
`

export const InfoGrid = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.85rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
`

export const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 46px;
  padding: 0.7rem 1rem;
  border-radius: 999px;
  color: #fff;
  background: rgba(8, 22, 56, 0.76);
  border: 1px solid rgba(255, 255, 255, 0.28);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(10px);
  
  svg {
    color: #efff73;
    flex: 0 0 auto;
  }
  
  span {
    font-size: 1rem;
    font-weight: 600;
  }

  @media (max-width: 520px) {
    width: 100%;
    justify-content: center;
  }
`

export const CTAButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 280px;
  background: #d7ff32;
  color: #081638;
  padding: 1rem 3rem;
  border-radius: 50px;
  font-weight: 900;
  font-size: 1.1rem;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.72);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.34), 0 0 0 6px rgba(8, 22, 56, 0.2);
  text-shadow: none;
  
  &:hover {
    background: #efff73;
    transform: translateY(-3px);
    box-shadow: 0 18px 38px rgba(0, 0, 0, 0.38), 0 0 0 6px rgba(8, 22, 56, 0.26);
  }

  @media (max-width: 520px) {
    width: 100%;
    min-width: 0;
    padding: 1rem 1.5rem;
    font-size: 1rem;
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
