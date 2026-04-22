export interface ListaModulos {
    opcionId:    number;
    nombre:      string;
    descripcion: string;
    estado: number;
    seleccionado?: boolean;
}

export interface RegistroModulos {
    opcionId: number;
    nombre?: string;
    descripcion?: string;   
}
