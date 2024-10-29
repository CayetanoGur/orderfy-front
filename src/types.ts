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
  types: TypeOfCategory[];
}

export interface TypeOfCategory {
  id: number;
  name: string;
  slug: string;
  image: string;
}
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  in_stock: boolean;
}