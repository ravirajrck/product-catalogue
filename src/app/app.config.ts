import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideHttpClient } from '@angular/common/http';

const firebaseConfig = {
  apiKey: "AIzaSyBVBuGH4sbA4D0xJjYDz8Tq7M9ZJX6kdoc",
  authDomain: "product-catelouge.firebaseapp.com",
  projectId: "product-catelouge",
  storageBucket: "product-catelouge.firebasestorage.app",
  messagingSenderId: "938871231946",
  appId: "1:938871231946:web:e890079e4cd107c5c66b33",
  measurementId: "G-LFDX1LGDYX"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideHttpClient()
  ]
};