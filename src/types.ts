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
}

export interface Branch {
  id: number;
  slug: string;
  name: string;
  address: string;
  image: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}