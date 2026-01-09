import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.css']
})
export class MarketplaceComponent implements OnInit {

  // Products
  products: any[] = [];
  filteredProducts: any[] = [];
  loading = true;

  // Filters
  search = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortBy = '';

  // Checkout modal
  selectedProduct: any = null;
  checkoutForm!: FormGroup;

  // Cart
  cart: any[] = [];

  constructor(
    private http: HttpClient,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.fetchProducts();
    this.loadCart();
  }

  initForm() {
    this.checkoutForm = this.fb.group({
      quantity: [1, [Validators.required, Validators.min(1)]],
      address: ['', Validators.required],
      contact: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
    });
  }

  loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) this.cart = JSON.parse(savedCart);
  }

  fetchProducts() {
    this.loading = true;
    const BASE_IMAGE_URL = 'http://localhost:8080';
    this.http.get<any[]>('http://localhost:8080/api/listings/').subscribe({
      next: data => {
        this.products = (data || [])
          .filter(l => (l.status === 'ACTIVE' || l.status === 'APPROVED') && l.price > 0 && l.quantity > 0)
          .map(l => ({
            listingId: l.listingId,
            cropName: l.cropName || 'Unknown Crop',
            farmerId: l.farmerId,
            price: Number(l.price),
            quantity: Number(l.quantity),
            qualityGrade: l.qualityGrade || 'N/A',
            traceUrl: `/trace/${l.batchId}`,

            cropImageUrl: l.cropImageUrl ? `${BASE_IMAGE_URL}${l.cropImageUrl}` : 'assets/placeholder.png'
          }));
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.products = [];
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.filteredProducts = this.products
      .filter(p => p.cropName.toLowerCase().includes(this.search.toLowerCase()))
      .filter(p => this.minPrice !== null ? p.price >= this.minPrice : true)
      .filter(p => this.maxPrice !== null ? p.price <= this.maxPrice : true)
      .sort((a, b) => {
        switch (this.sortBy) {
          case 'PRICE_ASC': return a.price - b.price;
          case 'PRICE_DESC': return b.price - a.price;
          case 'QTY_ASC': return a.quantity - b.quantity;
          case 'QTY_DESC': return b.quantity - a.quantity;
          default: return 0;
        }
      });
  }

  buyNow(product: any) {
    const role = localStorage.getItem('userRole');
    if (role !== 'BUYER') {
      alert('Please login as a buyer');
      return;
    }
    this.selectedProduct = product;
    this.checkoutForm.patchValue({ quantity: 1 });
  }

  closeCheckout() {
    this.selectedProduct = null;
    this.checkoutForm.reset({ quantity: 1 });
  }

  placeOrder() {
    if (!this.selectedProduct || this.checkoutForm.invalid) return;

    const consumerId = localStorage.getItem('buyerId') || localStorage.getItem('userId');
    const { quantity, address, contact } = this.checkoutForm.value;

    this.http.post<any>(
      'http://localhost:8080/api/orders/place',
      null,
      {
        params: {
          listingId: this.selectedProduct.listingId,
          consumerId: consumerId!,
          quantity,
          deliveryAddress: address,
          contactNumber: contact
        }
      }
    ).subscribe({
      next: res => {
        alert(`✅ Order placed!\nOrder ID: ${res.orderId}`);
        this.closeCheckout();
        this.fetchProducts();
      },
      error: () => alert('❌ Order failed')
    });
  }

  openTrace(url: string) {
    window.open(url, '_blank');
  }

  addToCart(product: any) {
    const role = localStorage.getItem('userRole');
    if (role !== 'BUYER') {
      alert('Please login as a buyer');
      return;
    }

    const existing = this.cart.find(i => i.listingId === product.listingId);
    if (existing) existing.quantity += 1;
    else this.cart.push({ ...product, quantity: 1 });

    localStorage.setItem('cart', JSON.stringify(this.cart));
    alert(`🛒 ${product.cropName} added to cart`);
  }

}
