import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ClickBtnComponent } from '../../../core/components/shared/click-btn/click-btn.component';
import { ToastrService } from 'ngx-toastr';

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
  private toastr = inject(ToastrService);
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
        this.toastr.success('Category updated successfully!', 'Success');
        this.cancelCategoryEdit();
      } else {
        await this.dataService.addCategory(this.newCategoryName.trim());
        this.toastr.success('Category added successfully!', 'Success');
        this.newCategoryName = '';
      }
    } catch (err) {
      console.error(err);
      this.toastr.error('Something went wrong. Please try again!', 'Error');
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
      confirm(`Are you sure you want to delete the category "${categoryName}"?`)
    ) {
      try {
        await this.dataService.deleteCategory(id);
        this.toastr.success('Category deleted successfully!', 'Success');
      } catch (err) {
        console.error(err);
        this.toastr.error(
          'Failed to delete category. Please try again!',
          'Error',
        );
      }
    }
  }
  async removeProduct(id: string, name: string) {
    if (confirm(`Are you sure you want to delete the product "${name}"?`)) {
      try {
        await this.dataService.deleteProduct(id);
        this.toastr.success('Product deleted successfully!', 'Success');
      } catch (err) {
        console.error(err);
        this.toastr.error(
          'Failed to delete product. Please try again!',
          'Error',
        );
      }
    }
  }

  viewProduct(productId: string) {
    this.router.navigate(['/store/product', productId],{queryParams:{type:"dashboard"}}); // Apne route ke hisab se path set kar lein
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
        // Success Toast
        this.toastr.success(`Stock updated successfully!`, 'Success');
      })
      .catch((err) => {
        console.error('Failed to update stock:', err);
        // Error Toast
        this.toastr.error(
          'Failed to update stock status. Please try again!',
          'Error',
        );
      });
  }
}
