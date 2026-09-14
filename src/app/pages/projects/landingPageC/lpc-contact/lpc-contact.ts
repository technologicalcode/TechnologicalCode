import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-lpc-contact',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './lpc-contact.html',
  styleUrl: './lpc-contact.scss',
})
export class LpcContactComponent {
  private readonly fb = inject(FormBuilder);

  protected readonly sending = signal(false);
  protected readonly sent = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    message: ['', [Validators.required, Validators.minLength(12)]],
  });

  protected invalid(name: 'name' | 'email' | 'message'): boolean {
    const c = this.form.controls[name];
    return c.invalid && c.touched;
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.sending.set(true);
    // Envío simulado: sin backend. Ajusta el delay si quieres otro tempo.
    await new Promise((r) => setTimeout(r, 750));
    this.sending.set(false);
    this.sent.set(true);
    this.form.reset();
  }
}
