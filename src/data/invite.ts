export type InviteConfig = {
  envelopeMessage: string
  partnerOne: string
  partnerTwo: string
  dateLabel: string
  dateISO: string
  textColor: string
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
    bismillah: string
  }
  venue: {
    title: string
    name: string
    ballroom: string
    address: string
    mapsUrl: string
    imageUrl: string
  }
  schedule: {
    heading: string
    items: { time: string; title: string; description: string; icon: string }[]
  }
  rsvp: {
    heading: string
    subheading: string
    replyBy: string
  }
}

/** Real couple details — Abdul Rafi & Abeda Afzely */
export const invite: InviteConfig = {
  envelopeMessage: 'For Abdul Rafi And Abeda Afzely',
  partnerOne: 'Abdul Rafi',
  partnerTwo: 'Abeda Afzely',
  dateLabel: '27 NOVEMBER 2026',
  dateISO: '2026-11-27T19:00:00',
  textColor: '#0a0909',
  media: {
    openingVideo: '/media/opening.mp4',
    sealedPoster: '/media/sealed-poster.jpg',
    heroVideo: '/media/hero-loop.mp4',
    heroImage: '/media/hero-balcony.jpg?v=3',
    themeVideo: '/media/theme.mp4',
    themePoster: '/media/theme-poster.jpg',
    music: '/audio/background.mp3?v=3',
    bismillah: '/media/bismillah.webp?v=4',
  },
  venue: {
    title: 'The Venue',
    name: "Royal Albert's Palace",
    ballroom: 'Royal Grand Ballroom',
    address: '1050 King Georges Post Rd, Fords, NJ 08863',
    mapsUrl:
      'https://www.google.com/maps?gs_lcrp=EgZjaHJvbWUqBggAEEUYOzIGCAAQRRg70gEIMTM3MGowajeoAgCwAgA&um=1&ie=UTF-8&fb=1&gl=pk&sa=X&geocode=KbOaT7f8tcOJMWZk9q9bpI_e&daddr=1050+King+Georges+Post+Rd,+Fords,+NJ+08863,+United+States',
    imageUrl: '/media/venues/royal-alberts-palace.webp?v=4',
  },
  schedule: {
    heading: 'What we have planned for you',
    items: [
      {
        time: '7:00 PM',
        title: 'START',
        description: 'Welcome — doors open',
        icon: '/media/timeline-start.webp?v=2',
      },
      {
        time: '7:30 PM',
        title: 'APPETIZER',
        description: 'Appetizers begin',
        icon: '/media/timeline-appetizer.webp?v=2',
      },
      {
        time: '8:00 PM',
        title: 'CEREMONY',
        description: 'Ceremony starts',
        icon: '/media/timeline-ceremony.webp?v=2',
      },
      {
        time: '8:30 PM',
        title: 'ENTRY',
        description: 'Bride and groom entry',
        icon: '/media/timeline-entrance.webp?v=2',
      },
      {
        time: '10:00 PM',
        title: 'DINNER',
        description: 'Dinner is served',
        icon: '/media/timeline-dinner.webp?v=3',
      },
      {
        time: '2:00 AM',
        title: 'END',
        description: 'Celebration concludes',
        icon: '/media/timeline-end.webp?v=3',
      },
    ],
  },
  rsvp: {
    heading: 'RSVP',
    subheading: "We can't wait!",
    replyBy: 'Please reply by November 15th, 2026',
  },
}
