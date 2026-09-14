import { Component } from '@angular/core';

@Component({
  selector: 'app-lpc-wa-float',
  standalone: true,
  templateUrl: './lpc-wa-float.html',
  styleUrl: './lpc-wa-float.scss',
})
export class LpcWaFloatComponent {
  protected readonly href =
    'https://wa.me/51955550123?text=Hola,%20quiero%20más%20información';
}
