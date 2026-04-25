export type ShirtSize = 'PP' | 'P' | 'M' | 'G' | 'GG'
export type GenderCategory = 'Masculino' | 'Feminino' | 'LGBTQIA+' | '60+'
export type RaceDistance = '1km' | '3km' | '5km' | '10km' | '21km'
export type Modalidade = 'Masculino' | 'Feminino' | 'Mista' | '60+' | 'PCD' | 'LGBTQIA+' 


export interface RaceKit {
  id: string
  raceName: string
  distance: RaceDistance
  price: number
  lot: number
  availableSlots: number
  soldSlots?: number // vagas já vendidas (para calcular % do lote)
  description: string
  img?: string
}

export interface CartItem {
  kit: RaceKit
  shirtSize: ShirtSize
  participantName: string
  participantEmail: string
  participantCpf: string
}

export interface Sponsor {
  id: string
  name: string
  logo: string
}
