import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Response, DataResponse } from '@/models/Response';
import { environment } from 'src/environments/environment';
import { getHeaders } from './auth-header.util';
import { ListaUsuario, RegistroUsuario } from '@/models/Usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(private readonly http: HttpClient) { }

  listar_usuarios(id: number, codigoCanal: string, usuario: string): Promise<Response<ListaUsuario> | undefined> {
    const headers = getHeaders(codigoCanal, usuario);
    return this.http.get<Response<ListaUsuario>>(`${environment.APIAccesoCuentaEmpresa}/v1/usuarios`, { headers }).toPromise();
  }
  create_usuario(request: RegistroUsuario): Promise<Response<DataResponse> | undefined> {
    const headers = getHeaders("222", "ssds");
    return this.http.post<Response<DataResponse>>(`${environment.APIAccesoCuentaEmpresa}/v1/usuarios`, request, { headers }).toPromise();
  }
  modify_usuario(request: RegistroUsuario): Promise<Response<DataResponse> | undefined> {
    const headers = new HttpHeaders({
      'codigo-canal': "000",
      'usuario': "sd3343",
      'usuario-id':request.idUsuario!.toString(),
      'Content-Type': 'application/json'
    });
    return this.http.put<Response<DataResponse>>(`${environment.APIAccesoCuentaEmpresa}/v1/usuarios`, request, { headers }).toPromise();
  }
  delete_usuario(request: RegistroUsuario): Promise<Response<DataResponse> | undefined> {
    const headers = new HttpHeaders({
      'codigo-canal': "000",
      'usuario': "sd3343",
      'usuario-id': request.idUsuario!.toString(),
      'Content-Type': 'application/json'
    });
    return this.http.put<Response<DataResponse>>(`${environment.APIAccesoCuentaEmpresa}/v1/usuarios`, request, { headers }).toPromise();
  }
}