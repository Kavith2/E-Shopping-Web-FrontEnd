import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
  
})
export class AppComponent {
  title = 'E-Commerce';

  constructor(private authService: AuthService, private router: Router) {}

ngOnInit() {
  const token = localStorage.getItem('token');
  if (token) {
    this.authService['startLogoutTimer'](token); // restart timer after refresh
  }
}

}
