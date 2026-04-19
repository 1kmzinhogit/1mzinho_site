import type { RaceKit, Sponsor } from '@/types/race'

export const raceKits: RaceKit[] = [
  {
    id: '1km-lote1',
    raceName: '1kmzinho Kids',
    distance: '1km',
    price: 49.90,
    lot: 1,
    availableSlots: 100,
    description: 'Corrida especial para crianças de 5 a 10 anos'
  },
  {
    id: '3km-lote1',
    raceName: 'Desafio 3K',
    distance: '3km',
    price: 79.90,
    lot: 1,
    availableSlots: 200,
    description: 'Ideal para iniciantes e caminhada'
  },
  {
    id: '5km-lote1',
    raceName: 'Circuito 5K',
    distance: '5km',
    price: 99.90,
    lot: 1,
    availableSlots: 300,
    description: 'Percurso intermediário para todos os níveis'
  },
  {
    id: '10km-lote1',
    raceName: 'Maratona 10K',
    distance: '10km',
    price: 129.90,
    lot: 1,
    availableSlots: 150,
    description: 'Para corredores experientes'
  },
  {
    id: '21km-lote1',
    raceName: 'Meia Maratona',
    distance: '21km',
    price: 189.90,
    lot: 1,
    availableSlots: 100,
    description: 'O desafio dos verdadeiros atletas'
  }
]

export const sponsors: Sponsor[] = [
  { id: '1', name: 'Nike', logo: '/sponsors/nike.svg' },
  { id: '2', name: 'Adidas', logo: '/sponsors/adidas.svg' },
  { id: '3', name: 'Gatorade', logo: '/sponsors/gatorade.svg' },
  { id: '4', name: 'Red Bull', logo: '/sponsors/redbull.svg' },
  { id: '5', name: 'Under Armour', logo: '/sponsors/underarmour.svg' }
]

export const eventInfo = {
  name: '1kmzinho',
  tagline: 'Corrida de Rua',
  date: '15 de Junho de 2026',
  time: '07:00',
  location: {
    name: 'Parque Ibirapuera',
    address: 'Av. Pedro Álvares Cabral, s/n - Vila Mariana',
    city: 'São Paulo - SP',
    coordinates: { lat: -23.5874, lng: -46.6576 }
  },
  kitPickup: {
    name: 'Arena 1kmzinho',
    address: 'Av. Pedro Álvares Cabral, 1234 - Portão 3',
    city: 'São Paulo - SP',
    dates: '12 a 14 de Junho de 2026',
    time: '10:00 às 20:00'
  },
  contact: {
    email: 'contato@1kmzinho.com.br',
    phone: '(11) 99999-9999',
    instagram: '@1kmzinho',
    facebook: '/1kmzinho',
    whatsapp: '5511999999999'
  }
}
