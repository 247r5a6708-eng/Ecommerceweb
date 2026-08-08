export interface PriceHistoryPoint {
  date: string;
  price: number;
}

export interface ToastType {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  variant: string;
  description: string;
  price: number;
  category: string;
  type: string;
  image: string;
  rating: number;
  priceHistory?: PriceHistoryPoint[];
  trustScore?: number;
  repairabilityScore?: number;
  sustainabilityGrade?: 'A' | 'B' | 'C' | 'D' | 'F';
  warrantyInfo?: string;
  aiSummary?: string;
  sizes?: string[];
  selectedSize?: string;
  fitDetails?: string;
  sizeGuide?: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

export interface Address {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface UserProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
}

export interface WalletProduct {
  id: string;
  product: Product;
  purchaseDate: string;
  warrantyStatus: 'Active' | 'Expired';
  warrantyExpiry: string;
  serialNumber: string;
  status: 'In Use' | 'Needs Repair' | 'Ready for Trade-in';
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  address?: Address;
  paymentMethod?: string;
  expectedDelivery?: string;
  deliveryConfidence?: number; // percentage
}

