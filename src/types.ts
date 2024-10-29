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
  branches: Branch[]; // Add branches array to Restaurant
  // other fields if necessary
}

export interface Branch {
  id: number;
  slug: string;
  name: string;
  address: string;
  image: string;
  ubication: string; // add ubication here if needed
  // other fields as per JSON, like created, updated if necessary
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