export type Lang = 'en' | 'ps'

export type InviteCopy = {
  envelopeMessage: string
  partnerOne: string
  partnerTwo: string
  and: string
  subtitle: string
  dateLabel: string
  countdownTitle: string
  countdownMessage: string
  countdownDone: string
  days: string
  hours: string
  minutes: string
  seconds: string
  tapToOpen: string
  scrollToRsvp: string
  venueTitle: string
  venueName: string
  venueAddress: string
  getDirections: string
  openInMaps: string
  scheduleHeading: string
  schedule: { time: string; title: string; description: string }[]
  dressCode: string
  dressDetail: string
  suggestedColors: string
  colorLabels: string[]
  giftsTitle: string
  giftsMessage: string
  registryName: string
  bankLabel: string
  bankName: string
  menuTitle: string
  menu: { title: string; items: { name: string; description: string }[] }[]
  textBlockTitle: string
  textBlockBody: string
  galleryTitle: string
  gallerySubtitle: string
  faqTitle: string
  faq: { question: string; answer: string }[]
  accommodationHeading: string
  accommodationSubheading: string
  viewDetails: string
  hotels: { name: string; description: string; priceRange: string }[]
  rsvpHeading: string
  rsvpSubheading: string
  rsvpReplyBy: string
  rsvpThanks: string
  fullName: string
  fullNamePlaceholder: string
  phoneNumber: string
  phonePlaceholder: string
  willAttend: string
  attendYes: string
  attendNo: string
  guestsHeading: string
  male: string
  female: string
  total: string
  sendRsvp: string
  sending: string
  rsvpNotConnected: string
  rsvpNetworkError: string
  rsvpFailed: string
  somethingWentWrong: string
  langLabel: string
  muteMusic: string
  playMusic: string
}
