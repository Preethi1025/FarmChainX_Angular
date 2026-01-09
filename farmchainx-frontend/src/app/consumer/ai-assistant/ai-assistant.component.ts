import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SimpleAIService } from '../../core/services/simple-ai.service'; // NEW

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ai-assistant.component.html',
  styleUrls: ['./ai-assistant.component.css']
})
export class AIAssistantComponent {
  cropForm: FormGroup;
  response: any = null;
  loading = false;
  error = '';

  exampleCrops = [
    { name: 'Wheat', emoji: '🌾' },
    { name: 'Rice', emoji: '🌾' },
    { name: 'Tomato', emoji: '🍅' },
    { name: 'Potato', emoji: '🥔' },
    { name: 'Apple', emoji: '🍎' },
    { name: 'Banana', emoji: '🍌' }
  ];

  constructor(
    private fb: FormBuilder,
    private aiService: SimpleAIService // NEW
  ) {
    this.cropForm = this.fb.group({
      cropName: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.cropForm.invalid || this.loading) return;

    const cropName = this.cropForm.get('cropName')?.value;
    this.getCropInfo(cropName);
  }

  getCropInfo(cropName: string): void {
    this.loading = true;
    this.error = '';
    this.response = null;

    console.log('🚀 Requesting AI for:', cropName);

    this.aiService.getFarmingGuide(cropName).subscribe({
      next: (res) => {
        console.log('📦 Response:', res);
        this.response = res;
        this.cropForm.reset();
      },
      error: (err) => {
        console.error('💥 Error:', err);
        this.error = 'Failed to get AI response. Please try again.';
        this.response = this.getFallbackData(cropName);
      },
      complete: () => {
        this.loading = false;
        console.log('✅ Request completed');
      }
    });
  }

  selectExampleCrop(crop: string): void {
    this.cropForm.patchValue({ cropName: crop });
    this.getCropInfo(crop);
  }

  private getFallbackData(cropName: string): any {
    return {
      cropName: cropName,
      success: false,
      message: 'Connection failed. Using local data.',
      data: {
        TYPE: 'Crop',
        MESSAGE: 'Try again or check your internet connection'
      }
    };
  }
}