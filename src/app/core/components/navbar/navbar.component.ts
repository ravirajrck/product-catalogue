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
import { SidebarService } from '../../services/sidebar.service';
@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  public authService = inject(AuthService);
  public sidebarService = inject(SidebarService); // Service inject ki
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  isLoading = false;
  private timer: any;
  isLoggedIn$ = authState(this.authService.auth);

  ngOnInit() {
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

  ngOnDestroy() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/admin-login']);
  }
}
