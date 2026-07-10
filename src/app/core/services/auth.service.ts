import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, user } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);

  // Yeh check karne ke liye ki admin logged in hai ya nahi (Reactive state)
  currentUser$ = user(this.auth);

  // Login Function
  async login(email: string, pass: string) {
    try {
      await signInWithEmailAndPassword(this.auth, email, pass);
      this.router.navigate(['/admin-dashboard']);
    } catch (error) {
      console.error("Auth Error:", error);
      alert("Invalid Email or Password! Please try again.");
    }
  }

  // Logout Function
  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/admin-login']);
  }
}