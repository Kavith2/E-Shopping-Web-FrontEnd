import { Component } from '@angular/core';
import { Cart, CartItem } from 'src/app/models/cart-item';
import { Products } from 'src/app/models/products';
import { RemoveFromCartRequest } from 'src/app/models/remove-from-cart-request';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent {
    cartItems: CartItem[] = [];
    Products: Products[] = [];
    productName: string = '';
    userId : string | null = null;

  constructor(private cartService: CartService,
              private authService: AuthService,) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    if (!this.userId) {
      console.error('User not authenticated or token missing');
      return;
    }
    this.loadCart();
    
  }


loadCart(): void {
  if (!this.userId) return;

  this.cartService.getCartByUserId(this.userId).subscribe({
    next: (cart) => {
      this.cartItems = cart?.items || [];
    },
    error: (error) => {
      console.error('Error loading cart items', error);
    }
  });
}



  removeItem(productId: string): void {
     if (!this.userId) return;
    const request: RemoveFromCartRequest = {
      UserId: this.userId,
      ProductId: productId
    };
    this.cartService.removeFromCart(request).subscribe(() => {
      this.loadCart();
    });
  }

  updateQuantity(productId: string, quantity: number): void {
  const item = this.cartItems.find(i => i.productId === productId);
  if (item) item.quantity = quantity;
}

getTotal(): number {
  return this.cartItems.reduce((sum, item) => sum + (item.productPrice || 0) * item.quantity, 0);
}


}
