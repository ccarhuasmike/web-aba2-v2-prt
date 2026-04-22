
export interface Response<T> {
    codigo: number;
    mensaje: string;
    data: T;
}
export interface DataResponse {   
    traceId: string;  
}
