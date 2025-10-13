export interface Product {
  id: number;
  sku: string;
  title: string;
  price: number;
  stock: number;
  updatedAt: string;
}

export interface ProductItem {
  productId: number;
  qty: number;
  price: number;
  title: string;
}

export interface Order {
  id: number;
  customerName: string;
  status: 'new' | 'paid' | 'shipped' | 'cancelled';
  products: ProductItem[];
  total: number;
  createdAt: string;
}

export interface OrderState {
  orders: Order[];
  products: Product[];
  selectedOrder: Order | null;
  loading: boolean;
  error: string | null;
  filters: {
    client?: string;
    status?: string;
    sort?: 'date' | 'total';
    page: number;
    pageSize: number;
  };
}
