import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,CommonModule], // [[CRITICAL]]: Forms binding chalane ke liye zaroori hai
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = 'rck@gmail.com';
  password = '123123';
  isLoading: boolean = false;
  private authService = inject(AuthService);
  async onLogin() {
    if (this.email && this.password) {
      this.isLoading = true; // Loader on
      try {
        await this.authService.login(this.email, this.password);
        // Success case mein yahan redirection hoga
      } catch (error) {
        alert('Login failed!');
      } finally {
        this.isLoading = false; // Error ya success, dono case mein loader off
      }
    } else {
      alert('Please fill in both fields.');
    }
  }
}
