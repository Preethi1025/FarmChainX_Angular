import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-simple-ai',
  standalone: true,
  imports: [CommonModule],
  template: '<h1 class="p-8 text-green-700">✅ Simple AI Component Works!</h1>'
})
export class SimpleAiComponent {}