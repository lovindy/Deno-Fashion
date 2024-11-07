export interface OrderItem {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  addressId: string;
}
