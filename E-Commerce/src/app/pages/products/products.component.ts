import { Component, OnInit } from '@angular/core';
import { Products } from 'src/app/models/products';
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

    
    constructor(private productService: ProductService) {}
    
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

}
