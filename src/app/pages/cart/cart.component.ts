import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Cart, CartItem } from 'src/app/models/cart-item';
import { Products } from 'src/app/models/products';
import { RemoveFromCartRequest } from 'src/app/models/remove-from-cart-request';
import { UpdateQuantityRequest } from 'src/app/models/update-quantity-request';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';
import { CartUiService } from 'src/app/services/cartUi.service';
import { ProductService } from 'src/app/services/product.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent {
  environment = environment;
    cartItems: CartItem[] = [];
    Products: Products[] = [];
    EmptyCart:boolean = false;
    productName: string = '';
    userId : string | null = null;
    showCart: boolean = false;

  constructor(private cartService: CartService,
              private authService: AuthService,
              private productService: ProductService,
              public cartuiService:CartUiService,
              private router:Router) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    if (!this.userId) {
      console.error('User not authenticated or token missing');
      return;
    }
    this.cartuiService.cartVisible$.subscribe(isVisible => {
      this.showCart = isVisible;
      if(isVisible){
      this.loadCart();
      }
    });

    this.productService.getAllProducts().subscribe({
  next: (products) => {
    this.Products = products;
  },
  error: (err) => {
    console.error('Error loading products:', err);
  }
});
    

  }

getProductImage(productId: string): string {
  const product = this.Products.find(p => p.id === productId);

  // If product found → return full backend URL + image path
  if (product?.image) {
    return this.environment.apiUrl + product.image;
  }

  // Fallback (if product not found or has no image)
  return this.environment.apiUrl;
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


 closeCart() {
    this.cartuiService.closeCart();
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


goToCheckout(): void {
  this.router.navigate(['/checkout']);
  this.closeCart();
}

getTotal(): number {
  return this.cartItems.reduce((sum, item) => sum + (item.productPrice || 0) * item.quantity, 0);
}


}
