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
  checkoutForm1: FormGroup;
  checkoutForm2: FormGroup;
  CartItem: CartItem[] = [];
  Product: Products[] = []
  cart: Cart = new Cart();
  orderPlaced: boolean = false;
  userId: string | null = null;
  disableBtn: boolean = true;
  selectedPayment: string = "";
  
  months = [
    { value: '01', label: '01 - Jan' },
    { value: '02', label: '02 - Feb' },
    { value: '03', label: '03 - Mar' },
    { value: '04', label: '04 - Apr' },
    { value: '05', label: '05 - May' },
    { value: '06', label: '06 - Jun' },
    { value: '07', label: '07 - Jul' },
    { value: '08', label: '08 - Aug' },
    { value: '09', label: '09 - Sep' },
    { value: '10', label: '10 - Oct' },
    { value: '11', label: '11 - Nov' },
    { value: '12', label: '12 - Dec' }
  ];

  years = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + i);


  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private authService: AuthService,
    private productService: ProductService

  ) {
    this.checkoutForm1 = this.fb.group({
      address: ['', [Validators.required]],
      email: ['', Validators.required],
      name: ['', Validators.required]
    });

    this.checkoutForm2 = this.fb.group({
      cvv: ['', [Validators.required, Validators.minLength(3)]],
      expMonth: ['', Validators.required],
      expYear: ['', Validators.required],
      cardNumber: ['', [Validators.required, Validators.minLength(16), Validators.maxLength(19)]]
    });
  }

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    if (!this.userId) {
      console.error('User not authenticated or token missing');
      return;
    }
    this.loadCartitems();

    this.checkoutForm2.valueChanges.subscribe(() => {
      this.disablePlaceOrder();
    });

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
      return environment.apiUrl + product.image;
    }
    return environment.apiUrl;
  }

  disablePlaceOrder() {
    if (this.selectedPayment === "") {
      this.disableBtn = true;
    } else if (this.selectedPayment === "1") {
      this.disableBtn = !this.checkoutForm1.valid;
    }
    else if (this.selectedPayment === "2") {
      this.disableBtn = !this.checkoutForm2.valid;
    } else {
      this.disableBtn = false;
    }

  }

  onCardNumberInput(event: any) {
    const value = event.target.value.replace(/\D/g, ''); // remove non-digits
    event.target.value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
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


  removeItem(productId: string): void {
    if (!this.userId) return;
    const request: RemoveFromCartRequest = {
      UserId: this.userId,
      ProductId: productId
    };

    this.cartService.removeFromCart(request).subscribe(() => {
      this.loadCartitems();
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

    this.cartService.updateQuantity(productId, request)
      .subscribe({
        next: () => {
          this.loadCartitems();
        },
        error: (err) => console.error('Failed to update quantity', err)
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
      items: this.CartItem

    };


    this.cartService.saveOrder(order).subscribe({
      next: () => {
        this.CartItem = [];
        this.checkoutForm1.reset();
        this.checkoutForm2.reset();
        alert('Order placed successfully!');
        this.orderPlaced = true;
        this.cartService.clearCart(this.userId!).subscribe();
      },
      error: err => console.error('Error placing order', err)
    });
  }


}
