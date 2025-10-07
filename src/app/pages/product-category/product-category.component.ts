import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';
import { Products } from 'src/app/models/products';
import { environment } from 'src/environments/environment';
import { CartService } from 'src/app/services/cart.service';
import { AddToCartRequest } from 'src/app/models/add-to-cart-request';
import { AuthService } from 'src/app/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CartUiService } from 'src/app/services/cartUi.service';

@Component({
  selector: 'app-product-category',
  templateUrl: './product-category.component.html',
  styleUrls: ['./product-category.component.css']
})
export class ProductCategoryComponent implements OnInit {
  environment = environment;
  products: Products[] = [];
  category: string = '';
  expandedIndex: number | null = null;


  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private cartService: CartService,
    public cartuiService:CartUiService,
    private authService: AuthService,
     private snackBar: MatSnackBar
  ) {}

   ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const category = params.get('name');
      if (category) {
        this.category = category;
        this.productService.getProductsByCategory(category).subscribe({
          next: data => this.products = data,
          error: err => console.error('Category fetch error', err)
        });
      }
    });
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
      next: () =>{ this.snackBar.open('Product added to cart!', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-success'],
      }),
      this.cartuiService.openCart();
      },
    error: (err) => console.error('Error adding to cart:', err)
    });
  }

  toggleExpand(index: number): void {
      this.expandedIndex = this.expandedIndex === index ? null : index;
    }
}