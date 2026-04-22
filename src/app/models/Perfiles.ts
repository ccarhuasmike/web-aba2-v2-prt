

export interface ListaPerfiles {
    idPerfil: number;
    nombre: string;
    descripcion: string;
    flagAutonomia: boolean;
    estado: number;
}


export interface RegistroPerfil {
    idPerfil?: number;
    nombre?: string;
    descripcion?: string;
    flagAutonomia?: boolean;
    opciones?: Opcione[];
}

export interface Opcione {
    opcionId: number;
}


