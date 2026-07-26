import type { RaceKit, Sponsor } from '@/types/race'

export const raceKits: RaceKit[] = [
  /* {
    id: '1km-lote1',
    raceName: '1kmzinho Kids',
    distance: '1km',
    price: 50.00,
    lot: 1,
    availableSlots: 100,
    soldSlots: 25,
    description: 'Corrida especial para crianças de 5 a 10 anos',
    img: "/teste.png"
  }, */
  // {
  //   id: '3km-lote1',
  //   raceName: 'Desafio 3K',
  //   distance: '3km',
  //   price: 79.90,
  //   lot: 1,
  //   availableSlots: 200,
  //   soldSlots: 150,
  //   description: 'Ideal para iniciantes e caminhada',
  //   img: "/banner2.png"
  // },
  // {
  //   id: '5km-lote1',
  //   raceName: 'Circuito 5K',
  //   distance: '5km',
  //   price: 99.90,
  //   lot: 1,
  //   availableSlots: 300,
  //   soldSlots: 280,
  //   description: 'Percurso intermediário para todos os níveis',
  //   img: "/banner3.png"
  // },
  {
    id: 'juntos-rumo-ao-ceu',
    raceName: 'Juntos Rumo ao Céu',
    distance: '5km',
    price: 80.00,
    lot: 1,
    availableSlots: 300,
    soldSlots: 0,
    description: '27/09/2026 às 6:00 • Percurso de 5 km • Corrida de Rua • Corrida + Taxa do site 5R$',
    img: "/superacao.png",
    kitColors: [
      { color: '#6B21A8', name: 'Roxo' },
    ],
    kitOptions: [
      {
        id: 'juntos-rumo-ao-ceu-kit-completo',
        label: 'Kit Completo',
        price: 80.00,
        siteFee: 5.00,
        lot: 1,
        availableSlots: 300,
        soldSlots: 0,
      },
      {
        id: 'juntos-rumo-ao-ceu-kit-simples',
        label: 'Kit Simples',
        price: 55.00,
        siteFee: 5.00,
        lot: 2,
        availableSlots: 300,
        soldSlots: 0,
      },
    ],
    documents: [
      { label: 'Regulamento da corrida', href: '/pdfs/regulamento_juntos_rumo_ao_ceu.pdf' }
    ],
  },
  /* {
    id: '21km-lote1',
    raceName: 'Meia Maratona',
    distance: '21km',
    price: 0.50,
    lot: 1,
    availableSlots: 100,
    soldSlots: 60,
    description: 'O desafio dos verdadeiros atletas',
    img: "/banner.png",
    kitColors: [
      { color: '#d7ff32', name: 'Amarelo neon' },
      { color: '#ffffff', name: 'Branca' },
      { color: '#081638', name: 'Azul marinho' },
    ],
    documents: [
      { label: 'Regulamento da corrida', href: '/pdfs/meia-maratona-regulamento.pdf' },
      { label: 'Informações dos kits', href: '/pdfs/meia-maratona-kits.pdf' },
      { label: 'Como retirar o kit', href: '/pdfs/meia-maratona-retirada.pdf' },
    ],
  }, */
  /* {
    id: 'teste-compra-lote1',
    raceName: 'Teste de Compra',
    distance: '5km',
    price: 1,
    lot: 1,
    availableSlots: 50,
    soldSlots: 0,
    description: 'Card de teste para validar compras no Mercado Pago',
    img: "/bannerManosManas.png",
    kitColors: [
      { color: '#000000', name: 'Preto' },
      { color: '#ff6b6b', name: 'Vermelho' },
      { color: '#4ecdc4', name: 'Azul' },
      { color: '#9b59b6', name: 'Roxo' },
    ],
    documents: [
      { label: 'Regulamento da corrida', href: '/pdfs/teste-compra-regulamento.pdf' },
      { label: 'Informações dos kits', href: '/pdfs/teste-compra-kits.pdf' },
      { label: 'Como retirar o kit', href: '/pdfs/teste-compra-retirada.pdf' },
    ],
  } */
]

export const sponsors: Sponsor[] = [
  { id: '1', name: 'Nike', logo: '/sponsors/nike.svg' },
  { id: '2', name: 'Adidas', logo: '/sponsors/adidas.svg' },
  { id: '3', name: 'Gatorade', logo: '/sponsors/gatorade.svg' },
  { id: '4', name: 'Red Bull', logo: '/sponsors/redbull.svg' },
  { id: '5', name: 'Under Armour', logo: '/sponsors/underarmour.svg' }
]

export const eventInfo = {
  name: 'Juntos Rumo ao Céu',
  tagline: 'Corrida de Rua',
  date: '27 de setembro de 2026',
  time: '06:00',
  location: {
    name: 'Proximo ao IML - Mangueirão',
    address: 'Alameda Pedroso, 46 B - mangueirão - Ref.  IML  - Entre Av. mangueirão/Av. centenário',
    city: 'Belém - PA',
    coordinates: { lat: -23.5874, lng: -46.6576 }
  },
  kitPickup: {
    name: 'Juntos Rumo ao Céu',
    address: 'A definir',
    city: 'Belém - PA',
    dates: 'A definir',
    time: 'A definir'
  },
  contact: {
    email: '1kmzinhocorrida@gmail.com',
    phone: '(91) 996256899',
    instagram: '@1kmzinho',
    facebook: '/1kmzinho',
    whatsapp: '5591996256899'
  }
}
