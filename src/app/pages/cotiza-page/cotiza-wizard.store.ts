import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type ServiceTypeOption = {
  type: string;
  labelKey: string;
  icon: string;
  color?: string;
};

export type ApiIntegrationChoice = 'yes' | 'no';

const WIZARD_SESSION_KEY = 'tc-cotiza-wizard-v4';

export type WizardDraft = {
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

/**
 * Estado plano de todo el recorrido (wizard + contacto). Útil para logs o POST estructurado a Nest.
 * Equivale a las señales del store: `snapshot()` devuelve este objeto.
 */
export type CotizaWizardSnapshot = {
  passed: number;
  selectionsByStep: Record<number, ServiceTypeOption>;
  projectDetailsText: string;
  projectFeaturesText: string;
  apiIntegrationChoice: ApiIntegrationChoice | null;
  apiRequirementsText: string;
  referenceUrls: string[];
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
};

/**
 * Store local del formulario de cotización: una instancia por visita a la página
 * (provisto en `CotizaPageComponent`). Persiste en `sessionStorage` mientras `passed < 9`.
 *
 * **Variables (señales) del recorrido:**
 * - `passed` — paso visible 0…9
 * - `selectionsByStep` — opciones guardadas por paso (0 servicio, 1 empresa, 2 presupuesto, 7 acuerdo)
 * - `sectionTypeButton` / `selectedServiceType` — UI del paso actual (selección + continuar)
 * - `projectDetailsText`, `projectFeaturesText` — textos libres
 * - `apiIntegrationChoice`, `apiRequirementsText` — paso API
 * - `referenceUrls` — hasta 3 URLs
 * - `contactFirstName`, `contactLastName`, `contactEmail`, `contactPhone` — contacto
 * - `contactStepValid` — computed (formulario contacto válido)
 */
@Injectable()
export class CotizaWizardStore {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly translate = inject(TranslateService);

  /** Índice del paso visible (0…9). */
  readonly passed = signal(0);

  /** Opciones elegidas por paso (claves 0,1,2,7 para servicio, empresa, presupuesto, acuerdo). */
  readonly selectionsByStep = signal<Record<number, ServiceTypeOption>>({});

  /** Habilita el botón Continuar en pasos con selección única. */
  readonly sectionTypeButton = signal(false);

  /** Selección temporal en el paso actual (antes de confirmar con Continuar). */
  readonly selectedServiceType = signal<ServiceTypeOption | null>(null);

  readonly projectDetailsText = signal('');
  readonly projectFeaturesText = signal('');

  readonly apiIntegrationChoice = signal<ApiIntegrationChoice | null>(null);
  readonly apiRequirementsText = signal('');
  readonly referenceUrls = signal<string[]>(['', '', '']);

  readonly contactFirstName = signal('');
  readonly contactLastName = signal('');
  readonly contactEmail = signal('');
  readonly contactPhone = signal('');

  readonly contactStepValid = computed(() => {
    const email = this.contactEmail().trim();
    const phone = this.contactPhone().trim();
    if (!this.contactFirstName().trim() || !this.contactLastName().trim() || !email || !phone) {
      return false;
    }
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && phone.length >= 6;
  });

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
        /* ignore */
      }
    });
  }

  /** Copia de lectura de todo el estado del formulario. */
  snapshot(): CotizaWizardSnapshot {
    return {
      passed: this.passed(),
      selectionsByStep: { ...this.selectionsByStep() },
      projectDetailsText: this.projectDetailsText(),
      projectFeaturesText: this.projectFeaturesText(),
      apiIntegrationChoice: this.apiIntegrationChoice(),
      apiRequirementsText: this.apiRequirementsText(),
      referenceUrls: [...this.referenceUrls()],
      contactFirstName: this.contactFirstName(),
      contactLastName: this.contactLastName(),
      contactEmail: this.contactEmail(),
      contactPhone: this.contactPhone(),
    };
  }

  onDetailsInput(event: Event): void {
    this.projectDetailsText.set((event.target as HTMLTextAreaElement).value);
  }

  onFeaturesInput(event: Event): void {
    this.projectFeaturesText.set((event.target as HTMLTextAreaElement).value);
  }

  pickApiIntegration(choice: ApiIntegrationChoice, event: Event): void {
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

  isApiChoiceChecked(choice: ApiIntegrationChoice): boolean {
    return this.apiIntegrationChoice() === choice;
  }

  onApiRequirementsInput(event: Event): void {
    this.apiRequirementsText.set((event.target as HTMLTextAreaElement).value);
  }

  onReferenceUrlInput(index: number, event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.referenceUrls.update((arr) => {
      const next = [...arr];
      next[index] = v;
      return next;
    });
  }

  onContactFirstNameInput(event: Event): void {
    this.contactFirstName.set((event.target as HTMLInputElement).value);
  }

  onContactLastNameInput(event: Event): void {
    this.contactLastName.set((event.target as HTMLInputElement).value);
  }

  onContactEmailInput(event: Event): void {
    this.contactEmail.set((event.target as HTMLInputElement).value);
  }

  onContactPhoneInput(event: Event): void {
    this.contactPhone.set((event.target as HTMLInputElement).value);
  }

  toggleServiceType(service: ServiceTypeOption, event: Event): void {
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

  nextPassed(): void {
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

  previousPassed(): void {
    const p = this.passed();
    if (p <= 0) {
      return;
    }
    this.passed.set(p - 1);
    this.applySelectionForCurrentStep();
  }

  /** Cierra el wizard en la pantalla final. */
  completeSubmission(): void {
    this.passed.set(9);
    this.applySelectionForCurrentStep();
  }

  buildQuoteEmailBody(): string {
    const t = (k: string) => this.translate.instant(k);
    const sel = this.selectionsByStep();
    const lines: string[] = [];

    const opt = (step: number) => {
      const o = sel[step];
      return o ? t(o.labelKey) : '';
    };

    lines.push('--- ' + t('cotizaPage.title') + ' ---');
    lines.push('');
    lines.push(
      `${t('cotizaPage.contact.firstName')} / ${t('cotizaPage.contact.lastName')}: ${this.contactFirstName().trim()} ${this.contactLastName().trim()}`,
    );
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
    lines.push(
      `${t('cotizaPage.apiIntegration.title')} ${api === 'yes' ? t('cotizaPage.apiIntegration.yes') : api === 'no' ? t('cotizaPage.apiIntegration.no') : '—'}`,
    );
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
}
