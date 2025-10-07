
export class CartItem {
  productId?: string;
  productName?: string;
  productPrice?: number = 0;
  quantity: number = 0;
  subTotal: number = 0;
}

export class Cart {
  id?: string;
  userId?: string;
  items: CartItem[] = [];
}
