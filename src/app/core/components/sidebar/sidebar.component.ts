import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { authState } from '@angular/fire/auth';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  RouterModule,
} from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  public authService = inject(AuthService);
  private router = inject(Router);
  public sidebarService = inject(SidebarService); // Service inject ki

  isLoggedIn$ = authState(this.authService.auth);

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/admin-login']); // Sahi route name check karein
  }
}
