import { Routes } from '@angular/router';
import { HomePage } from './home/home-page';
import { CotizaPageComponent } from './pages/cotiza-page/cotiza-page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'cotiza',
    component: CotizaPageComponent,
  },
  {
    path: 'projects/landing-elaborada',
    loadComponent: () =>
      import('./pages/projects/landingPageC/landing-page-c.component').then(
        (m) => m.LandingPageCComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
