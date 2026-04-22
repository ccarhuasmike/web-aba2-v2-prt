import { Routes } from "@angular/router";

export default [
    {
        path: 'modulos',
        loadChildren: () => import('./modulos/modulos.routes')
    },
    {
        path: 'perfiles',
        loadChildren: () => import('./perfiles/perfiles.routes')
    }
] as Routes;
