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
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-product',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
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
      originalPrice: [null],
      price: [null, [Validators.required, Validators.min(1)]],
      description: [''],
      // 3 images ka array (Empty strings)
      images: this.fb.array(['', '', '']),
    });
  }

  loadProductData(id: string) {
    console.log("Edit mode activated for ID:", id);
    // Yahan Firebase/API se data fetch karke productForm.patchValue() karein
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
      },
      (error: any, result: any) => {
        if (!error && result && result.event === 'success') {
          this.imageArray.at(index).setValue(result.info.secure_url);
        }
      },
    );
    myWidget.open();
  }

  removeImage(index: number) {
    this.imageArray.at(index).setValue('');
  }

  onSaveProduct() {
    // Validate if at least one image exists
    const hasImage = this.imageArray.value.some((url: string) => url !== '');

    if (this.productForm.invalid || !hasImage) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const finalData = { ...this.productForm.value };
    console.log('Firebase Payload:', finalData);
  }
}
