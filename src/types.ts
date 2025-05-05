export interface Order {
  id: number;
  items: OrderItem[];
  total: number;
  status: string; // e.g., 'pending', 'completed'
}

export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Restaurant {
  id: number;
  name: string;
  description: string;
  image: string;
  logo: string;
  primary_color: string;
  secondary_color: string;
  slug: string;
  branches: Branch[];
}

export interface Branch {
  id: number;
  name: string;
  ubication: string;
  address: string;
  slug: string;
  image: string;
}

export interface Type {
  id: number;
  name: string;
  slug: string;
  image: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface MenuType {
  id: number;
  name: string;
  slug: string;
  image: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
  type?: string;
  category?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
  restaurantId: number;
  token: string;
  restaurantSlug: string;
}

// Additional interfaces for RestaurantDashboard
export interface RestaurantInfo {
  id: number;
  name: string;
  description: string;
  branches: Branch[];
  orders: Order[];
  image: string;
  logo: string;
  primary_color: string;
  secondary_color: string;
  slug: string;
}

export interface BranchInfo {
  id: number;
  name: string;
  ubication: string;
  slug: string;
  image: string;
}