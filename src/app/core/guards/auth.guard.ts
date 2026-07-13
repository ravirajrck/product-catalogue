import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';

export const authGuard = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Firebase authState observe karein
  return authState(auth).pipe(
    take(1), // Ek baar state check karke stream band karein
    map(user => {
      if (user) {
        return true; // User logged in hai, access allow karein
      } else {
        router.navigate(['/login']); // Login nahi hai, toh login page par bhejein
        return false; // Access deny karein
      }
    })
  );
};