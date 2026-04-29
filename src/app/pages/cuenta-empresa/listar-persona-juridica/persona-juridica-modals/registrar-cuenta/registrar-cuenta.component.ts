import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { CuentaEmpresaService, RegisterAccountRequest } from '@/pages/service/cuentaempresa.service';
import { CommonService } from '@/pages/service/commonService';  
import { ListaTipoCuenum } from '@/models/Common';
@Component({
    selector: 'app-registrar-cuenta',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, SelectModule, ToastModule, TooltipModule, FileUploadModule],
    providers: [MessageService],
    templateUrl: './registrar-cuenta.component.html',
    styleUrls: ['./registrar-cuenta.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.Emulated
})
export class RegistrarCuentaComponent implements OnInit {
    formCuenta: FormGroup;
    submitting = false;

    tiposCuenta: ListaTipoCuenum[] = [];
    //monedas: any[] = [];
    personaJuridica: any;
    
    // Propiedades para archivos obligatorios
    solicitudApertura: any = null;
    cartillaInformativa: any = null;
    terminosCondiciones: any = null;
    contratoEmpresa: any = null;

    constructor(
        private readonly fb: FormBuilder,
        private readonly dialogRef: DynamicDialogRef,
        private readonly config: DynamicDialogConfig,
        private readonly commonService: CommonService,  
        public messageService: MessageService,
        private readonly cuentaEmpresaService: CuentaEmpresaService,
        private readonly cdr: ChangeDetectorRef
    ) {
        this.formCuenta = this.fb.group({
            tipoCuenta: ['', Validators.required],
            //moneda: ['', Validators.required]
            cantidadAprobadores: ['3', Validators.required]
        });
    }

    async ngOnInit() {
        this.personaJuridica = this.config.data?.personaJuridica || {};
        await this.loadTiposCuenta();
        ///this.loadMonedas();
    }   

    async loadTiposCuenta() {


        try {
            const response = await this.commonService.listar_tipocuentas();
            
            if (response?.codigo === 0) {
                this.tiposCuenta = Array.isArray(response.data.listaTipoCuenta
                ) ? response.data.listaTipoCuenta : [];
            }
        } catch (error) {
            console.error('Error:', error);
        }
        
    }

    // loadMonedas() {
    //     this.monedas = [
    //         { label: 'Soles (S/.)', value: 'PEN' },
    //         { label: 'Dólares Americanos (USD)', value: 'USD' },
    //     ];
    // }

    onUploadSolicitud(event: any) {
        if (event.files && event.files.length > 0) {
            this.solicitudApertura = event.files[0];
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: `${this.solicitudApertura.name} cargado correctamente`
            });
        }
    }

    onUploadCartilla(event: any) {
        if (event.files && event.files.length > 0) {
            this.cartillaInformativa = event.files[0];
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: `${this.cartillaInformativa.name} cargado correctamente`
            });
        }
    }

    onUploadTerminos(event: any) {
        if (event.files && event.files.length > 0) {
            this.terminosCondiciones = event.files[0];
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: `${this.terminosCondiciones.name} cargado correctamente`
            });
        }
    }

    onUploadContrato(event: any) {
        if (event.files && event.files.length > 0) {
            this.contratoEmpresa = event.files[0];
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: `${this.contratoEmpresa.name} cargado correctamente`
            });
        }
    }

    eliminarArchivo(tipo: string) {
        switch(tipo) {
            case 'solicitud':
                this.solicitudApertura = null;
                break;
            case 'cartilla':
                this.cartillaInformativa = null;
                break;
            case 'terminos':
                this.terminosCondiciones = null;
                break;
            case 'contrato':
                this.contratoEmpresa = null;
                break;
        }
    }

    registrar() {
        if (this.formCuenta.invalid) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Por favor complete todos los campos requeridos'
            });
            return;
        }

        if (!this.solicitudApertura || !this.cartillaInformativa || !this.terminosCondiciones || !this.contratoEmpresa) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Debe adjuntar todos los documentos obligatorios'
            });
            return;
        }
        const customerUid = this.personaJuridica?.customerUid;
        if (!customerUid) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se encontró el customerUid de la persona jurídica seleccionada'
            });
            return;
        }

        const request: RegisterAccountRequest = {
            customerUid,
            user: 'ADMIN_APP',
            accountType: this.formCuenta.get('tipoCuenta')?.value,
            filesAttach: [
                this.mapFileAttach(this.solicitudApertura, '1', 0),
                this.mapFileAttach(this.cartillaInformativa, '2', 1),
                this.mapFileAttach(this.terminosCondiciones, '3', 2),
                this.mapFileAttach(this.contratoEmpresa, '4', 3)
            ]
        };

        this.submitting = true;
        this.cuentaEmpresaService.crear_cuenta_juridica(request).then((response) => {
            const accountData = this.extractAccountData(response);
            const hasCreatedAccountData = !!(accountData?.accountNumber && accountData?.accountUid);
            if ((response?.codigo === 0 || response?.codigo === 1) && hasCreatedAccountData) {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Cuenta registrada correctamente'
                });
                this.dialogRef.close(accountData);
                return;
            }
            if (hasCreatedAccountData) {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: response?.mensaje || 'Cuenta registrada correctamente'
                });
                this.dialogRef.close(accountData);
                return;
            }
            if (response?.codigo === 0 || response?.codigo === 1) {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: response?.mensaje || 'Registro procesado correctamente'
                });
                this.dialogRef.close({
                    refreshOnly: true,
                    accountTypeCode: request.accountType,
                    statusCode: '01',
                    insertDate: new Date().toISOString(),
                    //accountNumber: response?.data?.accountNumber || `PEND-${Date.now()}`
                });
                return;
            }

            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response?.mensaje || 'No se pudo registrar la cuenta'
            });
        }).catch((error) => {
            console.error('Error registrando cuenta:', error);
            const backendMessage = error?.error?.mensaje || error?.error?.message || error?.message;
            const statusMessage = error?.status ? ` (HTTP ${error.status})` : '';
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: backendMessage ? `${backendMessage}${statusMessage}` : `No se pudo registrar la cuenta${statusMessage}`
            });
        }).finally(() => {
            this.submitting = false;
            this.cdr.markForCheck();
        });
    }

    private extractAccountData(response: any): any {
        if (!response) {
            return null;
        }
        if (response?.data?.accountNumber && response?.data?.accountUid) {
            return response.data;
        }
        if (response?.accountNumber && response?.accountUid) {
            return response;
        }
        return response?.data ?? null;
    }

    private mapFileAttach(file: any, fileType: string, fileIndex: number) {
        const extension = file?.name?.includes('.') ? file.name.split('.').pop() : '';
        return {
            name: file?.name ?? '',
            fileType,
            path: '/',
            extension: extension ?? '',
            fileIndex
        };
    }

    cancelar() {
        this.dialogRef.close();
    }
}
