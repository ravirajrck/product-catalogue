import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private _isOpen = new BehaviorSubject<boolean>(false);
  public sidebarOpen$ = this._isOpen.asObservable();
  
  public isAnimating = false;

  toggle() {
    if (this._isOpen.value) {
      this.close();
      console.log('dd')
    } else {
          this.isAnimating = true;
      this._isOpen.next(true);
       this.isAnimating = false;
            console.log('rrrrdd')
    }
  }

// SidebarService ke andar:
close() {
  this.isAnimating = true; // Animation shuru hogi
  
  // 300ms (animation duration) ka wait karein
  setTimeout(() => {
    this._isOpen.next(false); // Sidebar state band
    this.isAnimating = false; // Animation state reset
  }, 300);
}
}