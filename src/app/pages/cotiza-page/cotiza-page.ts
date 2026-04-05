import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';

import {
  COTIZA_COMPANY_INBOX_EMAIL,
  COTIZA_QUOTE_API_KEY,
  COTIZA_QUOTE_API_URL,
  COTIZA_WEB3FORMS_ACCESS_KEY,
} from './cotiza-email.config';

const QUOTE_API_CONFIGURED = COTIZA_QUOTE_API_URL.trim() !== '';
const WEB3FORMS_CONFIGURED = COTIZA_WEB3FORMS_ACCESS_KEY.trim() !== '';

type ServiceTypeOption = {
  type: string;
  labelKey: string;
  icon: string;
  color?: string;
};

type ApiIntegrationChoice = 'yes' | 'no';

const WIZARD_SESSION_KEY = 'tc-cotiza-wizard-v4';

type WizardDraft = {
  passed: number;
  selections: Record<number, ServiceTypeOption>;
  detailsText?: string;
  featuresText?: string;
  apiIntegrationChoice?: ApiIntegrationChoice | null;
  apiRequirementsText?: string;
  referenceUrls?: string[];
  contactFirstName?: string;
  contactLastName?: string;
  contactEmail?: string;
  contactPhone?: string;
};

@Component({
  selector: 'app-cotiza-page',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './cotiza-page.html',
  styleUrl: './cotiza-page.css',
})
export class CotizaPageComponent {
  protected readonly quoteApiConfigured = QUOTE_API_CONFIGURED;
  protected readonly web3formsConfigured = WEB3FORMS_CONFIGURED;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
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

  /** Orden: clipboard → database → tarjeta → código. Rangos en USD. */
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

  protected readonly passed = signal(0);

  /** Elecciones confirmadas por paso (también se actualiza al elegir opción en el paso actual). */
  protected readonly selectionsByStep = signal<Record<number, ServiceTypeOption>>({});

  protected readonly sectionTypeButton = signal(false);

  protected readonly selectedServiceType = signal<ServiceTypeOption | null>(null);

  /** Texto libre del paso “cuéntanos qué necesitas”. */
  protected readonly projectDetailsText = signal('');

  protected onDetailsInput(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    this.projectDetailsText.set(el.value);
  }

  /** Texto libre: funcionalidades que necesita el proyecto. */
  protected readonly projectFeaturesText = signal('');

  protected onFeaturesInput(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    this.projectFeaturesText.set(el.value);
  }

  protected readonly apiIntegrationChoice = signal<ApiIntegrationChoice | null>(null);
  protected readonly apiRequirementsText = signal('');
  protected readonly referenceUrls = signal<string[]>(['', '', '']);

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

  protected pickApiIntegration(choice: ApiIntegrationChoice, event: Event): void {
    if (this.apiIntegrationChoice() === choice) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.apiIntegrationChoice.set(choice);
    if (choice === 'no') {
      this.apiRequirementsText.set('');
    }
  }

  protected isApiChoiceChecked(choice: ApiIntegrationChoice): boolean {
    return this.apiIntegrationChoice() === choice;
  }

  protected onApiRequirementsInput(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    this.apiRequirementsText.set(el.value);
  }

  protected onReferenceUrlInput(index: number, event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.referenceUrls.update((arr) => {
      const next = [...arr];
      next[index] = v;
      return next;
    });
  }

  protected readonly contactFirstName = signal('');
  protected readonly contactLastName = signal('');
  protected readonly contactEmail = signal('');
  protected readonly contactPhone = signal('');
  protected readonly submitLoading = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly contactStepValid = computed(() => {
    const email = this.contactEmail().trim();
    const phone = this.contactPhone().trim();
    if (!this.contactFirstName().trim() || !this.contactLastName().trim() || !email || !phone) {
      return false;
    }
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && phone.length >= 6;
  });

  protected onContactFirstNameInput(event: Event): void {
    this.contactFirstName.set((event.target as HTMLInputElement).value);
  }

  protected onContactLastNameInput(event: Event): void {
    this.contactLastName.set((event.target as HTMLInputElement).value);
  }

  protected onContactEmailInput(event: Event): void {
    this.contactEmail.set((event.target as HTMLInputElement).value);
  }

  protected onContactPhoneInput(event: Event): void {
    this.contactPhone.set((event.target as HTMLInputElement).value);
  }

  protected submitQuote(): void {
    if (!this.contactStepValid() || this.submitLoading()) {
      return;
    }
    this.submitError.set(null);
    this.submitLoading.set(true);
    const bodyText = this.buildQuoteEmailBody();
    const subject = this.translate.instant('cotizaPage.contact.emailSubject');

    if (QUOTE_API_CONFIGURED) {
      const base = COTIZA_QUOTE_API_URL.trim().replace(/\/$/, '');
      const headers: Record<string, string> = {};
      const apiKey = COTIZA_QUOTE_API_KEY.trim();
      if (apiKey) {
        headers['x-quote-api-key'] = apiKey;
      }
      this.http
        .post<{ success?: boolean }>(
          `${base}/send-quote`,
          {
            subject,
            text: bodyText,
            replyTo: this.contactEmail().trim(),
            fromName: `${this.contactFirstName().trim()} ${this.contactLastName().trim()}`,
            phone: this.contactPhone().trim(),
          },
          { headers },
        )
        .pipe(finalize(() => this.submitLoading.set(false)))
        .subscribe({
          next: (res) => {
            if (res?.success) {
              this.onQuoteSubmitSuccess();
            } else {
              this.submitError.set(this.translate.instant('cotizaPage.contact.submitError'));
            }
          },
          error: () => {
            this.submitError.set(this.translate.instant('cotizaPage.contact.submitError'));
          },
        });
      return;
    }

    if (WEB3FORMS_CONFIGURED) {
      this.http
        .post<{ success?: boolean }>('https://api.web3forms.com/submit', {
          access_key: COTIZA_WEB3FORMS_ACCESS_KEY.trim(),
          subject,
          name: `${this.contactFirstName().trim()} ${this.contactLastName().trim()}`,
          email: this.contactEmail().trim(),
          phone: this.contactPhone().trim(),
          message: bodyText,
        })
        .pipe(finalize(() => this.submitLoading.set(false)))
        .subscribe({
          next: (res) => {
            if (res?.success) {
              this.onQuoteSubmitSuccess();
            } else {
              this.submitError.set(this.translate.instant('cotizaPage.contact.submitError'));
            }
          },
          error: () => {
            this.submitError.set(this.translate.instant('cotizaPage.contact.submitError'));
          },
        });
      return;
    }

    const to = COTIZA_COMPANY_INBOX_EMAIL.trim() || 'contacto@example.com';
    const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText.slice(0, 1900))}`;
    this.submitLoading.set(false);
    window.location.href = mailto;
    this.onQuoteSubmitSuccess();
  }

  private buildQuoteEmailBody(): string {
    const t = (k: string) => this.translate.instant(k);
    const sel = this.selectionsByStep();
    const lines: string[] = [];

    const opt = (step: number) => {
      const o = sel[step];
      return o ? t(o.labelKey) : '';
    };

    lines.push('--- ' + t('cotizaPage.title') + ' ---');
    lines.push('');
    lines.push(`${t('cotizaPage.contact.firstName')} / ${t('cotizaPage.contact.lastName')}: ${this.contactFirstName().trim()} ${this.contactLastName().trim()}`);
    lines.push(`${t('cotizaPage.contact.email')}: ${this.contactEmail().trim()}`);
    lines.push(`${t('cotizaPage.contact.phone')}: ${this.contactPhone().trim()}`);
    lines.push('');
    lines.push(`${t('cotizaPage.serviceType.title')}: ${opt(0)}`);
    lines.push(`${t('cotizaPage.companySize.title')}: ${opt(1)}`);
    lines.push(`${t('cotizaPage.budget.title')}: ${opt(2)}`);
    lines.push('');
    lines.push(`${t('cotizaPage.details.title')}:`);
    lines.push(this.projectDetailsText().trim() || '—');
    lines.push('');
    lines.push(`${t('cotizaPage.features.title')}:`);
    lines.push(this.projectFeaturesText().trim() || '—');
    lines.push('');
    const api = this.apiIntegrationChoice();
    lines.push(`${t('cotizaPage.apiIntegration.title')} ${api === 'yes' ? t('cotizaPage.apiIntegration.yes') : api === 'no' ? t('cotizaPage.apiIntegration.no') : '—'}`);
    if (api === 'yes') {
      lines.push(this.apiRequirementsText().trim() || '—');
    }
    lines.push('');
    lines.push(`${t('cotizaPage.references.title')} / URLs:`);
    this.referenceUrls().forEach((u, i) => {
      if (u.trim()) {
        lines.push(`  ${i + 1}. ${u.trim()}`);
      }
    });
    if (!this.referenceUrls().some((u) => u.trim())) {
      lines.push('—');
    }
    lines.push('');
    const agr = sel[7];
    lines.push(`${t('cotizaPage.agreementBeforeContinue.title')}: ${agr ? t(agr.labelKey) : '—'}`);
    lines.push('');
    return lines.join('\n');
  }

  private onQuoteSubmitSuccess(): void {
    this.passed.set(9);
    this.applySelectionForCurrentStep();
  }

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadDraftFromSession();
    }

    effect(() => {
      const pass = this.passed();
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      if (pass >= 9) {
        try {
          sessionStorage.removeItem(WIZARD_SESSION_KEY);
        } catch {
          /* ignore */
        }
        return;
      }
      const draft: WizardDraft = {
        passed: pass,
        selections: this.selectionsByStep(),
        detailsText: this.projectDetailsText(),
        featuresText: this.projectFeaturesText(),
        apiIntegrationChoice: this.apiIntegrationChoice(),
        apiRequirementsText: this.apiRequirementsText(),
        referenceUrls: this.referenceUrls(),
        contactFirstName: this.contactFirstName(),
        contactLastName: this.contactLastName(),
        contactEmail: this.contactEmail(),
        contactPhone: this.contactPhone(),
      };
      try {
        sessionStorage.setItem(WIZARD_SESSION_KEY, JSON.stringify(draft));
      } catch {
        /* ignore quota / private mode */
      }
    });
  }

  private loadDraftFromSession(): void {
    try {
      const raw = sessionStorage.getItem(WIZARD_SESSION_KEY);
      if (!raw) {
        return;
      }
      const data = JSON.parse(raw) as Partial<WizardDraft>;
      if (typeof data.passed !== 'number' || !data.selections || typeof data.selections !== 'object') {
        return;
      }
      const p = Math.min(9, Math.max(0, Math.floor(data.passed)));
      this.passed.set(p);
      this.selectionsByStep.set({ ...data.selections });
      if (typeof data.detailsText === 'string') {
        this.projectDetailsText.set(data.detailsText);
      }
      if (typeof data.featuresText === 'string') {
        this.projectFeaturesText.set(data.featuresText);
      }
      if (data.apiIntegrationChoice === 'yes' || data.apiIntegrationChoice === 'no') {
        this.apiIntegrationChoice.set(data.apiIntegrationChoice);
      }
      if (typeof data.apiRequirementsText === 'string') {
        this.apiRequirementsText.set(data.apiRequirementsText);
      }
      if (Array.isArray(data.referenceUrls)) {
        const urls = data.referenceUrls.map((u) => (typeof u === 'string' ? u : ''));
        while (urls.length < 3) {
          urls.push('');
        }
        this.referenceUrls.set(urls.slice(0, 3));
      }
      if (typeof data.contactFirstName === 'string') {
        this.contactFirstName.set(data.contactFirstName);
      }
      if (typeof data.contactLastName === 'string') {
        this.contactLastName.set(data.contactLastName);
      }
      if (typeof data.contactEmail === 'string') {
        this.contactEmail.set(data.contactEmail);
      }
      if (typeof data.contactPhone === 'string') {
        this.contactPhone.set(data.contactPhone);
      }
      this.applySelectionForCurrentStep();
    } catch {
      /* ignore */
    }
  }

  /** Restaura la UI del paso actual según lo guardado en `selectionsByStep`. */
  private applySelectionForCurrentStep(): void {
    const step = this.passed();
    if (step >= 9) {
      this.selectedServiceType.set(null);
      this.sectionTypeButton.set(false);
      return;
    }
    if (step === 8) {
      this.selectedServiceType.set(null);
      this.sectionTypeButton.set(false);
      return;
    }
    if (step === 7) {
      const saved = this.selectionsByStep()[7];
      this.selectedServiceType.set(saved ?? null);
      this.sectionTypeButton.set(!!saved);
      return;
    }
    if (step === 5) {
      this.selectedServiceType.set(null);
      this.sectionTypeButton.set(false);
      return;
    }
    if (step === 6) {
      this.selectedServiceType.set(null);
      this.sectionTypeButton.set(true);
      return;
    }
    if (step === 3 || step === 4) {
      this.selectedServiceType.set(null);
      this.sectionTypeButton.set(true);
      return;
    }
    const saved = this.selectionsByStep()[step];
    this.selectedServiceType.set(saved ?? null);
    this.sectionTypeButton.set(!!saved);
  }

  protected toggleServiceType(service: ServiceTypeOption, event: Event): void {
    const isSelected = this.selectedServiceType()?.type === service.type;
    const step = this.passed();

    if (isSelected) {
      event.preventDefault();
      this.selectedServiceType.set(null);
      this.sectionTypeButton.set(false);
      this.selectionsByStep.update((prev) => {
        const next = { ...prev };
        delete next[step];
        return next;
      });
      return;
    }

    this.selectedServiceType.set(service);
    this.sectionTypeButton.set(true);
    this.selectionsByStep.update((prev) => ({ ...prev, [step]: service }));
  }

  protected nextPassed(): void {
    const step = this.passed();
    const selected = this.selectedServiceType();
    if (selected) {
      this.selectionsByStep.update((prev) => ({ ...prev, [step]: selected }));
    }

    this.selectedServiceType.set(null);
    this.sectionTypeButton.set(false);
    this.passed.update((p) => p + 1);
    this.applySelectionForCurrentStep();
  }

  protected previousPassed(): void {
    const p = this.passed();
    if (p <= 0) {
      return;
    }
    this.passed.set(p - 1);
    this.applySelectionForCurrentStep();
  }
}
