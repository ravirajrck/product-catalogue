import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';

export const guestGuard = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return authState(auth).pipe(
    take(1),
    map(user => {
      if (user) {
        // Agar user pehle se login hai, toh wapas Dashboard par bhejo
        router.navigate(['/admin/dashboard']);
        return false; 
      } else {
        // Agar login nahi hai, toh page access karne do
        return true;
      }
    })
  );
};