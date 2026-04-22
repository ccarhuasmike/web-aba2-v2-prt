

export interface DataCuentaEmpresa {
    clientUid?: string;
    accounts?: CuentaEmpresa[];
}

export interface CuentaEmpresa {
    currencyCode?: string;
    accountUid?: string;
    accountTypeCode?: string;
    product?: string;
    accountStatus?: string;
    blockTypeCode?: string;
    blockTypeDescription?: string;
    accountStatusCode?: string;
    accountStatusDescription?: string;
    accountNumber?: string;
    interbankCode?: string;
    availableBalance?: number;
    retainedBalance?: number;
    accountOpeningDate?: Date;
    accountClosingDate?: Date;
}




export interface ListaPersonaJuridica {
    customerUid?: string;
    identNumber?: string;
    identCodeType?: string;
    name?: string;
    legalRepresentative?: string;
    status?: string;
    userCreate?: string;
    userUpdate?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface RegistroPersonaJuridica {
    id?: number;
    ubigeo?: string
    activitySector?: string
    dstUbigeo?: string
    classificationId?: number
    addressDetail?: string
    organizationTypeId?: number
    countryOfConstitution?: string
    dptUbigeo?: string
    prvUbigeo?: string
    name?: string
    applyItf?: boolean
    contactPhone?: string
    identDocNumber?: string
    address?: string
    clientUid?: string;
    userCreate?: string;
    userUpdate?: string;
    createdAt?: Date;
    updatedAt?: string;
    user?: string
    filesAttach?: File[]
    attorneys?: Attorney[]
}

export interface Attorney {
    //   id:                      number;
    // documentType: string
    // documentNumber: string
    // firstName: string
    // paternalLastName: string
    // maternalLastName: string
    // address: string
    // phone: string
    // email: string
    // participationPercentage: number
    // isLegalRepresentative?: boolean

    id?: number;
    documentNumber?: string;
    firstName?: string;
    paternalLastName?: string;
    maternalLastName?: string;
    phone?: string;
    address?: string;
    documentType?: string;
    participationPercentage?: number;
    email?: string;
    isLegalRepresentative?: boolean;
    active?: boolean;
    userCreate?: string;
    userUpdate?: string;
    createdAt?: Date;
    updatedAt?: string;
    filesAttach?: File[]
}

export interface File {
    id?: number;
    code?: string;
    name?: string;
    fileTypeId?: number;
    path?: string;
    extension?: string;
    fileIndex?: null;
    userCreate?: string;
    userUpdate?: null;
    createdAt?: Date;
    updatedAt?: null;
}
export interface DataTipoArchivo {
    data?: DatumTipoArchivo[];
    pagination?: PaginationTipoArchivo;
}
export interface DatumTipoArchivo {
    id?: number;
    code?: string;
    name?: string;
    status?: boolean;
    userCreate?: string;
    userUpdate?: null;
    createdAt?: Date;
    updatedAt?: null;
}
export interface PaginationTipoArchivo {
    totalRecords?: number;
    totalPages?: number;
    currentPage?: number;
    pageSize?: number;
}


export interface ArchivoApoderadoYEmpresa {
    id:               number;
    representativeId: number;
    name:             string;
    fileTypeId:       number;
    path:             string;
    extension:        string;
    fileIndex:        number;
    user:             null;
    base64Content:    string;
    userCreate:       string;
    userUpdate:       null;
    createdAt:        Date;
    updatedAt:        null;
}