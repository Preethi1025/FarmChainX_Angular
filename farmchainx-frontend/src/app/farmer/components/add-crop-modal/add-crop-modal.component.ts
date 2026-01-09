import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-crop-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-crop-modal.component.html'
})
export class AddCropModalComponent {

  @Input() farmerId!: string; 
  @Output() close = new EventEmitter<void>();
  @Output() cropAdded = new EventEmitter<void>();

  loading = false;
  success = false;
  error = '';

  cropImage: File | null = null;
  previewUrl: string | null = null;

  generatedBatchId = '';
  qrValue = '';

  cropTypes = [
    'TOMATO','WHEAT','RICE','POTATO','CORN','CARROT',
    'LETTUCE','SPINACH','ONION','GARLIC','CUCUMBER',
    'PEPPER','EGGPLANT','BEANS','PEAS','OTHER'
  ];

  form: any = {
    cropName: '',
    cropType: '',
    variety: '',
    sowDate: '',
    expectedHarvestDate: '',
    location: '',
    estimatedYield: '',
    price: '',
    quantity: ''
  };

  constructor(private http: HttpClient) {}

  /* ---------------- IMAGE ---------------- */

  onFileChange(e: any) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.error = 'Image must be under 5MB';
      return;
    }

    this.cropImage = file;
    this.previewUrl = URL.createObjectURL(file);
  }

  /* ---------------- VALIDATION ---------------- */

  validate(): boolean {
    if (!this.form.cropName.trim()) return this.fail('Crop name is required');
    if (!this.form.cropType) return this.fail('Crop type is required');
    if (!this.form.sowDate) return this.fail('Sow date is required');
    if (!this.form.location.trim()) return this.fail('Location is required');
    if (!this.form.price) return this.fail('Price is required');
    if (!this.form.quantity) return this.fail('Quantity is required');
    return true;
  }

  fail(msg: string): boolean {
    this.error = msg;
    return false;
  }

  /* ---------------- SUBMIT ---------------- */

  submit() {
  if (!this.validate()) return;

  this.loading = true;
  this.error = '';

  const cropData = {
    farmerId: this.farmerId,
    cropName: this.form.cropName.trim(),
    cropType: this.form.cropType,
    variety: this.form.variety || null,
    sowDate: this.form.sowDate,
    expectedHarvestDate: this.form.expectedHarvestDate || null,
    location: this.form.location.trim(),
    estimatedYield: this.form.estimatedYield || null,
    price: this.form.price,
    quantity: this.form.quantity
  };

  const payload = new FormData();
  payload.append(
    'crop',
    new Blob([JSON.stringify(cropData)], { type: 'application/json' })
  );

  if (this.cropImage) {
    payload.append('image', this.cropImage);
  }

  this.http.post<any>(
    'http://localhost:8080/api/crops/add-with-image',
    payload
  ).subscribe({
    next: (res) => {
      this.generatedBatchId = res.batchId;
      this.qrValue = `${window.location.origin}/trace/${res.batchId}`;
      this.success = true;
      this.cropAdded.emit();
    },
    error: (err) => {
      console.error(err);
      this.error = err?.error?.error || 'Failed to add crop';
      this.loading = false;
    },
    complete: () => {
      this.loading = false;
    }
  });
}



  reset() {
    this.success = false;
    this.form = {
      cropName: '',
      cropType: '',
      variety: '',
      sowDate: '',
      expectedHarvestDate: '',
      location: '',
      estimatedYield: '',
      price: '',
      quantity: ''
    };
    this.previewUrl = null;
    this.cropImage = null;
    this.error = '';
  }

  closeModal() {
    this.close.emit();
  }
}
