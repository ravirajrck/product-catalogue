import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// 🔥 Firestore dependencies import kiya
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { FooterComponent } from '../../../core/components/footer/footer.component';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../../core/components/navbar/navbar.component';
import { DataService } from '../../../core/services/data.service';
import { NoDataComponent } from '../../../core/components/shared/no-data/no-data.component';
import { ProductCardComponent } from '../../../core/components/shared/product-card/product-card.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-customer-store',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FooterComponent,
    NavbarComponent,
    NoDataComponent,
    ProductCardComponent,
  ], // 👈 NgModel error nahi aayegi
  templateUrl: './customer-store.component.html',
  styleUrls: ['./customer-store.component.css'],
})
export class CustomerStoreComponent implements OnInit {
  // Data Array Elements
  productsList: any[] = [];
  categoriesList: any[] = [];
  savedItems: any[] = [];
  // Filtering & Loader States
  searchQuery: string = '';
  selectedCategory: string = 'all';
  isLoading: boolean = true; // ⚡ Shimmer control variable
  private router = inject(Router);
  private toastr = inject(ToastrService);
  constructor(private firestore: Firestore) {}

  ngOnInit(): void {
    this.loadCategoriesFromFirestore();
    this.loadProductsFromFirestore();
  }

  // Firestore: Load Categories
  loadCategoriesFromFirestore() {
    const categoriesCollection = collection(this.firestore, 'categories');
    collectionData(categoriesCollection, { idField: 'id' }).subscribe({
      next: (res: any[]) => {
        this.categoriesList = res;
      },
      error: (err) => console.error('Categories read failed:', err),
    });
  }

  // CustomerStoreComponent ke andar

  // Jab products load ho jayein
  loadProductsFromFirestore() {
    const productsCollection = collection(this.firestore, 'products');
    collectionData(productsCollection, { idField: 'id' }).subscribe({
      next: (res: any[]) => {
        this.productsList = res;
        this.isLoading = false;

        // Yahan call karein taki saved items update ho jayein
        this.updateSavedList();
      },
      error: (err) => {
        console.error('Products read failed:', err);
        this.isLoading = false;
      },
    });
  }

  // Saved list ko update karne ke liye
  updateSavedList() {
    this.savedItems = this.dataService.getSavedProductsFromList(
      this.productsList,
    );
  }

  // ⚡ Live Filter Core Logic
  get filteredProducts() {
    let output = this.productsList;

    // 1. Category Filter Toggling
    if (this.selectedCategory !== 'all') {
      output = output.filter(
        (prod) => prod.categoryId === this.selectedCategory,
      );
    }

    // 2. Realtime Keyboard Input Search
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      output = output.filter(
        (prod) =>
          (prod.name && prod.name.toLowerCase().includes(query)) ||
          (prod.description && prod.description.toLowerCase().includes(query)),
      );
    }

    return output;
  }

  // WhatsApp Checkout Action Link
  onOrderNow(product: any) {
    const currentUrl = window.location.href + '/product/' + product.id;
    const textMessage = `Hello! I want to order this product:
*🔗 Product Link:*
${currentUrl}

*📦 Product Details:*
*Name:* ${product.name}
*Price:* ₹${product.price}
*Original Price:* ₹${product.originalPrice}

*📝 Description:*
${product.description}

*🖼️ Images:*
${product.images.map((img: any, i: number) => (img.url ? `Image ${i + 1}: ${img.url}` : '')).join('\n')}

Please let me know about the availability!`;
    const whatsappUrl = `https://wa.me/919644692189?text=${encodeURIComponent(textMessage)}`; // 👈 XXXXXXXXXX ki jagah apna link phone number daal dena
    window.open(whatsappUrl, '_blank');
  }

  // Navigate karne ka function
  viewProduct(productId: string) {
    this.router.navigate(['/store/product', productId], {
      queryParams: { type: 'store' },
    });
  }

  onImageError(event: any) {
    // अगर इमेज लोड नहीं हो पाती, तो उसे 'noimage.png' से रिप्लेस कर दें
    event.target.src = 'noimage.png';
  }

  private dataService = inject(DataService); // DataService inject kiya

  // Save/Toggle Logic
  toggleSaved(prod: any, event: Event) {
    event.stopPropagation(); // Parent card click na ho
    const isSaved: any = this.dataService.toggleSavedLocal(prod);

    // Toast Notification logic
    if (isSaved) {
      this.toastr.success('Product saved successfully!', 'Success');
    } else {
      this.toastr.info('Product removed successfully!', 'Removed');
    }
  }

  // Check karne ke liye ki product saved hai ya nahi
  isSaved(productId: string): boolean {
    return this.dataService.isProductSaved(productId);
  }
}
