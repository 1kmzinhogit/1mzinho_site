export type ShirtSize = 'PP' | 'P' | 'M' | 'G' | 'GG'
export type GenderCategory = 'Masculino' | 'Feminino' | 'LGBTQIA+' | '60+' | 'PCD'
export type RaceDistance = '1km' | '3km' | '5km' | '10km' | '21km'
export type Modalidade = 'Masculino' | 'Feminino' | 'Mista' | '60+' | 'PCD' | 'LGBTQIA+' 

export interface KitColor {
  color: string
  name: string
}

export interface KitOption {
  id: string
  label: string
  price: number
  includesShirt?: boolean
  siteFee?: number
  lot: number
  availableSlots: number
  soldSlots?: number
}

export interface RaceDocument {
  label: string
  href: string
}

export interface RaceKit {
  id: string
  raceName: string
  distance: RaceDistance
  price: number
  lot: number
  lotLabel?: string
  availableSlots: number
  soldSlots?: number // vagas já vendidas (para calcular % do lote)
  description: string
  organizer?: string
  organizerTeam?: string
  img?: string
  shareImg?: string
  shareVersion?: number
  kitColors?: KitColor[]
  kitOptions?: KitOption[]
  documents?: RaceDocument[]
  // dataNascimento: string
}

export interface CartItem {
  kit: RaceKit
  shirtSize: ShirtSize
  participantName: string
  participantEmail: string
  participantCpf: string
  participantDataNascimento: string
}

export interface Sponsor {
  id: string
  name: string
  logo: string
}
