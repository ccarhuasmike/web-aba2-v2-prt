import { Routes } from '@angular/router';
import { ListarPersonaJuridicaComponent } from './listar-persona-juridica.component';

export default [
    { path: '', data: { breadcrumb: 'Listar Persona Jurídica' }, component: ListarPersonaJuridicaComponent },
] as Routes;
