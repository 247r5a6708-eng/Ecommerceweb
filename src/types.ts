export interface PriceHistoryPoint {
  date: string;
  price: number;
}

export interface ToastType {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'error';
  action?: {
    label: string;
    onClick: () => void;
  };
}

// --- NEW COMMERCE DATA MODEL ---

// --- PHASE 3: PRODUCT IDENTITY ARCHITECTURE ---
export interface ProductFamily {
  id: string;
  brandId: string;
  name: string;
  description: string;
  categoryId: string;
}

export interface ProductModel {
  id: string;
  productId: string;
  name: string;
  releaseYear?: number;
}

export interface SKU {
  id: string;
  variantId: string;
  code: string;
}

export interface Seller {
  id: string;
  name: string;
  trustScore: number;
}

export interface InventoryItem {
  skuId: string;
  sellerId: string;
  quantity: number;
  condition: 'New' | 'Refurbished' | 'Used';
}

export interface PriceRecord {
  id: string;
  skuId: string;
  sellerId: string;
  amount: number;
  currency: string;
  timestamp: string;
}


export interface Brand {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  modelId?: string;
  variantId?: string;
  url: string;
  source?: string;
  altText?: string;
  width?: number;
  height?: number;
  verified: boolean;
  verificationStatus: 'verified' | 'rejected' | 'pending' | 'unavailable';
  imageHash?: string;
  createdAt: string;
}

export interface ProductSpecification {
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  inventoryCount: number;
  lowStockThreshold?: number;
  attributes: Record<string, string>; // e.g., { color: 'Red', size: 'M' }
  sizeGuideVideoUrl?: string;
  isPinnedInSuggestions?: boolean;
}

export interface Compatibility {
  id: string;
  sourceProductId: string;
  targetProductId: string;
  type: 'compatible' | 'incompatible' | 'unknown';
  notes?: string;
}

// Modifying existing Product interface to be backwards compatible but extensible

export interface StructuredWarranty {
  provider: string;
  startDate?: string;
  durationMonths: number;
  coverage: string[];
  exclusions: string[];
  status: 'Active' | 'Expired' | 'Pending';
}

export interface Product {
  brandId?: string;
  categoryId?: string;
  productId?: string;
  modelId?: string;
  variantId?: string;
  compatibility?: string;
  shipping?: string;
  structuredWarranty?: StructuredWarranty;
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
  inventoryCount?: number;
  lowStockThreshold?: number;
  sizeGuideVideoUrl?: string;
  isPinnedInSuggestions?: boolean;
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
  inStock?: boolean;
  
  // Phase 4 - Product Catalog Quality extensions
  sku?: string;
  specifications?: ProductSpecification[];
  dimensions?: string;
  weight?: string;
  materials?: string[];
  colors?: string[];
  returnPolicy?: string;
  availability?: string;
  inventory?: number;
  seller?: string;
  discount?: number;
  taxInfo?: string;
  shippingInfo?: string;
  images?: ProductImage[]; // Extended image gallery
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
}

export interface Review {
  id: string;
  userId?: string;
  isGiftWrapped?: boolean;
  giftMessage?: string;
  giftWrapFee?: number;
  discount?: number;
  author: string;
  rating: number;
  text: string;
  date: string;
  verifiedPurchase?: boolean;
  helpfulVotes?: number;
}

export interface Address {
  id?: string;
  isDefault?: boolean;
  fullName: string;
  email?: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface WishlistCollection {
  id: string;
  name: string;
  productIds: string[];
}

export interface UserProfileData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  isAdmin?: boolean;
  savedAddresses?: Address[];
  bodyMeasurements?: {
    height?: string;
    weight?: string;
    chest?: string;
    waist?: string;
    hips?: string;
  };
}

export interface WalletProduct {
  serialNumber?: string;
  invoiceUrl?: string;
  id: string;
  product: Product;
  purchaseDate: string;
  warrantyStatus: 'Active' | 'Expired';
  warrantyExpiry: string;
  status: 'In Use' | 'Needs Repair' | 'Ready for Trade-in';
}

export interface OrderItem extends CartItem {}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'refunded';
  address?: Address;
  paymentMethod?: string;
  expectedDelivery?: string;
  deliveryConfidence?: number; // percentage
  shipping?: number;
  tax?: number;
  subtotal?: number;
  userId?: string;
  isGiftWrapped?: boolean;
  giftMessage?: string;
  giftWrapFee?: number;
  discount?: number;
}

// Phase 21 - Returns
export interface ReturnRequest {
  id: string;
  orderId: string;
  itemId: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Picked up' | 'Refund processing' | 'Refunded' | 'Not eligible';
}

