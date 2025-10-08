import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { CartItem } from '../models/cart-item';
import { AuthService } from '../services/auth.service';
import { CartUiService } from '../services/cartUi.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  cartItems: CartItem[] = [];
  userId: string | null = null;
  cartCount: number = 0;
  showDropdown = false;

  constructor(
    private router: Router,
    private cartService: CartService,
    public cartuiService: CartUiService,
    private authService: AuthService) { }

  ngOnInit() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.cartService.getCartByUserId(userId).subscribe(); // initialize cart
    }

    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });
  }

  openCart() {
    this.cartuiService.openCart();
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  logout(): void {
    localStorage.removeItem('token');
    this.showDropdown = false;
    this.router.navigate(['/login']);
  }

}
