import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { CheckboxModule } from 'primeng/checkbox';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-documentos-persona-juridica',
    templateUrl: './documentos-persona-juridica.component.html',
    styleUrls: ['./documentos-persona-juridica.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MessageModule,
        ToastModule,
        ButtonModule,
        InputTextModule,
        SelectModule,
        FileUploadModule,
        InputNumberModule,
        CardModule,
        DividerModule,
        CheckboxModule,
        InputGroupModule,
        InputGroupAddonModule,
        ToggleSwitchModule,
        TooltipModule
    ],
    providers: [MessageService],
    encapsulation: ViewEncapsulation.Emulated,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentosPersonaJuridicaComponent implements OnInit {
    formPersonaJuridica: FormGroup;    
    documentosRequeridos: any[] = [];
    documentosAdicionales: any[] = [];
    
 

    paisesOptions = [
        { label: 'Perú', value: 'PERU' },
        // { label: 'Colombia', value: 'COLOMBIA' },
        // { label: 'Chile', value: 'CHILE' },
        // { label: 'Argentina', value: 'ARGENTINA' }
    ];

    tiposDocumentoOptions = [
        { label: 'DNI', value: 'DNI' },
        { label: 'Pasaporte', value: 'PASAPORTE' },
        { label: 'Carné de Extranjería', value: 'CARNE_EXTRANJERIA' }
    ];

    constructor(
        private readonly fb: FormBuilder,
        private readonly messageService: MessageService,
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig
    ) {
        this.formPersonaJuridica = this.fb.group({
            ruc: new FormControl('', [Validators.required, Validators.pattern(/^\d{11}$/)]),
            razonSocial: new FormControl('', [Validators.required, Validators.maxLength(255)]),
            departamento: new FormControl(null, [Validators.required]),
            provincia: new FormControl(null, [Validators.required]),
            distrito: new FormControl(null, [Validators.required]),

            direccion: new FormControl('', [Validators.required, Validators.maxLength(500)]),
            telefonoContacto: new FormControl('', [Validators.required, Validators.pattern(/^\d{7,9}$/)]),
            tipoOrganizacion: new FormControl(null, [Validators.required]),
            sectorActividad: new FormControl('', [Validators.required, Validators.maxLength(255)]),
            clasificacion: new FormControl(null, [Validators.required]),
            paisConstitucion: new FormControl(null, [Validators.required]),
            aplicaITF: new FormControl(false)
        });
    }

    ngOnInit() {          
        this.inicializarDocumentosRequeridos();
    }
    onFileUpload(event: any, tipo: string, indexApoderado?: number, indexDocumento?: number) {
        if (event.files && event.files.length > 0) {
            const file = event.files[0];
            const archivoObj = {
                nombreArchivo: file.name,
                tipoArchivo: file.type,
                tamanoBytes: file.size,
                contenidoBase64: ''
            };

            if (tipo === 'requerido') {
                this.documentosRequeridos[indexApoderado!].archivo = archivoObj;
            } else if (tipo === 'adicional') {
                this.documentosAdicionales[indexApoderado!].archivo = archivoObj;
            } 

            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: `Archivo ${file.name} cargado correctamente`
            });
        }
    }


    registrar() {
        if (this.formPersonaJuridica.invalid) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Por favor completa todos los campos requeridos'
            });
            return;
        }

        // Validar que todos los documentos requeridos estén cargados
        const documentosRequeridosSinCargar = this.documentosRequeridos.filter(doc => !doc.archivo);
        if (documentosRequeridosSinCargar.length > 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Todos los documentos requeridos deben ser cargados'
            });
            return;
        }

        const datosPersonaJuridica = {
            ...this.formPersonaJuridica.value,           
            documentosRequeridos: this.documentosRequeridos,
            documentosAdicionales: this.documentosAdicionales
        };

        console.log('Datos a registrar:', datosPersonaJuridica);
        this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Persona jurídica registrada correctamente'
        });

        // Cerrar el modal y pasar los datos
        this.dialogRef.close(datosPersonaJuridica);
    }

    inicializarDocumentosRequeridos() {
        this.documentosRequeridos = [
            { 
                tipo: 'Vigencia de poderes', 
                archivo: {
                    nombreArchivo: 'Vigencia_Poderes.pdf',
                    tipoArchivo: 'application/pdf',
                    tamanoBytes: 2048,
                    contenidoBase64: 'JVBERi0xLjQKJeLjz9MNCjEgMCBvYmo8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PmVuZG9iaiAyIDAgb2JqPDwvVHlwZS9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxPj5lbmRvYmogMyAwIG9iajw8L1R5cGUvUGFnZQovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8L0ZvbnQgPDwvRjEgNSAwIFI+Pj4+Ci9QYXJlbnQgMiAwIFI+PmVuZG9iaiA0IDAgb2JqPDwvTGVuZ3RoIDU1Pj5zdHJlYW0KQlQKL0YxIDEyIFRmCjEwMCA3NTAgVGQKKFNhbXBsZSBQREYpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmogNSAwIG9iajw8L1R5cGUvRm9udC9TdWJ0eXBlL1R5cGUxL0Jhc2VGB250L0hlbHZldGljYT4+ZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMzUgMDAwMDAgbiAKMDAwMDAwMDI5MCAwMDAwMCBuIAowMDAwMDAwMzk5IDAwMDAwIG4gCnRyYWlsZXI8PC9TaXplIDYvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgoxNDkKJSVFT0Y='
                }, 
                requerido: true 
            },
            { 
                tipo: 'Escritura de constitución', 
                archivo: {
                    nombreArchivo: 'Escritura_Constitucion.pdf',
                    tipoArchivo: 'application/pdf',
                    tamanoBytes: 1536,
                    contenidoBase64: 'JVBERi0xLjQKJeLjz9MNCjEgMCBvYmo8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PmVuZG9iaiAyIDAgb2JqPDwvVHlwZS9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxPj5lbmRvYmogMyAwIG9iajw8L1R5cGUvUGFnZQovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8L0ZvbnQgPDwvRjEgNSAwIFI+Pj4+Ci9QYXJlbnQgMiAwIFI+PmVuZG9iaiA0IDAgb2JqPDwvTGVuZ3RoIDU1Pj5zdHJlYW0KQlQKL0YxIDEyIFRmCjEwMCA3NTAgVGQKKFNhbXBsZSBQREYpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmogNSAwIG9iajw8L1R5cGUvRm9udC9TdWJ0eXBlL1R5cGUxL0Jhc2VGB250L0hlbHZldGljYT4+ZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMzUgMDAwMDAgbiAKMDAwMDAwMDI5MCAwMDAwMCBuIAowMDAwMDAwMzk5IDAwMDAwIG4gCnRyYWlsZXI8PC9TaXplIDYvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgoxNDkKJSVFT0Y='
                }, 
                requerido: true 
            }
        ];

        // Agregar documento adicional de ejemplo
        this.documentosAdicionales = [
            {
                tipo: 'Certificado de registro mercantil',
                archivo: {
                    nombreArchivo: 'Certificado_Mercantil.pdf',
                    tipoArchivo: 'application/pdf',
                    tamanoBytes: 1024,
                    contenidoBase64: 'JVBERi0xLjQKJeLjz9MNCjEgMCBvYmo8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PmVuZG9iaiAyIDAgb2JqPDwvVHlwZS9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxPj5lbmRvYmogMyAwIG9iajw8L1R5cGUvUGFnZQovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8L0ZvbnQgPDwvRjEgNSAwIFI+Pj4+Ci9QYXJlbnQgMiAwIFI+PmVuZG9iaiA0IDAgb2JqPDwvTGVuZ3RoIDU1Pj5zdHJlYW0KQlQKL0YxIDEyIFRmCjEwMCA3NTAgVGQKKFNhbXBsZSBQREYpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmogNSAwIG9iajw8L1R5cGUvRm9udC9TdWJ0eXBlL1R5cGUxL0Jhc2VGB250L0hlbHZldGljYT4+ZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMzUgMDAwMDAgbiAKMDAwMDAwMDI5MCAwMDAwMCBuIAowMDAwMDAwMzk5IDAwMDAwIG4gCnRyYWlsZXI8PC9TaXplIDYvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgoxNDkKJSVFT0Y='
                }
            }
        ];
    }

    agregarDocumentoAdicional() {
        this.documentosAdicionales.push({ tipo: '', archivo: null, requerido: false });
    }

    eliminarDocumentoAdicional(index: number) {
        this.documentosAdicionales.splice(index, 1);
    }

    descargarArchivo(archivo: any) {
        if (!archivo || !archivo.nombreArchivo) {
            return;
        }
        try {
            const link = document.createElement('a');
            link.href = 'data:application/octet-stream;base64,' + (archivo.contenidoBase64 || '');
            link.download = archivo.nombreArchivo;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: `Archivo ${archivo.nombreArchivo} descargado correctamente`
            });
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al descargar el archivo'
            });
        }
    }

    previsualizarArchivo(archivo: any) {
        if (!archivo || !archivo.nombreArchivo) {
            return;
        }
        try {
            const extension = archivo.nombreArchivo.split('.').pop()?.toLowerCase();
            const mimeTypes: any = {
                'pdf': 'application/pdf',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'xls': 'application/vnd.ms-excel'
            };
            
            const mimeType = mimeTypes[extension] || 'application/octet-stream';
            const blob = new Blob([archivo.contenidoBase64 || ''], { type: mimeType });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            
            this.messageService.add({
                severity: 'info',
                summary: 'Previsualización',
                detail: `Abriendo ${archivo.nombreArchivo}`
            });
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se puede previsualizar este tipo de archivo'
            });
        }
    }

    cancelar() {
        this.dialogRef.close();
    }
}
