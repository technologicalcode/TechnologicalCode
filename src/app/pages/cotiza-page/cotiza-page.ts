import { Component, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

type ServiceTypeOption = {
  type: string;
  labelKey: string;
  icon: string;
};

@Component({
  selector: 'app-cotiza-page',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './cotiza-page.html',
  styleUrl: './cotiza-page.css',
})
export class CotizaPageComponent {
  protected readonly computerIconUrl = '/img/svg/computer.svg';
  protected readonly gearIconUrl = '/img/svg/gear.svg';
  protected readonly chipIconUrl = '/img/svg/chip.svg';

  protected readonly sectionTypeButton = signal<boolean>(false);
  protected readonly servicesType = signal<ServiceTypeOption[]>([
    {
      type: 'website',
      labelKey: 'cotizaPage.serviceType.options.website',
      icon: this.computerIconUrl,
    },
    {
      type: 'webApp',
      labelKey: 'cotizaPage.serviceType.options.webApp',
      icon: this.gearIconUrl,
    },
    {
      type: 'aiImplementation',
      labelKey: 'cotizaPage.serviceType.options.aiImplementation',
      icon: this.chipIconUrl,
    },
  ]);

  protected readonly selectedServiceType = signal<ServiceTypeOption | null>(null);

  protected toggleServiceType(service: ServiceTypeOption, event: Event): void {
    const isSelected = this.selectedServiceType()?.type === service.type;

    if (isSelected) {
      event.preventDefault();
      this.selectedServiceType.set(null);
      this.sectionTypeButton.set(false);
      return;
    }

    this.selectedServiceType.set(service);
    this.sectionTypeButton.set(true);
  }
}
