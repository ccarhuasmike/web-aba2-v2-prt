import { Routes } from "@angular/router";

export default [
    {
        path: 'listar-persona-juridica',
        loadChildren: () => import('./listar-persona-juridica/listar-persona-juridica.routes')
    },
    {
        path: 'configuracion',
        loadChildren: () => import('./configuracion/configuracion.routes')
    }
] as Routes;