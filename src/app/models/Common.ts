export interface Clasification {
    id:         number;
    name:       string;
    status:     boolean;
    userCreate: string;
    userUpdate: string;
    createdAt:  Date;
    updatedAt:  Date;
}
export interface TipoOrganizacion {
    id:         number;
    name:       string;
    status:     boolean;
    userCreate: string;
    userUpdate: string;
    createdAt:  Date;
    updatedAt:  Date;
}




export interface Ubigeos {
    id:        IDUbigeo;
    desUbigeo: string;
}

export interface IDUbigeo {
    dptUbigeo: string;
    prvUbigeo: string;
    dstUbigeo: string;
}