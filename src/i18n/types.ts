export type Lang = 'en' | 'ps'

export type InviteCopy = {
  envelopeMessage: string
  /** Four centered lines above the sealed ribbon */
  envelopeLines: [string, string, string, string]
  /** Label on the sealed ribbon */
  ribbonLabel: string
  partnerOne: string
  partnerTwo: string
  and: string
  sonOf: string
  daughterOf: string
  fatherOne: string
  fatherTwo: string
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
  venueBallroom: string
  venueAddress: string
  getDirections: string
  openInMaps: string
  scheduleHeading: string
  schedule: { time: string; title: string; description: string }[]
  prohibitedTitle: string
  prohibitedNoPhotosTitle: string
  prohibitedNoPhotosBody: string
  prohibitedPrivacy: string
  prohibitedNoChildren: string
  contactsHeading: string
  contactsSubheading: string
  contacts: { name: string; phone: string; tel: string }[]
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
  sendRsvp: string
  sending: string
  rsvpNotConnected: string
  rsvpNetworkError: string
  rsvpFailed: string
  somethingWentWrong: string
  langLabel: string
  muteMusic: string
  playMusic: string
  navAria: string
  navHome: string
  navVenue: string
  navSchedule: string
  navContacts: string
  navRsvp: string
}
