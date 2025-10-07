import { CartItem } from "./cart-item";

export interface Order {
    userId: string;
    items: CartItem[];
    totalPrice: number;
}
