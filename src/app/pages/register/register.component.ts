import { Component } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RegisterRequest } from 'src/app/models/register-request';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;
    const { name, email, password, confirmPassword } = this.registerForm.value;

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    const payload: RegisterRequest = { name, email, password, confirmPassword };

    this.authService.register(payload).subscribe({
      next: () => {
        this.snackBar.open('Registration successful!', 'Close', {
          duration: 3000, // milliseconds
          verticalPosition: 'top',
          panelClass: ['snackbar-success'] // Optional custom style
        });

        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Registration error:', err);
        this.snackBar.open('Registration failed. Please try again.', 'Close', {
        });
        this.registerForm.reset();
      }
    });
  }
}
