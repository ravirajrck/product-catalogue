import { CommonModule } from '@angular/common';
import { SwiperOptions } from 'swiper/types';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { register } from 'swiper/element/bundle';
register();

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {
currentSlide = 0;
  totalSlides = 3; // Humne 3 slides banaye hain

  ngOnInit() {
    // Auto-play slider (har 5 second mein slide change hogi)
    setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

// Slider configuration
  swiperConfig: SwiperOptions = {
    slidesPerView: 2,
    spaceBetween: 10,
    loop: true,
    autoplay: { delay: 3000 },
    breakpoints: {
      768: { slidesPerView: 4 }, // Desktop par 4 items
    }
  };
}