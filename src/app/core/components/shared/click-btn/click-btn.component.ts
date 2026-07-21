import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-click-btn',
  imports: [RouterLink, CommonModule],
  templateUrl: './click-btn.component.html',
  styleUrl: './click-btn.component.css',
})
export class ClickBtnComponent {
  @Input() text: string = '+ Add New';
  @Input() routerLink: any[] | string = './';
}
