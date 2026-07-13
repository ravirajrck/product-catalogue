import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  signOut,
  user,
} from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public auth = inject(Auth);
  private router = inject(Router);

  
  // Yeh check karne ke liye ki admin logged in hai ya nahi (Reactive state)
  currentUser$ = user(this.auth);

  // Login Function
  async login(email: string, pass: string) {
    try {
      await signInWithEmailAndPassword(this.auth, email, pass).then(
        (userCredential) => {
          // Firebase se UID mil gayi
          const uid = userCredential.user?.uid;

          localStorage.setItem('adminToken', uid);
          this.router.navigate(['/admin/dashboard']);
        },
      );
    } catch (error) {
      alert('Invalid Email or Password! Please try again.');
    }
  }

  // Logout Function
  async logout() {
    await signOut(this.auth);
    localStorage.removeItem('adminToken');
  }

  // auth.service.ts
  isLoggedIn(): boolean {
    // Yahan check karein ki user logged in hai ya nahi (e.g., token check)
    return !!localStorage.getItem('adminToken');
  }
  
  // Naya check function
  async isAdminLoggedIn(): Promise<boolean> {
    return !!this.auth.currentUser;
  }
}
