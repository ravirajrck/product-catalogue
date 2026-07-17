import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { DataService } from '../../../core/services/data.service';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-add-product',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css',
})
export class AddProductComponent {
  private dataService = inject(DataService);
  private route = inject(ActivatedRoute);
  productForm!: FormGroup;
  isSaving = false;
  categoriesList: any[] = [];
  private location: any = inject(Location);
  isEditing = false;
  productId: string | null = null;

  constructor(private fb: FormBuilder) {}

  goBack() {
    this.location.back(); // Browser history mein piche jayega
  }

  ngOnInit() {
    const urlPattern =
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.dataService.getCategories().subscribe({
      next: (data) => {
        this.categoriesList = data;
      },
      error: (err) => console.error(err),
    });

    this.route.paramMap.subscribe((params) => {
      this.productId = params.get('id');
      if (this.productId) {
        this.isEditing = true;
        this.loadProductData(this.productId); // Agar edit hai toh data load karein
      }
    });

    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      categoryId: ['', Validators.required],
      originalPrice: [null, [Validators.required, Validators.min(1)]],
      price: [null, [Validators.required, Validators.min(1)]],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10), // Kam se kam 10 characters
          Validators.maxLength(2000),
        ],
      ],
      // 3 images ka array (Empty strings)
      // images: this.fb.array(['', '', '']),
      images: this.fb.array([
        this.fb.group({
          url: ['', Validators.required],
        }),
        this.fb.group({ url: [''] }),
        this.fb.group({ url: [''] }),
      ]),
    });
  }

  async loadProductData(id: string) {
    try {
      // Service se product fetch karein
      const product = await this.dataService.getProductById(id);

      // 1. Basic fields patch karein
      this.productForm.patchValue({
        name: product.name,
        categoryId: product.categoryId,
        originalPrice: product.originalPrice,
        price: product.price,
        description: product.description,
      });

      // 2. Images (FormArray) ko handle karein
      if (product.images && Array.isArray(product.images)) {
        this.imageArray.clear(); // Purane khali fields hatao
        product.images.forEach((img: any) => {
          this.imageArray.push(this.fb.group({ url: [img.url] }));
        });

        // Agar 3 se kam images hain, toh baki khali fields wapas add karein
        while (this.imageArray.length < 3) {
          this.imageArray.push(this.fb.group({ url: [''] }));
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
    }
  }

  // Helper function to get image array
  get imageArray() {
    return this.productForm.get('images') as FormArray;
  }

  uploadImage(index: number) {
    const myWidget = (window as any).cloudinary.createUploadWidget(
      {
        cloudName: 'u2uihi8w',
        uploadPreset: 'my_shop_preset_rck_digi',
        sources: ['local'],
        clientAllowedFormats: ['image'],
        multiple: false,
        maxFiles: 1,
      },
      (error: any, result: any) => {
        if (!error && result && result.event === 'success') {
          // Yahan 'patchValue' use karein aur object structure dein
          this.imageArray.at(index).patchValue({
            url: result.info.secure_url,
          });
        }
      },
    );
    myWidget.open();
  }

  removeImage(index: number) {
    // Yahan bhi object structure pass karein
    this.imageArray.at(index).patchValue({
      url: '',
    });
  }

  async onSaveProduct() {
    this.productForm.markAllAsTouched();
    if (this.productForm.invalid) return;

    this.isSaving = true;
    try {
      const productData = this.productForm.value;

      if (this.isEditing && this.productId) {
        // UPDATE MODE
        await this.dataService.updateProduct(this.productId, productData);
        alert('Product updated successfully!');
      } else {
        // ADD MODE
        await this.dataService.addProduct(productData);
        alert('Product added successfully!');
      }

      this.goBack(); // Savvy way to return
    } catch (error) {
      console.error('Error saving product: ', error);
      alert('Failed to save. Please try again.');
    } finally {
      this.isSaving = false;
    }
  }

  onlyNumbers(event: Event) {
    // 'event' ko KeyboardEvent mein cast karein
    const keyboardEvent = event as KeyboardEvent;

    const charCode = keyboardEvent.which
      ? keyboardEvent.which
      : keyboardEvent.keyCode;

    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      keyboardEvent.preventDefault();
    }
  }
}
