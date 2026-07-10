import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule], // [[CRITICAL]]: Forms binding chalane ke liye zaroori hai
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  
  private authService = inject(AuthService);

  onLogin() {
    if (this.email && this.password) {
      this.authService.login(this.email, this.password);
    } else {
      alert("Please fill in both email and password fields.");
    }
  }
}