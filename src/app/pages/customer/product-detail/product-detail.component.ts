import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { CommonModule, Location } from '@angular/common';
import { FooterComponent } from '../../../core/components/footer/footer.component';
import { NavbarComponent } from '../../../core/components/navbar/navbar.component';

@Component({
  selector: 'app-product-detail',
  imports: [FooterComponent, NavbarComponent, CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);
  private location = inject(Location);

  product: any = null;
  loading = true;
  activeImage: string = ''; // Slider ke liye

  async ngOnInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.product = await this.dataService.getProductById(id);
      this.activeImage = this.product.imageUrl; // Default image
      this.loading = false;
    }
  }

  changeImage(url: string) {
    this.activeImage = url;
    if (window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

orderOnWhatsApp() {
  const message = `Hi! I am interested in this product: ${this.product.name}. 
  Could you please provide more details and current availability?`;
  
  window.open(`https://wa.me/YOUR_NUMBER?text=${encodeURIComponent(message)}`, '_blank');
}
  shareProduct() {
    if (navigator.share) {
      navigator.share({ title: this.product.name, url: window.location.href });
    }
  }

  goBack() {
    this.location.back();
  }

  onImageError(event: any) {
    // अगर इमेज लोड नहीं हो पाती, तो उसे 'noimage.png' से रिप्लेस कर दें
    event.target.src = 'noimage.png';
  }

  isExpanded: boolean = false;

  toggleDescription() {
    this.isExpanded = !this.isExpanded;
  }

  // Save/Toggle Logic
  toggleSaved() {
    this.dataService.toggleSavedLocal(this.product);
  }

  // Check karne ke liye button active hai ya nahi
  isSaved(): boolean {
    return this.dataService.isProductSaved(this.product.id);
  }
}
