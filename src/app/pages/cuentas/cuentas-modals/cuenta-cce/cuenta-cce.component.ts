import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidationErrors, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CuentaCCEService } from './cuenta-cce.service';
import { UtilService } from '@/utils/util.services';
import { CommonModule } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { SecurityEncryptedService } from '@/layout/service/SecurityEncryptedService';
import { ROLES } from '@/layout/Utils/constants/aba.constants';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

export interface RegistroCEE {
    celular?: string
    codCanal?: string
    numeroCuentaCCI?: string
    numeroDocumento?: string
    primerApellido?: string
    primerNombre?: string
    segundoApellido?: string
    segundoNombre?: string
    tipoDocumento?: string
    uIdCliente?: string
    uIdCuenta?: string
    usuario?: string
    documentoSustento?: string
    nombDocumentoSustento?: string
}

export interface EliminarCEE {
    codCanal?: string
    uIdCliente?: string
    uIdCuenta?: string
    usuario?: string
    documentoSustento?: string
    nombDocumentoSustento?: string
}

export interface ActualizarCEE {
    celular: string
    codCanal: string
    uIdCliente: string
    uIdCuenta: string
    usuario: string
    documentoSustento?: string
    nombDocumentoSustento?: string
}

@Component({
    selector: 'app-cuenta-cce',
    templateUrl: './cuenta-cce.component.html',
    styleUrls: ['./cuenta-cce.component.scss'],
    standalone: true,
    imports: [MessageModule, ToastModule, ButtonModule, FileUploadModule, ReactiveFormsModule, CommonModule, InputTextModule, AutoCompleteModule],
    //animations: fuseAnimations,
    providers: [MessageService, ConfirmationService],
    encapsulation: ViewEncapsulation.None
})

export class CuentaCCEComponent implements OnInit {

    formRegistro!: FormGroup;
    tiposRegistro = [
        {
            id: '01',
            nombre: 'Modificación'
        },
        {
            id: '02',
            nombre: 'Eliminación'
        },
        {
            id: '03',
            nombre: 'Registro'
        },
    ];
    filteredElementTipoRegistro: any[] = [];
    roles: any = ROLES;
    files: File[] = [];
    loadingFile = false;
    uidCuenta: string;
    uidCliente: string;
    tipoDoc: string;
    numDoc: string;
    celularActual: string = "";
    datosCliente: any;
    datosCuenta: any;

    constructor(
        private readonly cuentaCCEService: CuentaCCEService,
        private readonly toastr: MessageService,
        private readonly confirmationService: ConfirmationService,
        // public dialogRef: MatDialogRef<CuentaCCEComponent>,
        // @Inject(MAT_DIALOG_DATA) public data: any,


        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig,

        private readonly securityEncryptedService: SecurityEncryptedService,
    ) {
        this.uidCuenta = config.data.uidCuenta;
        this.uidCliente = config.data.uidCliente;
        this.tipoDoc = config.data.tipoDoc;
        this.numDoc = config.data.numDoc;
        this.datosCliente = config.data.datosCliente;
        this.datosCuenta = config.data.datosCuenta;

    }

    ngOnInit() {
        this.formRegistro = new FormGroup({
            tipoRegistro: new FormControl(null, [this.requireMatch, Validators.required]),
            numerocelular: new FormControl(null, [Validators.minLength(9), Validators.maxLength(9), Validators.required]),
            nombreArchivo: new FormControl(null),
            archivosAdjuntos: new FormControl(null)
        });
        const role = this.securityEncryptedService.getRolesDecrypted();
        if (role == this.roles.ATENCION_CLIENTE_TD || role == this.roles.ATENCION_CLIENTE_N3) {//cuando el rol es ATENCION_CLIENTE_TD retirar la opcion Eliminación
            this.tiposRegistro = this.tiposRegistro.filter(item => item.nombre !== 'Eliminación');
        }
        this.cuentaCCEService.getObtenerDocumento(Number.parseInt(this.tipoDoc).toString(), this.numDoc).then(respuestaObtenerDocumento => {
            if (respuestaObtenerDocumento.codigo == 0) {
                this.celularActual = respuestaObtenerDocumento.data.celular;
            }
        });
    }

    async guardarNumeroCCE() {
        const tipoRegistroId = this.formRegistro.value.tipoRegistro.id;
        const mensajeconfirmacion = this.getConfirmationMessage(tipoRegistroId);

        this.confirmationService.confirm({
            header: mensajeconfirmacion,
            message: 'Esta acción realizará cambios en el directorio de la CCE',
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: 'Cancelar',
                severity: 'secondary',
                outlined: true,
            },
            acceptButtonProps: {
                label: 'Aceptar',
            },
            accept: async () => {
                const usuario = JSON.parse(localStorage.getItem('userABA')!);

                switch (tipoRegistroId) {
                    case '01':
                        await this.handleModificacion(usuario);
                        break;
                    case '02':
                        await this.handleEliminacion(usuario);
                        break;
                    case '03':
                        await this.handleRegistro(usuario);
                        break;
                }
            },
            reject: () => {
                this.toastr.add({ severity: 'error', summary: 'Error openGuardarNumeroCCE', detail: 'Error en el servicio de actualizar guardarNumeroCCE' });
            }
        });       
    }

    private getConfirmationMessage(tipoRegistroId: string): string {
        switch (tipoRegistroId) {
            case '01':
                return 'Se modificará el número en la CCE, ¿Deseas continuar?';
            case '02':
                return 'Se eliminará el número en la CCE, ¿Deseas continuar?';
            case '03':
                return 'Se realizará el registro en la CCE, ¿Deseas continuar?';
            default:
                return '';
        }
    }

    private async handleModificacion(usuario: any): Promise<void> {
        const respuestaObtenerDocumento = await this.cuentaCCEService.getObtenerDocumento(Number.parseInt(this.tipoDoc).toString(), this.numDoc);

        if (respuestaObtenerDocumento.codigo !== 0) {
            this.toastr.add({ severity: 'warn', summary: '', detail: 'Se debe registrar el nuevo número de celular' });
            return;
        }

        const respuestaObtenerCelular = await this.cuentaCCEService.getObtenerCelular(this.formRegistro.value.numerocelular);

        if (respuestaObtenerCelular.codigo === 0 && respuestaObtenerCelular.data.numeroDocumento !== this.numDoc) {
            await this.eliminarYActualizarCCE(respuestaObtenerCelular.data, usuario);
        } else {
            await this.actualizarCCE(usuario);
        }
    }

    private async handleEliminacion(usuario: any): Promise<void> {
        const respuestaObtenerDocumento = await this.cuentaCCEService.getObtenerDocumento(Number.parseInt(this.tipoDoc).toString(), this.numDoc);

        if (respuestaObtenerDocumento.codigo !== 0) {
            this.toastr.add({ severity: 'warn', summary: '', detail: 'No existe registros por eliminar' });
            return;
        }

        const eliminarCEE: EliminarCEE = {
            codCanal: '05',
            uIdCliente: respuestaObtenerDocumento.data.uidCliente,
            uIdCuenta: respuestaObtenerDocumento.data.uidCuenta,
            documentoSustento: this.formRegistro.value.archivosAdjuntos,
            nombDocumentoSustento: this.formRegistro.value.nombreArchivo,
            usuario: this.truncateString(usuario.email, 50)
        };

        const respuestaEliminarCCE = await this.cuentaCCEService.deleteEliminarCCE(eliminarCEE);

        if (respuestaEliminarCCE.codigo === 0) {
            this.toastr.add({ severity: 'success', summary: '', detail: 'Se eliminó correctamente el número de celular' });
            this.close();
        } else {
            this.toastr.add({ severity: 'warn', summary: '', detail: 'Hubo un error al intentar eliminar el número de celular' });
        }
    }

    private async handleRegistro(usuario: any): Promise<void> {
        const respuestaObtenerDocumento = await this.cuentaCCEService.getObtenerDocumento(Number.parseInt(this.tipoDoc).toString(), this.numDoc);

        if (respuestaObtenerDocumento.codigo === 0) {
            if (respuestaObtenerDocumento.data.celular === this.formRegistro.value.numerocelular) {
                this.toastr.add({ severity: 'warn', summary: '', detail: 'No hay cambios por realizar, ya que los datos ya se encuentran actualizados' });
            } else {
                this.toastr.add({ severity: 'warn', summary: '', detail: 'Se debe actualizar el número de celular' });
            }
            return;
        }

        const respuestaObtenerCelular = await this.cuentaCCEService.getObtenerCelular(this.formRegistro.value.numerocelular);

        if (respuestaObtenerCelular.codigo === 0 && respuestaObtenerCelular.data.numeroDocumento !== this.numDoc) {
            await this.eliminarYRegistrarCCE(respuestaObtenerCelular.data, usuario);
        } else {
            await this.registrarCCE(usuario);
        }
    }

    private async eliminarYActualizarCCE(datosCliente: any, usuario: any): Promise<void> {
        const eliminarCEE: EliminarCEE = {
            codCanal: '05',
            uIdCliente: datosCliente.uidCliente,
            uIdCuenta: datosCliente.uidCuenta,
            documentoSustento: this.formRegistro.value.archivosAdjuntos,
            nombDocumentoSustento: this.formRegistro.value.nombreArchivo,
            usuario: this.truncateString(usuario.email, 50)
        };

        const respuestaEliminarCCE = await this.cuentaCCEService.deleteEliminarCCE(eliminarCEE);

        if (respuestaEliminarCCE.codigo === 0) {
            await this.actualizarCCE(usuario);
        } else {
            this.toastr.add({ severity: 'warn', summary: '', detail: 'Hubo un error al intentar actualizar el número de celular' });
        }
    }

    private async actualizarCCE(usuario: any): Promise<void> {
        const actualizarCEE: ActualizarCEE = {
            codCanal: '05',
            uIdCliente: this.uidCliente,
            uIdCuenta: this.uidCuenta,
            celular: this.formRegistro.value.numerocelular,
            documentoSustento: this.formRegistro.value.archivosAdjuntos,
            nombDocumentoSustento: this.formRegistro.value.nombreArchivo,
            usuario: this.truncateString(usuario.email, 50)
        };

        try {
            const respuestaActualizarCCE = await this.cuentaCCEService.putActualizarCCE(actualizarCEE);
            if (respuestaActualizarCCE.codigo === 0) {
                this.toastr.add({ severity: 'success', summary: '', detail: 'Se actualizó correctamente el número de celular' });
                this.close();
            } else {
                this.toastr.add({ severity: 'warn', summary: '', detail: 'Hubo un error al intentar actualizar el número de celular' });
            }
        } catch (error) {
            console.error('Error updating CCE:', error);
            this.toastr.add({ severity: 'warn', summary: '', detail: 'Hubo un error al intentar registrar el número de celular' });
        }
    }

    private async eliminarYRegistrarCCE(datosCliente: any, usuario: any): Promise<void> {
        const eliminarCEE: EliminarCEE = {
            codCanal: '05',
            uIdCliente: datosCliente.uidCliente,
            uIdCuenta: datosCliente.uidCuenta,
            documentoSustento: this.formRegistro.value.archivosAdjuntos,
            nombDocumentoSustento: this.formRegistro.value.nombreArchivo,
            usuario: this.truncateString(usuario.email, 50)
        };

        const respuestaEliminarCCE = await this.cuentaCCEService.deleteEliminarCCE(eliminarCEE);

        if (respuestaEliminarCCE.codigo === 0) {
            await this.registrarCCE(usuario);
        } else {
            this.toastr.add({ severity: 'warn', summary: '', detail: 'Hubo un error al intentar registrar el número de celular' });
        }
    }

    private async registrarCCE(usuario: any): Promise<void> {
        const registrarCEE: RegistroCEE = {
            codCanal: '05',
            uIdCliente: this.uidCliente,
            uIdCuenta: this.uidCuenta,
            tipoDocumento: Number.parseInt(this.tipoDoc).toString(),
            numeroDocumento: this.numDoc,
            numeroCuentaCCI: this.datosCuenta.numeroCuentaCci,
            primerNombre: this.datosCliente.primerNombre,
            segundoNombre: this.datosCliente.segundoNombre,
            primerApellido: this.datosCliente.primerApellido,
            segundoApellido: this.datosCliente.segundoApellido,
            celular: this.formRegistro.value.numerocelular,
            documentoSustento: this.formRegistro.value.archivosAdjuntos,
            nombDocumentoSustento: this.formRegistro.value.nombreArchivo,
            usuario: this.truncateString(usuario.email, 50)
        };

        try {
            const respuestaRegistrarCCE = await this.cuentaCCEService.postRegistrarCCE(registrarCEE);

            if (respuestaRegistrarCCE.codigo === 0) {
                this.toastr.add({ severity: 'success', summary: '', detail: 'Se registró correctamente el número de celular' });
                this.close();
            } else {
                this.toastr.add({ severity: 'warn', summary: '', detail: 'Hubo un error al intentar registrar el número de celular' });
            }
        } catch (error) {
            console.error('Error registering CCE:', error);
            this.toastr.add({ severity: 'warn', summary: '', detail: 'Hubo un error al intentar registrar el número de celular' });
        }
    }

    truncateString(str: any, limit = 50, ellipsis = '...') {
        if (!str) return '';
        return str.length > limit ? str.substring(0, limit) + ellipsis : str;
    }

    uploader(event: any) {
        this.loadingFile = true;
        this.files = event.files;
        const filereader = new FileReader();
        filereader.readAsDataURL(this.files[0]);
        filereader.onload = () => {
            this.formRegistro.get('archivosAdjuntos')!.setValue(filereader.result);
            this.formRegistro.get('nombreArchivo')!.setValue(this.files[0].name);
            this.toastr.add({ severity: 'info', summary: 'Carga exitosa', detail: `${this.files.length} archivos listos para enviar` });
            this.loadingFile = false;
        };

        filereader.onerror = () => {
            this.toastr.add({ severity: 'error', summary: 'Carga fallida', detail: 'No se pudo cargar los archivos' });
            this.loadingFile = false;
        };
    }

    removeAll() {
        this.files = [];
    }

    removeElement(event: any) {
        if (this.files.length > 0) {
            this.formRegistro.get('archivosAdjuntos')!.setValue(null);
            this.formRegistro.get('nombreArchivo')!.setValue(null);
            this.files = this.files.filter((element) => {
                return element !== event.file;
            });
        }
    }

    requireMatch(control: AbstractControl): ValidationErrors | null {
        const selection: any = control.value;
        if (typeof selection === 'string') {
            return { requireMatch: true };
        }
        return null;
    }

    filterElementTipoRegistro(event: any) {
        this.filteredElementTipoRegistro = [];
        const query = event?.query ?? '';
        this.filteredElementTipoRegistro = UtilService.filterByField(this.tiposRegistro, query, 'nombre');
    }

    changeModelTipoRegistro(event: any) {
        if (event) {
            if (event.id == '02') {
                this.formRegistro.patchValue({ numerocelular: '' });
                this.formRegistro.get('numerocelular')!.disable();
                this.formRegistro.get('numerocelular')!.clearValidators();
            } else {
                this.formRegistro.get('numerocelular')!.enable();
                this.formRegistro.get('numerocelular')!.setValidators([Validators.minLength(9), Validators.maxLength(9), Validators.required])
            }
        }

        this.formRegistro.get('numerocelular')!.updateValueAndValidity();
    }

    close() {
        this.dialogRef.close({
            event: 'close'
        });
    }
}
