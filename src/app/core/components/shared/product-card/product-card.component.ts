import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
@Component({
  selector: 'app-product-card',
  imports: [TitleCasePipe, CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  @Input() product: any;
  @Input() saved: boolean = false;

  @Output() cardClick = new EventEmitter<string>();
  @Output() toggleSaved = new EventEmitter<any>();
  @Output() buyNow = new EventEmitter<any>();

  isLoading: boolean = false;
  onCardClick() {
    this.cardClick.emit(this.product.id);
  }

  onToggleSaved(event: Event) {
    event.stopPropagation();
    if (this.isLoading) return;
    this.isLoading = true;

    // Parent ko event emit karein
    this.toggleSaved.emit({ product: this.product, event: event });

    // Thoda sa visual loading effect dikhane ke baad loader hata dein
    setTimeout(() => {
      this.isLoading = false;
    }, 400);
  }

  onBuyClick(event: Event) {
    event.stopPropagation();
    this.buyNow.emit(this.product);
  }

  onImageError(event: any) {
    event.target.src = 'noimage.png';
  }
}
