import { Component, inject } from '@angular/core';
import { DataService } from '../../../core/services/data.service';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-saved-products',
  imports: [CommonModule, RouterModule],
  templateUrl: './saved-products.component.html',
  styleUrl: './saved-products.component.css',
})
export class SavedProductsComponent {
    private location = inject(Location);
  private dataService = inject(DataService);
  savedProducts: any[] = [];
  isLoading = true;
  
  private router = inject(Router);
  async ngOnInit() {
    await this.loadSavedData();
  }

  async loadSavedData() {
    this.isLoading = true;
    const allProducts = await firstValueFrom(this.dataService.getProducts());
    this.savedProducts = this.dataService.getSavedProductsFromList(allProducts);
    this.isLoading = false;
  }

  // Un-save functionality
  toggleSaved(product: any, event: Event) {
    event.stopPropagation(); // Card click na ho
    this.dataService.toggleSavedLocal(product);
    this.loadSavedData(); // List ko turant refresh karega
  }
  onOrderNow(product: any) {
    const textMessage = `Hello! I want to order this product:\n\n*Name:* ${product.name}\n*Price:* ₹${product.price}\n\nPlease share confirmation and payment details!`;
    const whatsappUrl = `https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(textMessage)}`; // 👈 XXXXXXXXXX ki jagah apna link phone number daal dena
    window.open(whatsappUrl, '_blank');
  }

  // Navigate karne ka function
  viewProduct(productId: string) {
    this.router.navigate(['/product', productId]);
  }

  onImageError(event: any) {
    // अगर इमेज लोड नहीं हो पाती, तो उसे 'noimage.png' से रिप्लेस कर दें
    event.target.src = 'noimage.png';
  }
    goBack() {
    this.location.back();
  }
}
