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
    path: '**',
    redirectTo: '',
  },
];
