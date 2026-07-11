import { Component, inject } from '@angular/core';
import { Router, RouterModule } from "@angular/router";
import { AuthService } from '../../../core/services/auth.service';
import { NavbarComponent } from "../../../core/components/navbar/navbar.component";

@Component({
  selector: 'app-admin-home',
  imports: [RouterModule, NavbarComponent],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.css'
})
export class AdminHomeComponent {

}
