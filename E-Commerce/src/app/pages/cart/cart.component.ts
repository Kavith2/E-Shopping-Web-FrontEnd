import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Cart, CartItem } from 'src/app/models/cart-item';
import { Products } from 'src/app/models/products';
import { RemoveFromCartRequest } from 'src/app/models/remove-from-cart-request';
import { UpdateQuantityRequest } from 'src/app/models/update-quantity-request';
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
              private authService: AuthService,
              private router:Router) {}

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

updateQuantity(productId: string, quantity: number) {
  const item = this.cartItems.find(i => i.productId === productId);
  if (!item || !this.userId) return;

  console.log('Updating quantity for productId:', productId, 'to', quantity);
  item.quantity = quantity;
  item.subTotal = item.quantity * item.productPrice!;

  const request: UpdateQuantityRequest = {
    UserId: this.userId,
    Quantity: quantity
  };

  this.cartService.updateQuantity(productId, request)
    .subscribe({
      next: () => {
        this.loadCart();
      },
      error: (err) => console.error('Failed to update quantity', err)
    });
}


goToCheckout(): void {
  this.router.navigate(['/checkout']);
}

getTotal(): number {
  return this.cartItems.reduce((sum, item) => sum + (item.productPrice || 0) * item.quantity, 0);
}


}
