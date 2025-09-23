import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LoginRequest } from 'src/app/models/login-request';
import { AuthService } from 'src/app/services/auth.service';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    const payload: LoginRequest = this.loginForm.value;

    this.authService.login(payload).subscribe({
      next: (res) => {
        this.snackBar.open('Login successful!', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });

        // Optional: store token (if backend returns one)
        // localStorage.setItem('token', res.token);

        this.router.navigate(['/home']); // or your main page
      },
      error: (err) => {
        this.snackBar.open(
          err?.error?.message || 'Login failed!',
          'Close',
          {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          }
        );
      }
    });
  }
}
