import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { RegistroModulos } from '@/models/Modulos';
import { DataResponse, Response } from '@/models/Response';
import { environment } from 'src/environments/environment';
import { getHeaders } from './auth-header.util';
import { ArchivoApoderadoYEmpresa, DataCuentaEmpresa, DataTipoArchivo, ListaPersonaJuridica, RegistroPersonaJuridica } from '@/models/CuentaEmpresa';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CuentaEmpresaService {

  constructor(private readonly http: HttpClient) { }

  listar_tipo_archivo(page: number, size: number): Promise<Response<DataTipoArchivo> | undefined> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http.get<Response<DataTipoArchivo>>(`${environment.APICtaAho}/v1/cuentas/empresas/tipos-archivo`,
      { params }).toPromise();
  }
  detalle_empresa_id(idempresa: string): Promise<RegistroPersonaJuridica | undefined> {
    return this.http.get<RegistroPersonaJuridica>(`${environment.APICtaAho}/v1/cuentas/empresas/detalle/${idempresa}`).toPromise();
  }
  obtener_empresa_archivo_id(fileId: number): Promise<Response<ArchivoApoderadoYEmpresa> | undefined> {
    return this.http.get<Response<ArchivoApoderadoYEmpresa>>(`${environment.APICtaAho}/v1/cuentas/empresas/archivos/${fileId}`).toPromise();
  }
  obtener_apoderado_archivo_id(fileId: number): Promise<Response<ArchivoApoderadoYEmpresa> | undefined> {
    return this.http.get<Response<ArchivoApoderadoYEmpresa>>(`${environment.APICtaAho}/v1/cuentas/empresas/apoderados/archivos/${fileId}`).toPromise();
  }
  habilitar_desabilidad_apoderado_id(
    companyId: number,
    representativeId: number,
    active: boolean
  ): Promise<Response<any>> {
    const url = `${environment.APICtaAho}/v1/cuentas/empresas/apoderados/${companyId}/status/${representativeId}?active=${active}`;
    return firstValueFrom(
      this.http.patch<Response<any>>(url, {})
    );
  }
  delete_apoderado_id(companyId: number, representativeId: number): Promise<Response<any> | undefined> {
    return this.http.delete<Response<any>>(`${environment.APICtaAho}/v1/cuentas/empresas/apoderados/${companyId}/${representativeId}`).toPromise();
  }
  listar_persona_juridica_empresa(searchType: string, value: string): Promise<Response<ListaPersonaJuridica> | undefined> {
    return this.http.get<Response<ListaPersonaJuridica>>(`${environment.APIACtaPasiva}/v1/cuentas/empresas/buscar?searchType=${searchType}&value=${value}`).toPromise();
  }
  listar_cuenta_por_empresa_juridica(request: any): Promise<Response<DataCuentaEmpresa> | undefined> {
    return this.http.post<Response<DataCuentaEmpresa>>(`${environment.APIACtaPasiva}/v1/cuentas/empresas`, request).toPromise();
  }
  crear_persona_juridica(request: RegistroPersonaJuridica): Promise<Response<DataResponse> | undefined> {
    const headers = getHeaders("222", "ssds");
    return this.http.post<Response<DataResponse>>(`${environment.APIACtaPasiva}/v1/cuentas/empresas/enrolar-master`, request, { headers }).toPromise();
  }
  modify_modulo(request: RegistroModulos): Promise<Response<DataResponse> | undefined> {
    const headers = new HttpHeaders({
      'codigo-canal': "000",
      'usuario': "sd3343",
      'opcion-id': "sd3343",
      'Content-Type': 'application/json'
    });
    return this.http.put<Response<DataResponse>>(`${environment.APIAccesoCuentaEmpresa}/v1/auth/modify_modulo`, request, { headers }).toPromise();
  }
  delete_modulo(request: RegistroModulos): Promise<Response<DataResponse> | undefined> {
    const headers = new HttpHeaders({
      'codigo-canal': "000",
      'usuario': "sd3343",
      'opcion-id': request.opcionId.toString(),
      'Content-Type': 'application/json'
    });
    return this.http.put<Response<DataResponse>>(`${environment.APIAccesoCuentaEmpresa}/v1/auth/delete_modulo`, request, { headers }).toPromise();
  }
}