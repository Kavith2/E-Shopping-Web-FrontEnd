import { Component } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartItem } from '../models/cart-item';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent {
  checkoutForm:FormGroup;
  CartItem: CartItem[]=[];
   userId : string | null = null;

   constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private authService: AuthService
  
  ) {
    this.checkoutForm = this.fb.group({
      address: ['', [Validators.required, Validators.email]],
      email: ['', Validators.required],
      name:['', Validators.required],
      cvv:['', Validators.required],
      expirationDate:['', Validators.required],
      cardNumber:['', Validators.required]
    });
  }

    ngOnInit(): void {
    this.userId = this.authService.getUserId();
    if (!this.userId) {
      console.error('User not authenticated or token missing');
      return;
    }
    this.loadCartitems();
    
  }

  loadCartitems(){
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

 
}
