import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Products } from '../models/products';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = 'https://localhost:7250/api/Product';

  constructor(private http : HttpClient) { }

  getAllProducts(): Observable<Products[]> {
    return this.http.get<Products[]>(this.apiUrl);
}

  getProductById(id: string): Observable<Products> {
    return this.http.get<Products>(`${this.apiUrl}/${id}`);
  }

  getProductsByCategory(category: string): Observable<Products[]> {
  return this.http.get<Products[]>(`${this.apiUrl}/category/${category}`);
}

}