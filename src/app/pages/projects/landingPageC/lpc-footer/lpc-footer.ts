import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-lpc-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './lpc-footer.html',
  styleUrl: './lpc-footer.scss',
})
export class LpcFooterComponent {}
