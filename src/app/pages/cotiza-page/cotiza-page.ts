import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { CotizaWizardStore, type ServiceTypeOption } from './cotiza-wizard.store';

@Component({
  selector: 'app-cotiza-page',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  providers: [CotizaWizardStore],
  templateUrl: './cotiza-page.html',
  styleUrl: './cotiza-page.css',
})
export class CotizaPageComponent {
  protected readonly wizard = inject(CotizaWizardStore);
  private readonly translate = inject(TranslateService);

  protected readonly computerIconUrl = '/img/svg/computer.svg';
  protected readonly gearIconUrl = '/img/svg/gear.svg';
  protected readonly chipIconUrl = '/img/svg/chip.svg';

  protected readonly faceSmileIconUrl = '/img/svg/face-smile.svg';
  protected readonly globeIconUrl = '/img/svg/globe-alt.svg';
  protected readonly buildingIconUrl = '/img/svg/building.svg';
  protected readonly chartIconUrl = '/img/svg/chart-icon.svg';

  protected readonly clipboardIconUrl = '/img/svg/clipboard.svg';
  protected readonly databaseIconUrl = '/img/svg/database.svg';
  protected readonly creditCardIconUrl = '/img/svg/credit-card.svg';
  protected readonly codeIconUrl = '/img/svg/code-icon.svg';

  protected readonly stepServiceOptions: ServiceTypeOption[] = [
    {
      type: 'website',
      labelKey: 'cotizaPage.serviceType.options.website',
      icon: this.computerIconUrl,
      color: '#7B61FF',
    },
    {
      type: 'webApp',
      labelKey: 'cotizaPage.serviceType.options.webApp',
      icon: this.gearIconUrl,
      color: '#00D1FF',
    },
    {
      type: 'aiImplementation',
      labelKey: 'cotizaPage.serviceType.options.aiImplementation',
      icon: this.chipIconUrl,
      color: '#009EC2',
    },
  ];

  protected readonly stepCompanySizeOptions: ServiceTypeOption[] = [
    {
      type: 'solo-founder',
      labelKey: 'cotizaPage.companySize.options.soloFounder',
      icon: this.faceSmileIconUrl,
      color: '#A78BFA',
    },
    {
      type: 'small-startup',
      labelKey: 'cotizaPage.companySize.options.smallStartup',
      icon: this.chartIconUrl,
      color: '#38BDF8',
    },
    {
      type: 'medium-business',
      labelKey: 'cotizaPage.companySize.options.mediumBusiness',
      icon: this.buildingIconUrl,
      color: '#34D399',
    },
    {
      type: 'large-business',
      labelKey: 'cotizaPage.companySize.options.largeBusiness',
      icon: this.globeIconUrl,
      color: '#FBBF24',
    },
  ];

  protected readonly stepBudgetOptions: ServiceTypeOption[] = [
    {
      type: 'budget-500-2500',
      labelKey: 'cotizaPage.budget.options.tier1',
      icon: this.clipboardIconUrl,
      color: '#94A3B8',
    },
    {
      type: 'budget-2500-7000',
      labelKey: 'cotizaPage.budget.options.tier2',
      icon: this.databaseIconUrl,
      color: '#22D3EE',
    },
    {
      type: 'budget-7000-15000',
      labelKey: 'cotizaPage.budget.options.tier3',
      icon: this.creditCardIconUrl,
      color: '#A78BFA',
    },
    {
      type: 'budget-15000-plus',
      labelKey: 'cotizaPage.budget.options.tier4',
      icon: this.codeIconUrl,
      color: '#34D399',
    },
  ];

  protected readonly stepApiBinaryOptions: ServiceTypeOption[] = [
    {
      type: 'api-yes',
      labelKey: 'cotizaPage.apiIntegration.yes',
      icon: this.chipIconUrl,
      color: '#34D399',
    },
    {
      type: 'api-no',
      labelKey: 'cotizaPage.apiIntegration.no',
      icon: this.gearIconUrl,
      color: '#94A3B8',
    },
  ];

  protected readonly stepAgreementOptions: ServiceTypeOption[] = [
    {
      type: 'agreement-aware',
      labelKey: 'cotizaPage.agreementBeforeContinue.options.aware',
      icon: this.faceSmileIconUrl,
      color: '#34D399',
    },
    {
      type: 'agreement-full-service',
      labelKey: 'cotizaPage.agreementBeforeContinue.options.fullService',
      icon: this.buildingIconUrl,
      color: '#38BDF8',
    },
  ];

  /**
   * Temporal: hasta conectar el backend. Vuelca todo lo recolectado en consola y pasa al paso final.
   */
  protected submitQuote(): void {
    const w = this.wizard;
    if (!w.contactStepValid()) {
      return;
    }

    const datos = {
      ...w.snapshot(),
      emailSubject: this.translate.instant('cotizaPage.contact.emailSubject'),
      emailBodyPlainText: w.buildQuoteEmailBody(),
    };

    console.log('[cotiza] datos recolectados (pendiente POST al backend)', datos);

    w.completeSubmission();
  }
}
