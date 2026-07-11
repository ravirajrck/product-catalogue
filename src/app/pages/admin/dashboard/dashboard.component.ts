import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private dataService = inject(DataService);
  private authService = inject(AuthService);

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
  loading = false;       // Form submission loader
  loadingData = true;    // [[NEW]] Shimmer loader for initial data fetch

  productName = '';
  productPrice: number | null = null;
  productOriginalPrice: number | null = null;
  productDescription = '';
  productCategoryId = ''; 
  productImageUrl = '';

  showProductModal = false;
  showCategoryModal = false;

  ngOnInit() {
    this.loadingData = true;

    // 1. Categories load karein
    this.dataService.getCategories().subscribe({
      next: (data) => {
        this.categoriesList = data;
      },
      error: (err) => console.error(err)
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
      }
    });
  }

  // Local Search Filter Logic
  get filteredProducts() {
    if (!this.searchTerm.trim()) {
      return this.productsList;
    }
    const term = this.searchTerm.toLowerCase().trim();
    return this.productsList.filter(prod => 
      (prod.name && prod.name.toLowerCase().includes(term)) || 
      (prod.description && prod.description.toLowerCase().includes(term))
    );
  }

  // [[NEW]] Search clear karne ka function
  clearSearch() {
    this.searchTerm = '';
  }

  openProductModal(product: any = null) {
    if (product) {
      this.editProduct(product);
    } else {
      this.cancelProductEdit(); 
    }
    this.showProductModal = true;
  }

  closeProductModal() {
    this.showProductModal = false;
    this.cancelProductEdit();
  }

  // ======= CATEGORY ACTIONS =======
  async onSaveCategory() {
    if (!this.newCategoryName.trim()) return;
    try {
      if (this.isEditingCategory) {
        await this.dataService.updateCategory(this.currentEditingCategoryId, this.newCategoryName.trim());
        alert('Category updated successfully!');
        this.cancelCategoryEdit();
      } else {
        await this.dataService.addCategory(this.newCategoryName.trim());
        alert('Category added successfully!');
        this.newCategoryName = '';
      }
    } catch (err) { console.error(err); }
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
    if (confirm(`Kya aap sach me "${categoryName}" category delete karna chahte hain?`)) {
      try {
        await this.dataService.deleteCategory(id);
        alert('Category deleted successfully!');
      } catch (err) { console.error(err); }
    }
  }

  // ======= PRODUCT ACTIONS (CRUD) =======
  async onSaveProduct() {
    if (!this.productName || !this.productPrice || !this.productCategoryId) {
      alert('Please fill all mandatory fields!');
      return;
    }

    this.loading = true;
    const productData = {
      name: this.productName,
      price: this.productPrice,
      originalPrice: this.productOriginalPrice || this.productPrice,
      description: this.productDescription,
      categoryId: this.productCategoryId, 
      imageUrl: this.productImageUrl || 'https://via.placeholder.com/150'
    };

    try {
      if (this.isEditingProduct) {
        await this.dataService.updateProduct(this.currentEditingProductId, productData);
        alert('Product successfully updated!');
        this.closeProductModal(); 
      } else {
        await this.dataService.addProduct(productData);
        alert('Product successfully added!');
        this.closeProductModal(); 
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  editProduct(product: any) {
    this.isEditingProduct = true;
    this.currentEditingProductId = product.id;
    
    this.productName = product.name;
    this.productPrice = product.price;
    this.productOriginalPrice = product.originalPrice;
    this.productDescription = product.description;
    this.productCategoryId = product.categoryId;
    this.productImageUrl = product.imageUrl;
  }

  cancelProductEdit() {
    this.isEditingProduct = false;
    this.currentEditingProductId = '';
    this.resetProductForm();
  }

  async removeProduct(id: string, name: string) {
    if (confirm(`Kya aap sach me product "${name}" ko delete karna chahte hain?`)) {
      try {
        await this.dataService.deleteProduct(id);
        alert('Product successfully deleted!');
        if (this.currentEditingProductId === id) {
          this.cancelProductEdit();
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  resetProductForm() {
    this.productName = '';
    this.productPrice = null;
    this.productOriginalPrice = null;
    this.productDescription = '';
    this.productCategoryId = '';
    this.productImageUrl = '';
  }

  onLogout() {
    this.authService.logout();
  }
   onImageError(event: any) {
  // अगर इमेज लोड नहीं हो पाती, तो उसे 'noimage.png' से रिप्लेस कर दें
  event.target.src = 'noimage.png';
}

uploadImage() {
  const myWidget = (window as any).cloudinary.createUploadWidget({
    cloudName: 'u2uihi8w', // Apna Cloud Name daalein
    uploadPreset: 'my_shop_preset_rck_digi' // Dashboard se 'unsigned' preset enable karke ye daalein
  }, (error: any, result: any) => {
    if (!error && result && result.event === "success") {
      console.log('Done! Image URL: ', result.info.secure_url);
      this.productImageUrl = result.info.secure_url; // Yeh URL aapke model mein set ho jayega
    }
  });

  myWidget.open();
}
}