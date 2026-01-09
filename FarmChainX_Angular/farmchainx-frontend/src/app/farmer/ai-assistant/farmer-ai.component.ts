import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FarmerAIService } from '../../core/services/farmer-ai.service';

@Component({
  selector: 'app-farmer-ai',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './farmer-ai.component.html',
  styleUrls: ['./farmer-ai.component.css']
})
export class FarmerAIComponent {
  cropForm: FormGroup;
  guide: any = null;
  loading = false;
  error = '';
  
  popularCrops = [
    { name: 'Rice', icon: '🌾', color: 'bg-green-100' },
    { name: 'Wheat', icon: '🌾', color: 'bg-amber-100' },
    { name: 'Tomato', icon: '🍅', color: 'bg-red-100' },
    { name: 'Potato', icon: '🥔', color: 'bg-purple-100' },
    { name: 'Cotton', icon: '🧵', color: 'bg-white' },
    { name: 'Sugarcane', icon: '🎋', color: 'bg-green-50' },
    { name: 'Maize', icon: '🌽', color: 'bg-yellow-100' },
    { name: 'Soybean', icon: '🫘', color: 'bg-brown-100' }
  ];

  constructor(
    private fb: FormBuilder,
    private farmerAI: FarmerAIService
  ) {
    this.cropForm = this.fb.group({
      cropName: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.cropForm.invalid || this.loading) return;
    
    const cropName = this.cropForm.get('cropName')?.value;
    this.getFarmingGuide(cropName);
  }

  getFarmingGuide(cropName: string): void {
    this.loading = true;
    this.error = '';
    this.guide = null;

    console.log('🌾 Requesting AI farming guide for:', cropName);

    this.farmerAI.getFarmingGuide(cropName).subscribe({
      next: (res) => {
        console.log('📘 Farming Guide Received:', res);
        this.guide = res;
        this.cropForm.reset();
      },
      error: (err) => {
        console.error('💥 Error:', err);
        this.error = 'Failed to connect to AI service. Please try again or use popular crops.';
        this.guide = this.getFallbackGuide(cropName);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  selectCrop(cropName: string): void {
    this.cropForm.patchValue({ cropName: cropName });
    this.getFarmingGuide(cropName);
  }

  private getFallbackGuide(cropName: string): any {
    return {
      cropName: cropName,
      success: false,
      message: 'Using local farming knowledge',
      data: {
        crop_name: cropName,
        message: 'AI service temporarily unavailable. Try popular crops for detailed information.'
      }
    };
  }
}