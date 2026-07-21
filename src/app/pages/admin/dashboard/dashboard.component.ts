import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ClickBtnComponent } from '../../../core/components/shared/click-btn/click-btn.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ClickBtnComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private router = inject(Router);
  // Category State
  newCategoryName = '';
  categoriesList: any[] = [];
  isEditingCategory = false;
  currentEditingCategoryId = '';

  // Product State
  productsList: any[] = [];
  isEditingProduct = false;
  currentEditingProductId = '';

  // Search State
  searchTerm = '';

  // Loaders
  loading = false; // Form submission loader
  loadingData = true; // [[NEW]] Shimmer loader for initial data fetch

  showCategoryModal = false;

  ngOnInit() {
    this.loadingData = true;

    // 1. Categories load karein
    this.dataService.getCategories().subscribe({
      next: (data) => {
        this.categoriesList = data;
      },
      error: (err) => console.error(err),
    });

    // 2. Products load karein aur fetched hone ke baad loadingData false karein
    this.dataService.getProducts().subscribe({
      next: (data) => {
        this.productsList = data;
        this.loadingData = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingData = false;
      },
    });
  }

  // Local Search Filter Logic
  get filteredProducts() {
    if (!this.searchTerm.trim()) {
      return this.productsList;
    }
    const term = this.searchTerm.toLowerCase().trim();
    return this.productsList.filter(
      (prod) =>
        (prod.name && prod.name.toLowerCase().includes(term)) ||
        (prod.description && prod.description.toLowerCase().includes(term)),
    );
  }

  // [[NEW]] Search clear karne ka function
  clearSearch() {
    this.searchTerm = '';
  }

  productEdit(product: any = null) {
    this.router.navigate(['/admin/manage-product', product.id]);
  }

  // ======= CATEGORY ACTIONS =======
  async onSaveCategory() {
    if (!this.newCategoryName.trim()) return;
    try {
      if (this.isEditingCategory) {
        await this.dataService.updateCategory(
          this.currentEditingCategoryId,
          this.newCategoryName.trim(),
        );
        alert('Category updated successfully!');
        this.cancelCategoryEdit();
      } else {
        await this.dataService.addCategory(this.newCategoryName.trim());
        alert('Category added successfully!');
        this.newCategoryName = '';
      }
    } catch (err) {
      console.error(err);
    }
  }

  editCategory(category: any) {
    this.isEditingCategory = true;
    this.currentEditingCategoryId = category.id;
    this.newCategoryName = category.name;
  }

  cancelCategoryEdit() {
    this.isEditingCategory = false;
    this.currentEditingCategoryId = '';
    this.newCategoryName = '';
  }

  async removeCategory(id: string, categoryName: string) {
    if (
      confirm(
        `Kya aap sach me "${categoryName}" category delete karna chahte hain?`,
      )
    ) {
      try {
        await this.dataService.deleteCategory(id);
        alert('Category deleted successfully!');
      } catch (err) {
        console.error(err);
      }
    }
  }

  async removeProduct(id: string, name: string) {
    if (
      confirm(`Kya aap sach me product "${name}" ko delete karna chahte hain?`)
    ) {
      try {
        await this.dataService.deleteProduct(id);
        alert('Product successfully deleted!');
      } catch (err) {
        console.error(err);
      }
    }
  }

  viewProduct(productId: string) {
    this.router.navigate(['/store/product', productId]); // Apne route ke hisab se path set kar lein
  }

  onImageError(event: any) {
    // अगर इमेज लोड नहीं हो पाती, तो उसे 'noimage.png' से रिप्लेस कर दें
    event.target.src = 'noimage.png';
  }

  updateStockStatus(prod: any) {
    this.dataService
      .updateProductStock(prod.id, prod.inStock)
      .then(() => {
        console.log(`Stock updated for ${prod.name}:`, prod.inStock);
      })
      .catch((err) => {
        console.error('Failed to update stock:', err);
      });
  }
}
