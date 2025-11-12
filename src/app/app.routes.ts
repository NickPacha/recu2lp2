import { Routes } from '@angular/router';
import { MedicoComponent } from './components/medico/medico';
import { EspecialidadComponent } from './components/especialidad/especialidad';
import { Home } from './components/home/home';

export const routes: Routes = [
    {path:'',component:Home},
    {path:'medico',component:MedicoComponent},
    {path:'especialidad',component:EspecialidadComponent},
    {path:'**',redirectTo:''}
];