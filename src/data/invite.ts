export type InviteConfig = {
  envelopeMessage: string
  partnerOne: string
  partnerTwo: string
  subtitle: string
  dateLabel: string
  dateISO: string
  textColor: string
  subtitleColor: string
  countdownMessage: string
  media: {
    openingVideo: string
    sealedPoster: string
    /** Looping scenic balcony (birds, ripples, clouds) after open */
    heroVideo: string
    /** Poster / fallback still for the hero loop */
    heroImage: string
    themeVideo: string
    themePoster: string
    music: string
  }
  venue: {
    title: string
    name: string
    address: string
    mapsUrl: string
    imageUrl: string
  }
  schedule: {
    heading: string
    items: { time: string; title: string; description: string; icon: string }[]
  }
  dressCode: {
    code: string
    detail: string
    colors: { label: string; hex: string }[]
    imageUrl: string
  }
  gifts: {
    message: string
    registryName: string
    registryUrl: string
    bankLabel: string
    bankName: string
  }
  menu: { title: string; items: { name: string; description: string }[] }[]
  textBlock: { title: string; text: string }
  gallery: { title: string; subtitle: string; images: string[] }
  faq: { question: string; answer: string }[]
  accommodation: {
    heading: string
    subheading: string
    hotels: {
      name: string
      description: string
      priceRange: string
      url: string
      imageUrl: string
    }[]
  }
  rsvp: {
    heading: string
    subheading: string
    replyBy: string
  }
}

/** Real couple details — Abdul Rafi & Abida */
export const invite: InviteConfig = {
  envelopeMessage: 'For Abdul Rafi and Abida',
  partnerOne: 'abdul rafi',
  partnerTwo: 'abida',
  subtitle: 'He asked, she said yes',
  dateLabel: '27 NOVEMBER 2026',
  dateISO: '2026-11-27T14:00:00',
  textColor: '#0a0909',
  subtitleColor: '#930202',
  countdownMessage: "We can't wait for  this moment!",
  media: {
    openingVideo: '/media/opening.mp4',
    sealedPoster: '/media/sealed-poster.jpg',
    heroVideo: '/media/hero-loop.mp4',
    heroImage: '/media/hero-balcony.jpg?v=3',
    themeVideo: '/media/theme.mp4',
    themePoster: '/media/theme-poster.jpg',
    music: '/audio/romantic-piano.mp3',
  },
  venue: {
    title: 'The Venue',
    name: "Royal Albert's Palace",
    address: "1050 King Georges Post Rd, Fords, NJ 08863",
    mapsUrl:
      'https://www.google.com/maps?gs_lcrp=EgZjaHJvbWUqBggAEEUYOzIGCAAQRRg70gEIMTM3MGowajeoAgCwAgA&um=1&ie=UTF-8&fb=1&gl=pk&sa=X&geocode=KbOaT7f8tcOJMWZk9q9bpI_e&daddr=1050+King+Georges+Post+Rd,+Fords,+NJ+08863,+United+States',
    imageUrl: '/media/venues/royal-alberts-palace.png',
  },
  schedule: {
    heading: 'What have planned for you',
    items: [
      {
        time: '14:00',
        title: 'START',
        description: 'We looking forward welcoming everybody with a drink',
        icon: '/media/timeline-sparklers.png',
      },
      {
        time: '15:00',
        title: 'LUNCH',
        description: 'Surprise lunch',
        icon: '/media/timeline-cocktail.png',
      },
      {
        time: '17:00',
        title: 'PARTY',
        description: 'Let yourself go',
        icon: '/media/timeline-champagne.png',
      },
      {
        time: '02:00',
        title: 'END',
        description: 'All good things come to and end !',
        icon: '/media/timeline-car.png',
      },
    ],
  },
  dressCode: {
    code: 'Casual Attire',
    detail: 'Casual Pool wear',
    colors: [
      { label: 'Taupe', hex: '#c9b8a4' },
      { label: 'White', hex: '#ffffff' },
      { label: 'Lavender', hex: '#b8a9c9' },
      { label: 'Rose Gold', hex: '#e8cfc0' },
      { label: 'Dusty', hex: '#837ef5' },
    ],
    imageUrl: '/media/dresscode.png',
  },
  gifts: {
    message:
      'Your presence is your gift, but all contributions can go to the bank details below\nThank you',
    registryName: 'amazon',
    registryUrl: 'https://www.amazon.com',
    bankLabel: 'Prefer to contribute directly?',
    bankName: 'KBC',
  },
  menu: [
    {
      title: 'Starter',
      items: [
        {
          name: 'Burrata & Heirloom Heirloom Medley',
          description: 'Creamy Italian burrata paired with sun-ripened heirloom tomatoes',
        },
      ],
    },
    {
      title: 'Main',
      items: [
        {
          name: 'Miso-Glazed Beef Tenderloin',
          description:
            'rime cut beef tenderloin, pan-seared and served over a silky parsnip purée.',
        },
      ],
    },
    {
      title: 'desserts',
      items: [
        {
          name: 'Velvet White Chocolate & Raspberry Mousse',
          description: 'A light-ase-air white chocolate dome',
        },
      ],
    },
  ],
  textBlock: {
    title: 'Why This Is Special',
    text: "I wanted to create something a little different this year—something more personal than just a card. Inside, you'll find a collection of memories, surprises, and little moments that made me think of you.",
  },
  gallery: {
    title: 'Photo Gallery',
    subtitle: 'Moments we treasure',
    images: ['/media/gallery/1.jpg'],
  },
  faq: [
    {
      question: 'Can I bring a plus one?',
      answer:
        'By pressing your name in the rsvp, this will show if you can bring a plus one or not.',
    },
    {
      question: 'Can I bring my my parents?',
      answer: 'yes, you can bring them aswell , add them in the rsvp',
    },
    { question: 'Can I bring my Child', answer: 'Heeeeell Nooo' },
  ],
  accommodation: {
    heading: 'Accommodation',
    subheading: 'Recommendations for your stay',
    hotels: [
      {
        name: 'Lova',
        description: 'You can book directly with the link below for a discount',
        priceRange: '410 $',
        url: 'https://www.booking.com',
        imageUrl: '/media/hotels/lova.png',
      },
      {
        name: 'Hotel Subtile',
        description: 'You can book directly with the link below for a discount',
        priceRange: '300$',
        url: 'https://www.booking.com',
        imageUrl: '/media/hotels/subtile.png',
      },
    ],
  },
  rsvp: {
    heading: 'RSVP',
    subheading: "We can't wait!",
    replyBy: 'Please reply by November 10th, 2026',
  },
}
