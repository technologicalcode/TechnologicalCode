import { Component } from '@angular/core';
import { FooterComponent } from '../layout/footer/footer';
import { HeaderComponent } from '../layout/header/header';
import { HeroSectionComponent } from './sections/hero/hero';
import { KeyCompetenciesSectionComponent } from './sections/key-competencies/key-competencies-section';
import { FinalCtaSectionComponent } from './sections/final-cta/final-cta';
import { GanchoSectionComponent } from './sections/gancho/gancho';
import { ManifestoSectionComponent } from './sections/manifesto/manifesto';
import { PortfolioSectionComponent } from './sections/portfolio/portfolio';
import { HomeProjectsSectionComponent } from './sections/home-projects/home-projects';
import { PricingSectionComponent } from './sections/pricing/pricing';
import { WhyUsSectionComponent } from './sections/why-us/why-us';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    HeaderComponent,
    HeroSectionComponent,
    KeyCompetenciesSectionComponent,
    PortfolioSectionComponent,
    ManifestoSectionComponent,
    WhyUsSectionComponent,
    PricingSectionComponent,
    HomeProjectsSectionComponent,
    GanchoSectionComponent,
    FinalCtaSectionComponent,
    FooterComponent,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {}
