export type DietaryType = 'veg' | 'non-veg' | 'vegan' | 'egg';

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  dietary: DietaryType;
  isBestseller?: boolean;
  isAvailable: boolean; // Sold out state
  spicyLevel?: 0 | 1 | 2 | 3;
  preparationTimeMinutes?: number;
  tags?: string[];
}

export interface MenuCategory {
  id: string;
  name: string;
  icon?: string;
  order: number;
  description?: string;
}

export interface OperatingHours {
  openingTime: string; // e.g. "08:30 AM"
  closingTime: string; // e.g. "11:00 PM"
  daysDescription: string; // e.g. "Monday - Sunday"
  isOpenOverride?: boolean | null;
}

export interface CafeContact {
  phone: string;
  whatsappNumber: string; // E.164 without '+' or standard format e.g. "919876543210"
  address: string;
  googleMapsUrl: string;
  instagramUrl?: string;
  wifiName?: string;
  wifiPassword?: string;
}

export interface CafeTheme {
  primaryColor: string; // HSL or hex
  accentColor: string;
  fontFamily: string;
  borderRadius: string;
  isDarkByDefault?: boolean;
}

export interface CafeConfig {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  logoUrl: string;
  heroImageUrl: string;
  theme: CafeTheme;
  contact: CafeContact;
  hours: OperatingHours;
  currencySymbol: string;
  currencyCode: string;
  enabledModules: {
    whatsappOrdering: boolean;
    tableBookings: boolean;
    loyaltyCard: boolean;
    gallery: boolean;
    wifiDetails: boolean;
  };
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  selectedOptions?: string[];
  itemNotes?: string;
}

export interface TableBookingRequest {
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  guestCount: number;
  specialNotes?: string;
}

export interface BookingRecord extends TableBookingRequest {
  id: string;
  status: 'pending' | 'confirmed' | 'declined';
  createdAt: number;
}

export interface PlacedOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  itemNotes?: string;
}

export interface PlacedOrder {
  id: string;
  verificationCode: string;
  tableNumber: string;
  customerName?: string;
  items: PlacedOrderItem[];
  totalItemsCount: number;
  subtotal: number;
  status: 'received' | 'preparing' | 'completed' | 'cancelled';
  createdAt: number;
}

