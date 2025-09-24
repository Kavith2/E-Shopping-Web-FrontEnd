import { Component } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cart, CartItem } from '../models/cart-item';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { Order } from '../models/order';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent {
  checkoutForm: FormGroup;
  CartItem: CartItem[] = [];
  cart: Cart = new Cart();
  orderPlaced: boolean = false;
  userId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private authService: AuthService

  ) {
    this.checkoutForm = this.fb.group({
      address: ['', [Validators.required]],
      email: ['', Validators.required],
      name: ['', Validators.required],
      cvv: ['', Validators.required],
      expirationDate: ['', Validators.required],
      cardNumber: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    if (!this.userId) {
      console.error('User not authenticated or token missing');
      return;
    }
    this.loadCartitems();

    this.cartService.getCartByUserId(this.userId!).subscribe(cart => {
      this.cart = cart;   // now cart.items has actual products
    });



  }

  loadCartitems() {
    this.cartService.getCartByUserId(this.userId!).subscribe({
      next: (cart) => {
        this.CartItem = cart.items;
      },
      error: (err) => {
        console.error('Error loading cart items', err);
      }
    });
  }

  checkoutPrice(): number {
    return this.CartItem.reduce((sum, item) => sum + (item.productPrice || 0) * item.quantity, 0);
  }

  placeOrder() {
    if (!this.cart.items.length) {
      alert("Cart is empty!");
      return;
    }
    const order = {
      userId: this.userId!,
      items: this.cart.items,
      totalPrice: this.checkoutPrice()
    };

    console.log('Placing order:', order);

    this.cartService.saveOrder(order).subscribe({
      next: () => {
        this.cart.items = [];
        this.checkoutForm.reset();
        alert('Order placed successfully!');
        this.orderPlaced = true; 
        this.cartService.clearCart(this.userId!).subscribe();
      },
      error: err => console.error('Error placing order', err)
    });
  }


}
