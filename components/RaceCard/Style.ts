import styled from 'styled-components'

export const Section = styled.section`
  background: #081638;
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
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
`

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
`

export const Card = styled.div<{ $featured?: boolean }>`
  background: linear-gradient(145deg, #0b1f4a 0%, #081638 100%);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid ${({ $featured }) => $featured ? 'rgba(215, 255, 50, 0.5)' : 'rgba(255, 255, 255, 0.2)'};
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  ${({ $featured }) => $featured && `
    box-shadow: 0 0 40px rgba(215, 255, 50, 0.15);
  `}
  
  &:hover {
    transform: translateY(-5px);
    border-color: rgba(255, 255, 255, 0.6);
  }
`

export const FeaturedBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #d7ff32;
  color: #081638;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`

export const Distance = styled.div`
  display: inline-block;
  background: rgba(215, 255, 50, 0.15);
  color: #d7ff32;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
`

export const RaceName = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
`

export const BannerCorrida = styled.img`
  width: 100%;
  height: auto;
  border-radius: 10px;
  margin-bottom: 1rem;
`

export const Description = styled.p`
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
`

export const LotInfo = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

export const LotHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`

export const LotBadge = styled.span`
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
`

export const Slots = styled.span`
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.8rem;
`

export const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`

export const ProgressBarFill = styled.div<{ $percentage: number; $critical?: boolean }>`
  height: 100%;
  width: ${({ $percentage }) => $percentage}%;
  background: ${({ $critical, $percentage }) => 
    $critical || $percentage >= 90 
      ? '#e74c3c' 
      : $percentage >= 70 
        ? '#f39c12' 
        : '#d7ff32'};
  border-radius: 4px;
  transition: width 0.5s ease;
`

export const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
`

export const Price = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 1.5rem;
  
  small {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 400;
  }
`

export const FormGroup = styled.div`
  margin-bottom: 1rem;
`

export const Label = styled.label`
  display: block;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

export const Input = styled.input`
  width: 100%;
  background: rgba(8, 22, 56, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 8px;
  padding: 0.8rem 1rem;
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.2s;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #d7ff32;
    background: rgba(8, 22, 56, 0.7);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`

export const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
`

export const ActionButton = styled.button<{ $variant: 'subscribe' | 'buy'; $success?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: ${({ $variant, $success }) => {
    if ($success) return '#d7ff32';
    return $variant === 'subscribe' 
      ? 'rgba(255, 255, 255, 0.08)' 
      : 'linear-gradient(135deg, rgba(215, 255, 50, 0.25) 0%, rgba(255, 255, 255, 0.2) 100%)';
  }};
  color: ${({ $variant, $success }) => {
    if ($success) return '#081638';
    return $variant === 'subscribe' ? '#ffffff' : '#d7ff32';
  }};
  border: ${({ $variant }) => $variant === 'subscribe' ? '1px solid rgba(255, 255, 255, 0.6)' : '1px solid rgba(215, 255, 50, 0.45)'};
  padding: 1rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: scale(1.02);
    ${({ $variant }) => $variant === 'subscribe' && `
      background: rgba(255, 255, 255, 0.16);
    `}
    ${({ $variant }) => $variant === 'buy' && `
      background: linear-gradient(135deg, rgba(215, 255, 50, 0.35) 0%, rgba(255, 255, 255, 0.28) 100%);
    `}
  }
  
  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
    transform: none;
  }
`

export const Message = styled.div<{ $type: 'error' | 'success' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-top: 1rem;
  background: ${({ $type }) => $type === 'error' ? 'rgba(231, 76, 60, 0.15)' : 'rgba(39, 174, 96, 0.15)'};
  color: ${({ $type }) => $type === 'error' ? '#e74c3c' : '#27ae60'};
  border: 1px solid ${({ $type }) => $type === 'error' ? 'rgba(231, 76, 60, 0.3)' : 'rgba(39, 174, 96, 0.3)'};
`

/* ── Modal ─────────────────────────────────────────────────────────────────── */

export const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;

  /* Mobile: bottom sheet que sobe de baixo */
  align-items: flex-end;
  justify-content: center;

  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease, visibility 0.3s ease;

  /* Desktop: centralizado */
  @media (min-width: 640px) {
    align-items: center;
    padding: 1rem;
  }
`

export const ModalContent = styled.div`
  background: linear-gradient(145deg, #0b1f4a 0%, #081638 100%);
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.25);
  position: relative;

  /* Mobile: bottom sheet */
  border-radius: 20px 20px 0 0;
  padding: 1.5rem 1.5rem 2rem;
  max-height: 92dvh;          /* dvh respeita a barra do browser no iOS */
  overflow-y: auto;
  overscroll-behavior: contain; /* scroll interno não vaza pro fundo */
  -webkit-overflow-scrolling: touch;

  /* Desktop: modal centralizado */
  @media (min-width: 640px) {
    max-width: 400px;
    border-radius: 20px;
    padding: 2rem;
    max-height: 90vh;
  }
`

export const ModalClose = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s;
  
  &:hover {
    color: #fff;
  }
`

export const ModalTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
`

export const ModalSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
`

export const GenderSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`

export const GenderButton = styled.button<{ $selected: boolean }>`
  flex: 1;
  min-width: 80px;
  padding: 0.75rem 0.5rem;
  border-radius: 10px;
  border: 2px solid ${({ $selected }) => $selected ? '#d7ff32' : 'rgba(255, 255, 255, 0.2)'};
  background: ${({ $selected }) => $selected ? 'rgba(215, 255, 50, 0.16)' : 'rgba(8, 22, 56, 0.55)'};
  color: ${({ $selected }) => $selected ? '#d7ff32' : 'rgba(255, 255, 255, 0.8)'};
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #d7ff32;
    color: #d7ff32;
  }
`

export const ElderlyCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(8, 22, 56, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.2s;
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.4);
  }
  
  input {
    width: 18px;
    height: 18px;
    accent-color: #d7ff32;
    cursor: pointer;
  }
  
  span {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
    font-weight: 500;
  }
`

export const SizeSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`

export const SizeButton = styled.button<{ $selected: boolean }>`
  flex: 1;
  min-width: 50px;
  padding: 0.75rem 0.5rem;
  border-radius: 10px;
  border: 2px solid ${({ $selected }) => $selected ? '#d7ff32' : 'rgba(255, 255, 255, 0.2)'};
  background: ${({ $selected }) => $selected ? 'rgba(215, 255, 50, 0.16)' : 'rgba(8, 22, 56, 0.55)'};
  color: ${({ $selected }) => $selected ? '#d7ff32' : 'rgba(255, 255, 255, 0.8)'};
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #d7ff32;
    color: #d7ff32;
  }
`

export const ShoeNumberInput = styled.div`
  margin-bottom: 1.5rem;
`

export const TeamNameInput = styled.div`
  margin-bottom: 1rem;
`

export const ColorSelector = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`

export const ColorButton = styled.button<{ $selected: boolean; $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid ${({ $selected, $color }) => $selected ? '#fff' : $color};
  background: ${({ $color }) => $color};
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${({ $selected }) => $selected ? '0 0 0 2px #d7ff32' : 'none'};
  
  &:hover {
    transform: scale(1.1);
  }
`

export const ColorLabel = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

export const ConfirmButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, rgba(215, 255, 50, 0.25) 0%, rgba(255, 255, 255, 0.2) 100%);
  color: #d7ff32;
  border: none;
  padding: 1rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: linear-gradient(135deg, rgba(215, 255, 50, 0.35) 0%, rgba(255, 255, 255, 0.28) 100%);
    transform: scale(1.02);
  }
  
  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.3);
    cursor: not-allowed;
    transform: none;
  }
`

export const PriceTag = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(215, 255, 50, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  
  span {
    font-size: 1.5rem;
    font-weight: 800;
    color: #d7ff32;
  }
`