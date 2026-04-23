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
import { CuentaEmpresaService } from '@/pages/service/cuentaempresa.service';
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

        const nuevaCuenta = {
            id: Math.floor(Math.random() * 100000),
            idPersonaJuridica: this.personaJuridica.ruc,
            numeroCuenta: `${this.personaJuridica.ruc}-${Math.floor(Math.random() * 9999999).toString().padStart(7, '0')}`,
            tipoCuenta: this.formCuenta.get('tipoCuenta')?.value,
            //moneda: this.formCuenta.get('moneda')?.value,

            estado: 'Activo',
            fechaApertura: new Date().toISOString().split('T')[0],
            saldo: 0,
            producto: this.getTipoProducto(this.formCuenta.get('tipoCuenta')?.value),
            documentos: {
                solicitudApertura: this.solicitudApertura?.name,
                cartillaInformativa: this.cartillaInformativa?.name,
                terminosCondiciones: this.terminosCondiciones?.name,
                contratoEmpresa: this.contratoEmpresa?.name
            }
        };

        this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Cuenta registrada correctamente'
        });

        this.dialogRef.close(nuevaCuenta);
    }

    private getTipoProducto(tipoCuenta: string): string {
        const productos: any = {
            'CORRIENTE': 'Cuenta Corriente',
            'AHORROS': 'Cuenta de Ahorros',
            'INVERSION': 'Cuenta de Inversión',
            'NOMINA': 'Cuenta Nómina',
            'PLAZO': 'Depósito a Plazo'
        };
        return productos[tipoCuenta] || 'Cuenta';
    }

    cancelar() {
        this.dialogRef.close();
    }
}
