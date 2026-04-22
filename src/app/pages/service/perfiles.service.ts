import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ListaPerfiles, RegistroPerfil } from '@/models/Perfiles';
import { Response, DataResponse } from '@/models/Response';
import { environment } from 'src/environments/environment';
import { getHeaders } from './auth-header.util';

@Injectable({
  providedIn: 'root'
})
export class PerfilesService {

  constructor(private readonly http: HttpClient) { }

  listar_perfiles(id: number, codigoCanal: string, usuario: string): Promise<Response<ListaPerfiles> | undefined> {
    const headers = getHeaders(codigoCanal, usuario);
    return this.http.get<Response<ListaPerfiles>>(`${environment.APIAccesoCuentaEmpresa}/v1/perfiles`, { headers }).toPromise();
  }
  create_perfil(request: RegistroPerfil): Promise<Response<DataResponse> | undefined> {
    const headers = getHeaders("222", "ssds");
    return this.http.post<Response<DataResponse>>(`${environment.APIAccesoCuentaEmpresa}/v1/perfiles`, request, { headers }).toPromise();
  }
  update_perfil(request: RegistroPerfil): Promise<Response<DataResponse> | undefined> {
    const headers = new HttpHeaders({
      'codigo-canal': "000",
      'usuario': "sd3343",
      'perfil-id': "sd3343",
      'Content-Type': 'application/json'
    });
    return this.http.put<Response<DataResponse>>(`${environment.APIAccesoCuentaEmpresa}/v1/perfiles`, request, { headers }).toPromise();
  }
  delete_perfil(request: RegistroPerfil): Promise<Response<DataResponse> | undefined> {
    const headers = new HttpHeaders({
      'codigo-canal': "000",
      'usuario': "sd3343",
      'perfil-id': request.idPerfil!.toString(),
      'Content-Type': 'application/json'
    });
    return this.http.put<Response<DataResponse>>(`${environment.APIAccesoCuentaEmpresa}/v1/perfiles`, request, { headers }).toPromise();
  }
}