import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RevertirRetencionService {

    APICtaAho = environment.APICtaAho;

    constructor(private readonly http: HttpClient) { }

    postLiberacionRetencion(object: any) {
        const url = `${this.APICtaAho}/v1/saldo/liberacion`;
        return this.http.post(url, object, {});
    }
}
