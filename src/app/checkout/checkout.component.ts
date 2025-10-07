import { Component } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cart, CartItem } from '../models/cart-item';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { Order } from '../models/order';
import { ProductService } from '../services/product.service';
import { Products } from '../models/products';
import { environment } from 'src/environments/environment';
import { UpdateQuantityRequest } from '../models/update-quantity-request';
import { RemoveFromCartRequest } from '../models/remove-from-cart-request';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent {
  envirnoment = environment;
  checkoutForm: FormGroup;
  CartItem: CartItem[] = [];
  Product: Products[]=[]
  cart: Cart = new Cart();
  orderPlaced: boolean = false;
  userId: string | null = null;
  selectedPayement: string = "1";

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private authService: AuthService,
    private productService: ProductService

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

    this.productService.getAllProducts().subscribe({
  next: (products) => {
    this.Product = products;
  },
  error: (err) => {
    console.error('Error loading products:', err);
  }
});
    

  }

getProductImage(productId: string) {
  const product = this.Product.find(p => p.id === productId);
  if (product?.image) {
    return  environment.apiUrl +  product.image;
  }
  return environment.apiUrl;
}


increaseQuantity(item: CartItem): void {
  item.quantity++;
  this.updateQuantity(item.productId!, item.quantity);
}

decreaseQuantity(item: CartItem): void {
  if (item.quantity > 1) {
    item.quantity--;
    this.updateQuantity(item.productId!, item.quantity);
  }
}

loadCart(): void {
  if (!this.userId) return;

  this.cartService.getCartByUserId(this.userId).subscribe({
    next: (cart) => {
      this.CartItem = cart?.items || [];
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
  const item = this.CartItem.find(i => i.productId === productId);
  if (!item || !this.userId) return;

  console.log('Updating quantity for productId:', productId, 'to', quantity);
  item.quantity = quantity;
  item.subTotal = item.quantity * item.productPrice!;

  const request: UpdateQuantityRequest = {
    UserId: this.userId,
    Quantity: quantity
  };

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
