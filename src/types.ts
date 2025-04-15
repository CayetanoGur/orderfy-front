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
  slug: string;
  name: string;
  image: string;
  logo: string;
  description: string;
  primary_color: string;
  secondary_color: string;
  q_branches: number;
  branches: Branch[];
}

export interface Branch {
  id: number;
  slug: string;
  name: string;
  address: string;
  image: string;
  ubication: string;
  types: MenuType[];
  orders: Order[]; // Add orders array to Branch
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
  price: number;
  description: string;
  image: string;
  in_stock: boolean;
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
  restaurantSlug: string;  // Add this line
}