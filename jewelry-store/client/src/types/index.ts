export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  totalPrice: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  fullName: string;
  phone: string;
  address: string;
  postalCode: string;
  createdAt: string;
  user?: { name: string; email: string };
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    product: { title: string; imageUrl: string };
  }[];
}