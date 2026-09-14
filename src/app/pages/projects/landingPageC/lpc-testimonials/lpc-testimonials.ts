import { Component, signal } from '@angular/core';

type Quote = { name: string; role: string; text: string };

@Component({
  selector: 'app-lpc-testimonials',
  standalone: true,
  templateUrl: './lpc-testimonials.html',
  styleUrl: './lpc-testimonials.scss',
})
export class LpcTestimonialsComponent {
  protected readonly quotes: Quote[] = [
    {
      name: 'Lucía Mendoza',
      role: 'Casa en La Molina',
      text: 'Entendieron cómo vivimos. La casa no parece un showroom: se usa, se llena de gente y sigue viéndose serena.',
    },
    {
      name: 'Diego Salazar',
      role: 'Café en Barranco',
      text: 'El local se llena y el flujo funciona. Pedimos un espacio que se fotografíe solo. Eso entregaron.',
    },
    {
      name: 'Ana Torres',
      role: 'Remodelación en Miraflores',
      text: 'La dirección de obra evitó el clásico “en el plano era distinto”. Cada visita valió la pena.',
    },
  ];

  protected readonly index = signal(0);

  protected next(): void {
    this.index.update((i) => (i + 1) % this.quotes.length);
  }

  protected prev(): void {
    this.index.update((i) => (i - 1 + this.quotes.length) % this.quotes.length);
  }
}
