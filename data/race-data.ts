import type { RaceKit, Sponsor } from '@/types/race'

export const raceKits: RaceKit[] = [
  {
    id: 'desafio-silvetes-2027',
    raceName: 'Desafio Silvetes 2027',
    distance: 'virtual',
    price: 45.00,
    lot: 1,
    lotLabel: 'Etapa mensal',
    availableSlots: 100,
    soldSlots: 0,
    description: 'Desafio virtual de corrida e caminhada com 12 etapas mensais. Escolha uma meta de quilometragem e complete no seu ritmo. Valor mensal: R$ 45,00 + R$ 5,00 de taxa do site.',
    organizer: 'Grupo Silvetes',
    img: '/banner-silvetes-2027-1200x675.webp',
    gallery: [
      '/banner-silvetes-2027-1200x675.webp',
      '/medalha_800x1000.webp',
    ],
    containGalleryImages: ['/medalha_800x1000.webp'],
    includesShirt: false,
    kitOptions: [
      {
        id: 'desafio-silvetes-2027-etapa-mensal',
        label: 'Etapa mensal',
        price: 45.00,
        includesShirt: false,
        siteFee: 5.00,
        lot: 1,
        availableSlots: 100,
        soldSlots: 0,
      },
    ],
    documents: [
      { label: 'Regulamento oficial 2027', href: '/pdfs/regulamento-desafio-silvetes-2027.pdf' },
    ],
  },
]

export const sponsors: Sponsor[] = [
  { id: '1', name: 'Nike', logo: '/sponsors/nike.svg' },
  { id: '2', name: 'Adidas', logo: '/sponsors/adidas.svg' },
  { id: '3', name: 'Gatorade', logo: '/sponsors/gatorade.svg' },
  { id: '4', name: 'Red Bull', logo: '/sponsors/redbull.svg' },
  { id: '5', name: 'Under Armour', logo: '/sponsors/underarmour.svg' }
]

export const eventInfo = {
  name: '',
  tagline: '',
  date: '',
  time: '',
  location: {
    name: '',
    address: '',
    city: '',
    coordinates: { lat: -23.5874, lng: -46.6576 }
  },
  kitPickup: {
    name: '',
    address: '',
    city: '',
    dates: '',
    time: ''
  },
  contact: {
    email: '1kmzinhocorrida@gmail.com',
    phone: '(91) 996256899',
    instagram: '@1kmzinho',
    facebook: '/1kmzinho',
    whatsapp: '5591996256899'
  }
}
