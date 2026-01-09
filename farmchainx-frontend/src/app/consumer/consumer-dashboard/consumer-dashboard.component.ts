import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-consumer-dashboard',
  templateUrl: './consumer-dashboard.component.html',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ]
})
export class ConsumerDashboardComponent implements OnInit {

  user: any;

  cart: any[] = [];
  cartCount = 0;

  private readonly CART_KEY = 'cart';

  constructor(
    private auth: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.auth.user;

    if (!this.user) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    if (this.user.role !== 'BUYER') {
      this.router.navigate(['/'], { replaceUrl: true });
      return;
    }

    this.loadCart();
  }

  // ---------------- CART LOGIC ----------------

  loadCart() {
    const savedCart = localStorage.getItem(this.CART_KEY);
    const rawCart = savedCart ? JSON.parse(savedCart) : [];

    // 🔥 NORMALIZE CART DATA
    this.cart = rawCart.map((item: any) => ({
      listingId: item.listingId,
      name: item.name || item.cropName || 'Unknown Product',
      price: item.price,
      image: item.image || item.cropImageUrl,
      quantity: item.quantity || 1
    }));

    this.syncCart();
  }

  addToCart(product: any) {
    const index = this.cart.findIndex(
      item => item.listingId === product.listingId
    );

    if (index !== -1) {
      this.cart[index].quantity += 1;
    } else {
      this.cart.push({
        listingId: product.listingId,
        name: product.cropName,              // ✅ FIXED
        price: product.price,
        image: product.cropImageUrl,
        quantity: 1
      });
    }

    this.syncCart();
  }

  removeFromCart(index: number) {
    this.cart.splice(index, 1);
    this.syncCart();
  }

  clearCart() {
    this.cart = [];
    localStorage.removeItem(this.CART_KEY);
    this.cartCount = 0;
  }

  private syncCart() {
    localStorage.setItem(this.CART_KEY, JSON.stringify(this.cart));
    this.cartCount = this.cart.reduce(
      (sum, item) => sum + item.quantity, 0
    );
  }

  // ---------------- NAVIGATION ----------------

  goToCart() {
    this.router.navigate(['/consumer/cart']);
  }

  go(path: string) {
    this.router.navigate([path]);
  }

  openAIAssistant() {
    this.router.navigate(['/consumer/ai-assistant'])
      .catch(() => window.location.href = '/consumer/ai-assistant');
  }
}
