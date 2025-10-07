import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartUiService {
  private cartVisible = new BehaviorSubject<boolean>(false);
  cartVisible$ = this.cartVisible.asObservable();

  openCart() {
    console.log('CartUiService → openCart() called'); //
    this.cartVisible.next(true);
  }

  closeCart() {
     console.log('CartUiService → closeCart() called'); 
    this.cartVisible.next(false);
  }
}
