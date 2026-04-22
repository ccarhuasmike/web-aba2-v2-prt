import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ListarCuentaCCEService {

  APIUtilIntOpay = environment.APIUtilIntOpay;

  constructor(private readonly http: HttpClient) { }

  async getListarHistorico(uidCliente: string, uidCuenta: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.APIUtilIntOpay}/v1/contacto/obtener/datos/historicos/${uidCliente}/${uidCuenta}`).subscribe({
        next: (data: any) => {
          return resolve(data);
        },
        error: (err) => reject(err),
      });
    });
  }
}
