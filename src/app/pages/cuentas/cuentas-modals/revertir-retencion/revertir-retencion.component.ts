import { Component, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidationErrors , ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RevertirRetencionService } from './revertir-retencion.service';
import { CommonModule } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';


export function maxValueValidator(): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl) => {
    const formGroup = control as FormGroup;

    const importe = Number(formGroup.get('importe')?.value);
    const retenido = Number(formGroup.get('importeRetenido')?.value);

    return importe > retenido ? { maxValue: true } : null;
  };
}

@Component({
    selector: 'app-revertir-retencion',
    templateUrl: './revertir-retencion.component.html',
    styleUrls: ['./revertir-retencion.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputNumberModule,
        InputTextModule,
        FileUploadModule,
        ButtonModule,
        MessageModule,
        ToastModule
    ],
    providers: [MessageService],
    encapsulation: ViewEncapsulation.None
})
export class RevertirRetencionComponent  {
    uidCuenta: string;
    uidCliente: string;
    retencion: any = null;
    saldoDisponible: any;
    formRetencion: FormGroup;
    files: File[] = [];
    loadingFile = false;
    disableButton = false;

    constructor(
        private readonly revertirRetencionService: RevertirRetencionService,
        private readonly toastr: MessageService,
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig
    ) {
        this.uidCuenta = config.data.uidCuenta;
        this.uidCliente = config.data.uidCliente;
        this.retencion = config.data.retencion;
        this.saldoDisponible = config.data.saldoDisponible;
        this.formRetencion = new FormGroup({
            importe: new FormControl(this.retencion.importeTotal, [Validators.required]),
            importeRetenido: new FormControl(this.retencion.importeParcial, [Validators.required]),
            nombreArchivo: new FormControl(null),
            archivosAdjuntos: new FormControl(null)
        }, {
            validators: maxValueValidator()
        });
    }    

    registrarReversaRetencion() {
        this.disableButton = true;

        const formValue = this.formRetencion.value;

        const usuario = JSON.parse(localStorage.getItem('userABA')!);

        const object = {
            idRetencion: this.retencion.idRetencion,
            tipoRetencion: this.retencion.tipoRetencion,
            archivoSustento: formValue.archivosAdjuntos,
            nombreSustento: formValue.nombreArchivo,
            monto: Number(formValue.importe),
            saldoDisponible: this.saldoDisponible,
            uidCliente: this.uidCliente,
            uidCuenta: this.uidCuenta,
            codigoComercio: 4000,
            nombreComercio: 'comercio:test',
            idTerminal: 10001,
            idTransaccionTerminal: 1,
            usuarioCreacion: usuario.email
        };

        this.revertirRetencionService.postLiberacionRetencion(object)
            .pipe(
                finalize(() => {
                    this.disableButton = false;
                })
            ).subscribe((resp: any) => {
                this.dialogRef.close({
                    event: 'close', data: resp
                });
            }, (_error: any) => {
                this.dialogRef.close();
            });
    }

    removeAll() {
        this.files = [];
    }

    uploader(event: any) {
        this.loadingFile = true;
        this.files = event.files;
        const filereader = new FileReader();
        filereader.readAsDataURL(this.files[0]);
        filereader.onload = () => {
            this.formRetencion.get('archivosAdjuntos')!.setValue(filereader.result);
            this.formRetencion.get('nombreArchivo')!.setValue(this.files[0].name);
            this.toastr.add({ severity: 'info', summary: 'Carga exitosa', detail: `${this.files.length} archivos listos para enviar` });
            this.loadingFile = false;
        };
        filereader.onerror = () => {
            this.toastr.add({ severity: 'error', summary: 'Carga fallida', detail: 'No se pudo cargar los archivos' });
            this.loadingFile = false;
        };
    }

    changeModelImporte(event: any) {
        if (event.value === null) {
            this.formRetencion.get('importe')!.markAsDirty();
        } else {
            this.formRetencion.get('importe')!.markAsPristine();
        }
    }
    removeElement(event: any) {
        if (this.files.length > 0) {
            this.formRetencion.get('archivosAdjuntos')!.setValue(null);
            this.formRetencion.get('nombreArchivo')!.setValue(null);
            this.files = this.files.filter((element) => {
                return element !== event.file;
            });
        }
    }    
}
