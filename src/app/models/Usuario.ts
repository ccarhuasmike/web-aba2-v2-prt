

export interface ListaUsuario {
    idUsuario?: number;
    idPersonaJuridica?: number; // falta agregar en el servicio esta propiedad
    tipoDocumento?: string;
    dni?: string;
    nombre?: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
    correo?: string;
    celular?: string;
    estado?: number;
    documento?: DocumentoRegistroUsuario[];
    cuentas?: CuentaUsuario[];
    perfiles?: PerfilesUsuario[];
}

export interface CuentaUsuario {
    uidCuenta?: number;
}

export interface PerfilesUsuario {
    idPerfil?: number;
    nombre?: string;
    descripcion?: string;
    flagAutonomia?: boolean;
    montoMaxOp?: number;
    montoMaxDia?: number;
    montoMaxMen?: number;
    estado?: number;
}


export interface RegistroUsuario {
    idUsuario?: number;
    tipoDocumento?: string;
    dni?: string;
    nombre?: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
    correo?: string;
    celular?: string;
    codInternoPj?: string;
    documento?: DocumentoRegistroUsuario;
    cuentas?: CuentaRegistroUsuario[];
    perfiles?: PerfileRegistroUsuario[];
}

export interface CuentaRegistroUsuario {
    uidCuenta: string;
}

export interface PerfileRegistroUsuario {
    perfilId: number;
}
export interface DocumentoRegistroUsuario {
    rutaDocumento: string;
    fileBase64: string;
}


