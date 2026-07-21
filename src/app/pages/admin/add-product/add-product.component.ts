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
import { Location } from '@angular/common';
import { DataService } from '../../../core/services/data.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr'; // Toastr import kiya gaya hai

@Component({
  selector: 'app-add-product',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css',
})
export class AddProductComponent {
  private dataService = inject(DataService);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService); // Toastr service inject ki gayi hai
  private location: any = inject(Location);

  productForm!: FormGroup;
  isSaving = false;
  categoriesList: any[] = [];
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
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to load categories!', 'Error');
      },
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
      images: this.fb.array([
        this.fb.group({
          url: ['', Validators.required],
        }),
        this.fb.group({
          url: ['', Validators.required],
        }),
        this.fb.group({
          url: ['', Validators.required],
        }),
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
          this.imageArray.push(
            this.fb.group({ url: [img.url, Validators.required] }),
          ); // Ensure validation is attached
        });

        // Agar 3 se kam images hain, toh baki khali fields wapas add karein
        while (this.imageArray.length < 3) {
          // Pehli image required ho sakti hai, baki optional ya teeno required rakh sakte hain
          const isFirst = this.imageArray.length === 0;
          this.imageArray.push(
            this.fb.group({
              url: ['', isFirst ? Validators.required : null],
            }),
          );
        }
      }

      // 3. Yahan form array ko touched mark kar dein taaki agar khali ho toh error dikhe
      this.imageArray.markAllAsTouched();
    } catch (error) {
      console.error('Error loading product:', error);
      this.toastr.error('Failed to load product details for editing.', 'Error');
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
          this.toastr.success('Image uploaded successfully!', 'Success');
        } else if (error) {
          this.toastr.error('Image upload failed. Please try again!', 'Error');
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
    this.toastr.info('Image removed', 'Removed');
  }

  async onSaveProduct() {
    this.productForm.markAllAsTouched();

    // 1. Check karein ki kam se kam pehli image bhari hai ya nahi
    const imagesArray = this.imageArray.value;
    const hasAtLeastOneImage = imagesArray.some(
      (img: any) => img.url && img.url.trim() !== '',
    );

    // 2. Agar form invalid hai YA ek bhi image nahi hai, toh rok dein
    if (this.productForm.invalid || !hasAtLeastOneImage) {
      this.toastr.warning(
        'Please fill in all required fields.',
        'Validation Error',
      );
      return;
    }

    this.isSaving = true;
    try {
      const productData = this.productForm.value;

      if (this.isEditing && this.productId) {
        await this.dataService.updateProduct(this.productId, productData);
        this.toastr.success('Product updated successfully!', 'Success');
      } else {
        await this.dataService.addProduct(productData);
        this.toastr.success('Product added successfully!', 'Success');
      }

      this.goBack();
    } catch (error) {
      console.error('Error saving product: ', error);
      this.toastr.error('Failed to save product. Please try again.', 'Error');
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
