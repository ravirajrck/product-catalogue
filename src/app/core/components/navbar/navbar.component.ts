import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';

import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  RouterModule,
} from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { authState } from '@angular/fire/auth';
@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  isSidebarOpen: boolean = false; // Sidebar state track karne ke liye
  public authService = inject(AuthService);
  // Toggle function jo click hone par true/false karega
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef); // ChangeDetector inject karein
  isLoading = false;
  private timer: any; // Timeout ko store karne ke liye
  isLoggedIn$ = authState(this.authService.auth);

  ngOnInit() {
    // this.authService.currentUser$.subscribe((user) => {
    //   this.isLoggedIn = !!user;
    //   this.cdr.detectChanges();
    // });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
        this.cdr.detectChanges();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        // Yahan setTimeout ka use kiya hai loader ko thoda smooth dikhane ke liye
        this.timer = setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 500); // 500ms ka delay
      }
    });
  }

  // YE HAIN VO ZAROORI STEP
  ngOnDestroy() {
    if (this.timer) {
      clearTimeout(this.timer); // Component hatne par timeout cancel ho jayega
    }
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['login']);
  }
}
