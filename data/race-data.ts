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
    description: '📋 Visão Geral\n\n· 12 meses | 12 desafios | 12 conquistas — organização: Grupo Silvetes\n· Período: todo o ano de 2027\n· Aberto a integrantes do grupo e participantes externos, de qualquer cidade/estado\n· Caráter participativo e motivacional (não é competição entre pessoas)',
    organizer: 'Grupo Silvetes',
    img: '/images/races/banner-silvetes-2027-1200x675.webp',
    shareImg: '/images/races/Silvete_Generated_NOVO.jpg',
    shareVersion: 3,
    gallery: [
      '/images/races/Silvete_Generated_NOVO.jpg',
      '/images/medals/medalha_800x1000.webp',
    ],
    containGalleryImages: ['/images/medals/medalha_800x1000.webp'],
    includesShirt: false,
    kitOptions: [
      { id: 'desafio-silvetes-2027-25-km', label: '25 km', price: 50.00, includesShirt: false, siteFee: 0, lot: 1, availableSlots: 100, soldSlots: 0 },
      { id: 'desafio-silvetes-2027-50-km', label: '50 km', price: 50.00, includesShirt: false, siteFee: 0, lot: 1, availableSlots: 100, soldSlots: 0 },
      { id: 'desafio-silvetes-2027-100-km', label: '100 km', price: 50.00, includesShirt: false, siteFee: 0, lot: 1, availableSlots: 100, soldSlots: 0 },
      { id: 'desafio-silvetes-2027-150-km', label: '150 km', price: 50.00, includesShirt: false, siteFee: 0, lot: 1, availableSlots: 100, soldSlots: 0 },
      { id: 'desafio-silvetes-2027-200-km', label: '200 km', price: 50.00, includesShirt: false, siteFee: 0, lot: 1, availableSlots: 100, soldSlots: 0 },
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
  contact: {
    email: '1kmzinhocorrida@gmail.com',
    phone: '(91) 996256899',
    instagram: '@1kmzinho',
    facebook: '/1kmzinho',
    whatsapp: '5591996256899'
  }
}
