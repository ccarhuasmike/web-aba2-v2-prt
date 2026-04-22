import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PagarRetencionService {

    APICtaAho = environment.APICtaAho;

    constructor(private readonly http: HttpClient) {
        // This a constructor
    }

    postPagoRetencion(object:any) {
        const url = `${this.APICtaAho}/v1/beneficiario/autorizar/pago/retencion`;
        return this.http.post(url, object, {});
    }    
}
