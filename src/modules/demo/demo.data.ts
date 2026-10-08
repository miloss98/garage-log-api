import { FuelType, SRType } from '../../generated/prisma/enums'

// Demo data is described relative to "today", so every new demo account
// gets a believable mix of overdue / due soon / OK items and a year of costs.
const DAY = 24 * 60 * 60 * 1000

function daysFromToday(days: number) {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  return new Date(today.getTime() + days * DAY)
}
const ago = (days: number) => daysFromToday(-days)
const inDays = (days: number) => daysFromToday(days)

// Shared demo photos: uploaded ONCE to our UploadThing storage and reused by
// every demo account (each demo car only stores the URL). Never delete these
// files when cleaning up demo accounts.
// Photos from Unsplash (free licence, no attribution required - credited anyway):
//   Golf 7: Martin Katler (unsplash.com/photos/1iVJkBGy6OY)
//   Yaris:  lens zone     (unsplash.com/photos/DjLraiQJ9js)
//   MX-5:   Michał Robak  (unsplash.com/photos/GyZSMud-hQY)
export const DEMO_PHOTOS = {
  golf: 'https://vt4gmqxxsp.ufs.sh/f/IRqQ1fMRyDjrlJsdXPAE3POjxMAzm5WZfocYSND6FkTb92tQ',
  yaris: 'https://vt4gmqxxsp.ufs.sh/f/IRqQ1fMRyDjrVKprJEbRw0UmHeEixrtq6kQ4Wczous2hAYXK',
  mx5: 'https://vt4gmqxxsp.ufs.sh/f/IRqQ1fMRyDjr9ZXJ37fHyXhVm0dUt4bLukBZvMsNwRgYjnzQ',
}

export function buildDemoCars() {
  return [
    {
      name: 'Golf 7',
      model: 'Volkswagen Golf 2.0 TDI',
      year: 2016,
      color: 'Lapiz Blue',
      image_url: DEMO_PHOTOS.golf,
      licence_plate: 'BG 123-AB',
      fuel_type: FuelType.DIESEL,
      mileage: 187_400,
      service_records: {
        create: [
          // Due soon by mileage: only 600 km left
          { type: SRType.OIL_CHANGE, title: 'Castrol Edge 5W-30', service_date: ago(340), mileage_at_service: 173_000, next_service_date: inDays(25), next_service_mileage: 188_000, cost: 95, workshop: 'Bosch Car Service' },
          { type: SRType.OIL_CHANGE, title: 'Castrol Edge 5W-30', service_date: ago(700), mileage_at_service: 158_500, next_service_date: ago(335), next_service_mileage: 173_500, cost: 89, workshop: 'Bosch Car Service' },
          { type: SRType.BIG_SERVICE, title: 'Timing belt + water pump', service_date: ago(420), mileage_at_service: 170_100, next_service_date: inDays(1405), next_service_mileage: 260_100, cost: 640, workshop: 'Bosch Car Service' },
          { type: SRType.BRAKES, title: 'Front pads and discs', service_date: ago(200), mileage_at_service: 181_000, cost: 285, workshop: 'Bosch Car Service' },
          // Due soon: seasonal tyre swap
          { type: SRType.TIRE_CHANGE, title: 'Summer tyres on', service_date: ago(160), mileage_at_service: 183_200, next_service_date: inDays(23), cost: 40, workshop: 'Vulco Tyres' },
          // Overdue
          { type: SRType.REGISTRATION, service_date: ago(380), next_service_date: ago(15), cost: 310 },
          { type: SRType.INSURANCE, service_date: ago(200), next_service_date: inDays(165), cost: 420 },
          { type: SRType.REPAIR, title: 'Rust repair - rear wheel arch', service_date: ago(90), mileage_at_service: 186_100, cost: 180, workshop: 'AutoBody Studio', notes: 'Treated and repainted, 2 year warranty.' },
        ],
      },
    },
    {
      name: 'Daily Yaris',
      model: 'Toyota Yaris 1.5 Sedan',
      year: 2017,
      color: 'White',
      image_url: DEMO_PHOTOS.yaris,
      licence_plate: 'NS 456-CD',
      fuel_type: FuelType.PETROL,
      mileage: 64_200,
      service_records: {
        create: [
          { type: SRType.SMALL_SERVICE, service_date: ago(120), mileage_at_service: 58_900, next_service_date: inDays(245), next_service_mileage: 73_900, cost: 165, workshop: 'Toyota Service Centre' },
          { type: SRType.SMALL_SERVICE, service_date: ago(485), mileage_at_service: 45_200, next_service_date: ago(120), next_service_mileage: 60_200, cost: 150, workshop: 'Toyota Service Centre' },
          { type: SRType.BATTERY, service_date: ago(250), cost: 130, workshop: 'Toyota Service Centre' },
          { type: SRType.INSPECTION, service_date: ago(30), next_service_date: inDays(335), cost: 45 },
          { type: SRType.REGISTRATION, service_date: ago(30), next_service_date: inDays(335), cost: 260 },
          { type: SRType.INSURANCE, service_date: ago(300), next_service_date: inDays(65), cost: 350 },
        ],
      },
    },
    {
      name: 'Weekend MX-5',
      model: 'Mazda MX-5 NA 1.6',
      year: 1992,
      color: 'Red',
      image_url: DEMO_PHOTOS.mx5,
      licence_plate: 'BG 789-EF',
      fuel_type: FuelType.PETROL,
      mileage: 143_800,
      service_records: {
        create: [
          { type: SRType.OIL_CHANGE, service_date: ago(60), mileage_at_service: 143_100, next_service_date: inDays(305), next_service_mileage: 148_100, cost: 70, workshop: 'Classic Garage' },
          { type: SRType.REPAIR, title: 'Soft top replacement', service_date: ago(220), cost: 520, workshop: 'Classic Garage' },
          { type: SRType.TIRE_CHANGE, title: 'New Yokohama tyres', service_date: ago(190), mileage_at_service: 142_300, cost: 380, workshop: 'Vulco Tyres' },
          { type: SRType.OTHER, title: 'Detailing and paint correction', service_date: ago(45), cost: 230, workshop: 'Shine Detailing' },
          { type: SRType.REGISTRATION, service_date: ago(10), next_service_date: inDays(355), cost: 190 },
        ],
      },
    },
  ]
}
