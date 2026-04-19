export type ShirtSize = 'P' | 'M' | 'G'

export interface RaceKit {
  id: string
  raceName: string
  distance: string
  price: number
  lot: number
  availableSlots: number
  description: string
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
