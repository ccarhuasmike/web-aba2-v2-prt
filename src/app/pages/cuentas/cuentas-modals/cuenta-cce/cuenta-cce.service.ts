import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CuentaCCEService {

  APIUtilIntOpay = environment.APIUtilIntOpay;

  constructor(private readonly http: HttpClient) { }

  async getObtenerDocumento(tipo: string, numero: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.APIUtilIntOpay}/v1/contacto/obtener-documento/${tipo}/${numero}`).subscribe({
        next: (data: any) => {
          return resolve(data);
        },
        error: (err) => reject(err),
      });
    });
  }

  async getObtenerCelular(numero: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.APIUtilIntOpay}/v1/contacto/obtener-celular/${numero}`).subscribe({
        next: (data: any) => {
          return resolve(data);
        },
        error: (err) => reject(err),
      });
    });
  }

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

  async postRegistrarCCE(object:any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.APIUtilIntOpay}/v1/interop/contactos/registrar`, object).subscribe({
        next: (data: any) => {
          return resolve(data);
        },
        error: (err) => reject(err),
      });
    });
  }

  async putActualizarCCE(object:any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.put(`${this.APIUtilIntOpay}/v1/interop/contactos/actualizar`, object).subscribe({
        next: (data: any) => {
          return resolve(data);
        },
        error: (err) => reject(err),
      });
    });
  }

  async deleteEliminarCCE(object:any): Promise<any> {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: object
    };

    return new Promise((resolve, reject) => {
      this.http.request('DELETE', `${this.APIUtilIntOpay}/v1/interop/contactos/eliminar`, options).subscribe({
        next: (data: any) => {
          return resolve(data);
        },
        error: (err) => reject(err),
      });
    });
  }
}
