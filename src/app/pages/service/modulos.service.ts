import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';  
import { ListaModulos, RegistroModulos } from '@/models/Modulos';
import { DataResponse, Response } from '@/models/Response';
import { environment } from 'src/environments/environment';
import { getHeaders } from './auth-header.util';

@Injectable({
  providedIn: 'root'
})
export class ModulosService {
  
  constructor(private readonly http: HttpClient) { }
  // Retorna una Promesa
  listar_modulos(id: number, codigoCanal: string, usuario: string): Promise<Response<ListaModulos>| undefined> {
    const headers =getHeaders(codigoCanal, usuario);
    return this.http.get<Response<ListaModulos>>(`${environment.APIAccesoCuentaEmpresa}/v1/modulos`, { headers }).toPromise();
  }

  
  create_modulo(request: RegistroModulos): Promise<Response<DataResponse> | undefined> {
    const headers = getHeaders("222", "ssds");
    return this.http.post<Response<DataResponse>>(`${environment.APIAccesoCuentaEmpresa}/v1/modulos`, request, { headers }).toPromise();
  }
  modify_modulo(request: RegistroModulos): Promise<Response<DataResponse> | undefined> {
    const headers = new HttpHeaders({
      'codigo-canal': "000",
      'usuario': "sd3343",
      'opcion-id': "sd3343",
      'Content-Type': 'application/json'
    });
    return this.http.put<Response<DataResponse>>(`${environment.APIAccesoCuentaEmpresa}/v1/modulos`, request, { headers }).toPromise();
  }
  delete_modulo(request: RegistroModulos): Promise<Response<DataResponse> | undefined> {
    const headers = new HttpHeaders({
      'codigo-canal': "000",
      'usuario': "sd3343",
      'opcion-id': request.opcionId.toString(),
      'Content-Type': 'application/json'
    });
    return this.http.put<Response<DataResponse>>(`${environment.APIAccesoCuentaEmpresa}/v1/modulos`, request, { headers }).toPromise();
  }

}