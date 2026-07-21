import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private firestore = inject(Firestore);

  // ====== CATEGORIES CRUD ======
  addCategory(categoryName: string) {
    const categoriesRef = collection(this.firestore, 'categories');
    return addDoc(categoriesRef, { name: categoryName, createdAt: new Date() });
  }

  getCategories(): Observable<any[]> {
    const categoriesRef = collection(this.firestore, 'categories');
    return collectionData(categoriesRef, { idField: 'id' });
  }

  updateCategory(categoryId: string, newName: string) {
    const categoryDocRef = doc(this.firestore, `categories/${categoryId}`);
    return updateDoc(categoryDocRef, { name: newName });
  }

  deleteCategory(categoryId: string) {
    const categoryDocRef = doc(this.firestore, `categories/${categoryId}`);
    return deleteDoc(categoryDocRef);
  }

  // ====== PRODUCTS CRUD ======
  addProduct(product: any) {
    const productsRef = collection(this.firestore, 'products');
    return addDoc(productsRef, { ...product, createdAt: new Date() });
  }

  getProducts(): Observable<any[]> {
    const productsRef = collection(this.firestore, 'products');
    return collectionData(productsRef, { idField: 'id' });
  }

  // [[NEW]] 3. Update Product
  updateProduct(productId: string, updatedData: any) {
    const productDocRef = doc(this.firestore, `products/${productId}`);
    return updateDoc(productDocRef, updatedData);
  }

  updateProductStock(productId: string, inStock: boolean) {
    const productDocRef = doc(this.firestore, `products/${productId}`);
    return updateDoc(productDocRef, { inStock: inStock });
  }

  // [[NEW]] 4. Delete Product
  deleteProduct(productId: string) {
    const productDocRef = doc(this.firestore, `products/${productId}`);
    return deleteDoc(productDocRef);
  }

  // [[NEW]] 2. Get Single Product by ID
  async getProductById(id: string): Promise<any> {
    const docRef = doc(this.firestore, 'products', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Product not found!');
    }
  }

  // [[NEW]] 3. Get Single Category by ID
  async getCategoryById(id: string): Promise<any> {
    const docRef = doc(this.firestore, 'categories', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return { name: 'Uncategorized' };
  }

  // src/app/core/services/data.service.ts

  getSavedProductsFromList(allProducts: any[]): any[] {
    // 1. LocalStorage se IDs nikaalo
    const savedIds = JSON.parse(localStorage.getItem('saved_products') || '[]');

    if (savedIds.length === 0) return [];

    // 2. Apni pehle se load ki hui list ko filter karo
    return allProducts.filter((prod) => savedIds.includes(prod.id));
  }

  // 1. Sirf ID save/remove karein (Price nahi)
  toggleSavedLocal(product: any): boolean {
    let savedIds = JSON.parse(localStorage.getItem('saved_products') || '[]');
    const index = savedIds.indexOf(product.id);
    let isSaved = false;

    if (index > -1) {
      savedIds.splice(index, 1); // Remove
      isSaved = false;
    } else {
      savedIds.push(product.id); // Add
      isSaved = true;
    }

    localStorage.setItem('saved_products', JSON.stringify(savedIds));
    return isSaved; // Yeh batayega ki save hua ya remove
  }

  // 2. Check karne ke liye
  isProductSaved(productId: string): boolean {
    const savedIds = JSON.parse(localStorage.getItem('saved_products') || '[]');
    return savedIds.includes(productId);
  }

  // DataService ke andar ye method add karein
  async getAllProductsFromFirestore(): Promise<any[]> {
    const productsCollection = collection(this.firestore, 'products');
    const snapshot = await getDocs(productsCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}
