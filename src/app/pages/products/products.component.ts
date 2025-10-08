import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddToCartRequest } from 'src/app/models/add-to-cart-request';
import { Products } from 'src/app/models/products';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';
import { CartUiService } from 'src/app/services/cartUi.service';
import { ProductService } from 'src/app/services/product.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  environment = environment;
  products: Products[] = [];
  expandedIndex: number | null = null;


  constructor(private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private cartuiService: CartUiService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err) => {
        console.error('Error loading products', err);
      }
    });
  }

  toggleExpand(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  addToCart(product: any) {
    const userId = this.authService.getUserId();
    const request: AddToCartRequest = {
      UserId: userId!,
      ProductPrice: product.price,
      ProductName: product.name,
      ProductId: product.id,
      Quantity: 1
    };

    this.cartService.addToCart(request).subscribe({
      next: () => {
        this.snackBar.open('Product added to cart!', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success'],
        }),
        this.cartuiService.openCart();
      },
      error: (err) => console.error('Error adding to cart:', err)
    });
  }
}
