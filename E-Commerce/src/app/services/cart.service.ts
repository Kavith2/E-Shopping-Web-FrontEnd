import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AddToCartRequest } from '../models/add-to-cart-request';
import { RemoveFromCartRequest } from '../models/remove-from-cart-request';
import { Cart, CartItem } from '../models/cart-item';
import { UpdateQuantityRequest } from '../models/update-quantity-request';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private apiUrl = 'https://localhost:7250/api/Cart';
  private cartCountSubject = new BehaviorSubject<number>(0);

  cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http : HttpClient) { }

  getCartByUserId(userId:string): Observable<Cart> {
    return this.http.get<Cart>(`${this.apiUrl}/user/${userId}`).pipe(
  tap(cart => {
        const count = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        this.cartCountSubject.next(count);
      })
    );
  }

  addToCart(request: AddToCartRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, request).pipe(
      tap(() => {
        this.getCartByUserId(request.UserId).subscribe(); 
      })
    );
  }

  removeFromCart(request: RemoveFromCartRequest): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove`, { body: request }).pipe(
      tap(() => {
        this.getCartByUserId(request.UserId).subscribe(); 
      })
    );
  }

  updateQuantity(productId: string, request: UpdateQuantityRequest): Observable<any> {
  return this.http.put(`${this.apiUrl}/update/${productId}`, request);
  
}


  clearCart(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clear/${userId}`).pipe(
      tap(() => {
        this.cartCountSubject.next(0); 
      })
    );
  }
}
