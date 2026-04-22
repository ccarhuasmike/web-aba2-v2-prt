import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Attorney, DataTipoArchivo, RegistroPersonaJuridica } from '@/models/CuentaEmpresa';
import { CuentaEmpresaService } from '@/pages/service/cuentaempresa.service';
import { Clasification, TipoOrganizacion, Ubigeos } from '@/models/Common';
import { CommonService } from '@/pages/service/commonService';
import { TIPODOCUMENTO } from '@/utils/constantes';
import { UtilService } from '@/utils/util.services';

@Component({
    selector: 'app-registro-persona-juridica',
    templateUrl: './registro-persona-juridica.component.html',
    styleUrls: ['./registro-persona-juridica.component.scss'],
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
        TooltipModule,
        ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
    encapsulation: ViewEncapsulation.Emulated,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegistroPersonaJuridicaComponent implements OnInit {
    formPersonaJuridica: FormGroup;
    tiposOrganizacion: TipoOrganizacion[] = [];
    clasificaciones: Clasification[] = [];

    departamento: Ubigeos[] = [];
    provincia: Ubigeos[] = [];
    distritos: Ubigeos[] = [];
    paises: any[] = [];
    tiposDocumento: any[] = [];
    archivosAdjuntos: any[] = [];
    apoderados: any[] = [];
    documentosRequeridos: any[] = [];
    documentosAdicionales: any[] = [];
    modoEdicion: boolean = false;
    dataTipoArchivo: DataTipoArchivo | null = null;


    paisesOptions = [
        { label: 'Perú', value: 'PERU' },
        // { label: 'Colombia', value: 'COLOMBIA' },
        // { label: 'Chile', value: 'CHILE' },
        // { label: 'Argentina', value: 'ARGENTINA' }
    ];



    constructor(
        private readonly fb: FormBuilder,
        private readonly toastr: MessageService,
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private readonly cuentaEmpresaService: CuentaEmpresaService,
        private readonly commonService: CommonService,
        private readonly confirmationService: ConfirmationService,
    ) {



        this.formPersonaJuridica = this.fb.group({
            identDocNumber: new FormControl('', [Validators.required, Validators.pattern(/^\d{11}$/)]),
            name: new FormControl('', [Validators.required, Validators.maxLength(255)]),
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

    async ngOnInit() {
        this.getCombos();
        await this.cargarClasificaciones();
        await this.cargarTipoOrganizacion();
        await this.cargarDepartamento();
        this.paises = this.paisesOptions;
        await this.loadTipoArchivo();
        this.inicializarDocumentosRequeridos();
        await this.detectarModoEdicion();


    }

    async loadTipoArchivo() {
        try {
            const response = await this.cuentaEmpresaService.listar_tipo_archivo(0, 10);
            if (response?.codigo === 0) {
                this.dataTipoArchivo = response.data ? response.data : null;
            }
        } catch (error) {
            console.error('Error al cargar personas jurídicas:', error);
        } finally { }
    }
    getCombos() {
        this.commonService.getMultipleCombosPromiseCliente(['documentos/tipos']).then(resp => {

            this.tiposDocumento = resp[0].data.content
                .map((item: any) => {
                    return {
                        id: item['codigo'],
                        descripcion: item['nombre']
                    }
                });
        });
    }


    async cargarClasificaciones() {
        try {
            const response = await this.commonService.listar_Clasificacion();
            if (response?.codigo === 1) {
                this.clasificaciones = Array.isArray(response.data) ? response.data : [];
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
    async cargarTipoOrganizacion() {
        try {
            const response = await this.commonService.listar_TipoOrganizacion();
            if (response?.codigo === 1) {
                this.tiposOrganizacion = Array.isArray(response.data) ? response.data : [];
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async cargarDepartamento() {
        try {

            const response = await this.commonService.listar_Departamentos();
            this.departamento = Array.isArray(response) ? response : [];
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async cargarProvincia(idDepartamento: any) {

        try {
            console.log(idDepartamento.value);
            const response = await this.commonService.listar_Provincia(idDepartamento.value);

            this.provincia = Array.isArray(response) ? response : [];

        } catch (error) {
            console.error('Error:', error);
        }
    }
    async cargarDistrito(idProvincia: any) {
        try {
            const response = await this.commonService.listar_Distritos(this.formPersonaJuridica.value.departamento, idProvincia.value);

            this.distritos = Array.isArray(response) ? response : [];

        } catch (error) {
            console.error('Error:', error);
        }
    }

    async detectarModoEdicion() {
        // Detectar si estamos en modo edición desde los datos del modal
        if (this.config.data && this.config.data.isEdit) {
            this.modoEdicion = true;
            try {
                const response = await this.cuentaEmpresaService.detalle_empresa_id(this.config.data.persona.customerUid);
                if (response !== null) {
                    // Precargar datos principales del formulario
                    this.formPersonaJuridica.patchValue({
                        identDocNumber: response?.identDocNumber,
                        name: response?.name,
                        departamento: response?.dptUbigeo,
                        provincia: response?.prvUbigeo,
                        distrito: response?.dstUbigeo,
                        direccion: response?.address,
                        telefonoContacto: response?.contactPhone,
                        tipoOrganizacion: response?.organizationTypeId,
                        sectorActividad: response?.activitySector,
                        clasificacion: response?.classificationId,
                        paisConstitucion: response?.countryOfConstitution,
                        aplicaITF: response?.applyItf
                    });

                    if (response?.attorneys && Array.isArray(response.attorneys)) {
                        response.attorneys.forEach((apoderado: Attorney) => {
                            const formAprobador = this.fb.group({
                                id: new FormControl(apoderado.id, null),
                                activo: new FormControl(apoderado.active, [Validators.required]),
                                documentType: new FormControl(apoderado.documentType, [Validators.required]),
                                documentNumber: new FormControl(apoderado.documentNumber, [Validators.required, Validators.pattern(/^\d{8}$/)]),
                                firstName: new FormControl(apoderado.firstName, [Validators.required, Validators.maxLength(255)]),
                                paternalLastName: new FormControl(apoderado.paternalLastName, [Validators.required, Validators.maxLength(255)]),
                                maternalLastName: new FormControl(apoderado.maternalLastName, [Validators.required, Validators.maxLength(255)]),
                                address: new FormControl(apoderado.address, [Validators.maxLength(500)]),
                                phone: new FormControl(apoderado.phone, [Validators.pattern(/^\d{7,9}$/)]),
                                email: new FormControl(apoderado.email, [Validators.email]),
                                participationPercentage: new FormControl(apoderado.participationPercentage, [Validators.required, Validators.min(0), Validators.max(100)]),
                                documentos: new FormArray([])
                            });

                            apoderado.filesAttach?.forEach((doc: any) => {
                                const documentoForm = this.fb.group({
                                    tipo: new FormControl(doc.fileTypeId, [Validators.required, Validators.maxLength(255)]),
                                    archivo: new FormControl({
                                        nombreArchivo: doc.name,
                                        fileTypeId: doc.fileTypeId,
                                        tamanoBytes: doc.tamanoBytes,
                                        contenidoBase64: '',
                                        file: null,
                                        id: doc.id
                                    }, [Validators.required]),
                                    requerido: new FormControl(true)
                                });
                                (formAprobador.get('documentos') as unknown as FormArray).push(documentoForm);
                            });
                            this.apoderados.push(formAprobador);
                        });
                    }


                    /*vigencia de poderes */
                    if (response!.filesAttach!.filter((file: any) => file.code === "C001").length > 0) {
                        var fileVigenciaPoder = this.documentosRequeridos!.find((file: any) => file.fileType === TIPODOCUMENTO.VIGENCIA_PODER);
                        if (fileVigenciaPoder !== undefined) {
                            const foundVigencia = response!.filesAttach!.find((file: any) => file.code === "C001");
                            fileVigenciaPoder.archivo = {
                                nombreArchivo: foundVigencia!.name,
                                tipoArchivo: foundVigencia!.fileTypeId,
                                //tamanoBytes: foundVigencia!.tamanoBytes,
                                contenidoBase64: '',
                                file: null,
                                id: foundVigencia!.id,
                            };
                        }
                    }
                    /*escritura constitucion */
                    if (response!.filesAttach!.filter((file: any) => file.code === "C002").length > 0) {
                        var fileConstitucion = this.documentosRequeridos!.find((file: any) => file.fileType === TIPODOCUMENTO.MINUTA_CONSTITUCION);
                        if (fileConstitucion !== undefined) {
                            const foundConstitucion = response!.filesAttach!.find((file: any) => file.code === "C002");
                            fileConstitucion.archivo = {
                                nombreArchivo: foundConstitucion!.name,
                                tipoArchivo: foundConstitucion!.fileTypeId,
                                //tamanoBytes: foundConstitucion!.tamanoBytes,
                                contenidoBase64: '',
                                file: null,
                                id: foundConstitucion!.id,
                            };
                        }
                    }
                    /*documento adicional */
                    if (response!.filesAttach!.filter((file: any) => file.code === "C003").length > 0) {
                        response!.filesAttach!.filter((file: any) => file.code === "C003").forEach((file: any) => {
                            this.documentosAdicionales!.push({
                                tipo: file.name,
                                archivo: {
                                    nombreArchivo: file.name,
                                    tipoArchivo: file.fileTypeId,
                                    tamanoBytes: file.tamanoBytes,
                                    contenidoBase64: '',
                                    file: null,
                                    id: file!.id,
                                },
                                requerido: false,
                                fileType: TIPODOCUMENTO.DOCUMENTO_ADICIONALES
                            });
                        });
                    }
                }
            } catch (error) {
                console.error('Error al cargar personas jurídicas:', error);
                // this.messageService.add({
                //     severity: 'error',
                //     summary: 'Error',
                //     detail: 'Error al cargar los datos',
                // });
            } finally {
                //this.loading = false;
            }
        }
    }

    agregarApoderado() {
        const formApoderado = this.fb.group({
            id: new FormControl(0, null),
            activo: new FormControl(true, [Validators.required]),
            documentType: new FormControl(null, [Validators.required]),
            documentNumber: new FormControl('', [Validators.required, Validators.pattern(/^\d{8}$/)]),
            firstName: new FormControl('', [Validators.required, Validators.maxLength(255)]),
            paternalLastName: new FormControl('', [Validators.required, Validators.maxLength(255)]),
            maternalLastName: new FormControl('', [Validators.required, Validators.maxLength(255)]),
            address: new FormControl('', [Validators.maxLength(500)]),
            phone: new FormControl('', [Validators.pattern(/^\d{7,9}$/)]),
            email: new FormControl('', [Validators.email]),
            participationPercentage: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100)]),
            documentos: new FormArray([])
        });
        // Agregar el formulario del apoderado a la lista
        if (!Array.isArray(this.apoderados)) {
            this.apoderados = [];
        }
        this.apoderados.push(formApoderado);
    }

    agregarDocumentoApoderado(indexApoderado: number) {
        const apoderadoForm = this.apoderados[indexApoderado];
        const documentosArray = apoderadoForm.get('documentos') as FormArray;

        const documentoForm = this.fb.group({
            tipo: new FormControl('', [Validators.required, Validators.maxLength(255)]),
            archivo: new FormControl(null, [Validators.required]),
            requerido: new FormControl(true)
        });

        documentosArray.push(documentoForm);
    }

    eliminarDocumentoApoderado(indexApoderado: number, indexDocumento: number) {
        const apoderadoForm = this.apoderados[indexApoderado];
        const documentosArray = apoderadoForm.get('documentos') as FormArray;
        documentosArray.removeAt(indexDocumento);
    }

    obtenerDocumentosApoderado(indexApoderado: number): FormArray {
        const apoderadoForm = this.apoderados[indexApoderado];
        return apoderadoForm.get('documentos') as FormArray;
    }

    obtenerDocumentoForm(indexApoderado: number, indexDocumento: number): FormGroup {
        const documentosArray = this.obtenerDocumentosApoderado(indexApoderado);
        return documentosArray.at(indexDocumento) as FormGroup;
    }

    buscarApoderadoPorDocumento(apoderado: any, index: number) {
        const tipoDocumento = apoderado.get('tipoDocumento')?.value;
        const numeroDocumento = apoderado.get('numeroDocumento')?.value;

        if (!tipoDocumento || !numeroDocumento) {
            return;
        }

        // TODO: Implementar llamada a servicio para buscar apoderado por documento
        // Datos de ejemplo para demostración
        const datosEjemplo: any = {
            'DNI8': {
                nombre: 'Juan',
                apellido: 'Pérez García',
                direccion: 'Av. Principal 123, Lima',
                telefono: '987654321',
                correo: 'juan.perez@email.com'
            },
            'DNI123': {
                nombre: 'Carlos',
                apellido: 'López Rodríguez',
                direccion: 'Calle Secundaria 456, Lima',
                telefono: '912345678',
                correo: 'carlos.lopez@email.com'
            }
        };

        const key = `${tipoDocumento}${numeroDocumento.substring(0, 1)}`;
        const datosEncontrados = datosEjemplo[key];

        if (datosEncontrados) {
            apoderado.patchValue(datosEncontrados);
            this.toastr.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Datos del apoderado encontrados'
            });
        } else {
            // Limpiar campos si no encuentra
            apoderado.patchValue({
                nombre: '',
                apellido: '',
                direccion: '',
                telefono: '',
                correo: ''
            });
            this.toastr.add({
                severity: 'info',
                summary: 'Info',
                detail: 'No se encontraron datos. Por favor ingrese la información manualmente'
            });
        }
    }


    eliminarApoderado(index: number, apoderado: any) {
        if (apoderado.get('id')?.value > 0) {
            this.confirmationService.confirm({
                header: 'Eliminar apoderados',
                message: '¿Estás seguro de querer realizar esta acción?',
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
                    const response = await this.cuentaEmpresaService.delete_apoderado_id(0, apoderado.get('id')?.value);
                    if (response?.codigo === 0) {
                        this.toastr.add({ severity: 'success', summary: 'Éxito', detail: response?.mensaje });
                        this.apoderados.splice(index, 1);
                    } else {
                        this.toastr.add({ severity: 'warn', summary: 'Error', detail: response?.mensaje });
                    }
                },
                reject: () => {
                    this.toastr.add({ severity: 'error', summary: 'Error openDialogAprobar', detail: 'Error en el servicio de actualizar campaña' });
                }
            });
        } else {
            this.apoderados.splice(index, 1);
        }
    }

    onFileUpload(event: any, tipo: string, indexApoderado?: number, indexDocumento?: number) {
        if (event.files && event.files.length > 0) {
            const file = event.files[0];
            const archivoObj = {
                nombreArchivo: file.name,
                tipoArchivo: file.type,
                tamanoBytes: file.size,
                contenidoBase64: '',
                file: file
            };
            if (tipo === 'requerido') {
                this.documentosRequeridos[indexApoderado!].archivo = archivoObj;
            } else if (tipo === 'adicional') {
                this.documentosAdicionales[indexApoderado!].archivo = archivoObj;
            } else if (tipo === 'apoderado') {
                const apoderadoForm = this.apoderados[indexApoderado!];
                const documentosArray = apoderadoForm.get('documentos') as FormArray;
                const documentoForm = documentosArray.at(indexDocumento!);
                documentoForm.patchValue({ archivo: archivoObj });
            }

            this.toastr.add({
                severity: 'success',
                summary: 'Éxito',
                detail: `Archivo ${file.name} cargado correctamente`
            });
        }
    }

    eliminarArchivo(index: number) {
        this.archivosAdjuntos.splice(index, 1);
    }

    async registrar() {

        if (this.formPersonaJuridica.invalid) {
            this.toastr.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Por favor completa todos los campos requeridos'
            });
            return;
        }
        // Validar que todos los documentos requeridos estén cargados
        const documentosRequeridosSinCargar = this.documentosRequeridos.filter(doc => !doc.archivo);
        if (documentosRequeridosSinCargar.length > 0) {
            this.toastr.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Todos los documentos requeridos deben ser cargados'
            });
            return;
        }
        var listaAdjuntos: any[] = [];
        try {

            let apoderados_ = this.apoderados.map(apoderadoForm => {

                (apoderadoForm.get('documentos') as FormArray).value.forEach((element: any) => {
                    console.log('Documento del apoderado:', element);
                });
                let cuentasSeleccionadas: Attorney = {
                    documentNumber: apoderadoForm.get('documentNumber')?.value,
                    firstName: apoderadoForm.get('firstName')?.value,
                    paternalLastName: apoderadoForm.get('paternalLastName')?.value || '',
                    maternalLastName: apoderadoForm.get('maternalLastName')?.value || '',
                    address: apoderadoForm.get('address')?.value || '',
                    phone: apoderadoForm.get('phone')?.value || '',
                    email: apoderadoForm.get('email')?.value || '',
                    participationPercentage: apoderadoForm.get('participationPercentage')?.value || 0,
                    documentType: apoderadoForm.get('documentType')?.value || '',
                    filesAttach: (apoderadoForm.get('documentos') as FormArray).value.map((doc: any) => {

                        listaAdjuntos.push(doc.archivo?.file);
                        const index = listaAdjuntos.indexOf(doc.archivo?.file);
                        return {
                            name: doc.archivo?.nombreArchivo || '',
                            fileType: TIPODOCUMENTO.DNI_APODERADO || '',
                            path: doc.archivo?.path || '',
                            extension: doc.archivo?.nombreArchivo.substring(doc.archivo?.nombreArchivo.lastIndexOf('.') + 1).toLowerCase() || '',
                            fileIndex: index || 0,
                        }
                    })
                }
                return cuentasSeleccionadas;
            });
            let documentosRequeridosAux: any[] = [];
            if (this.documentosRequeridos.length > 0) {
                documentosRequeridosAux = this.documentosRequeridos.map((doc: any) => {

                    listaAdjuntos.push(doc.archivo?.file);
                    const index = listaAdjuntos.indexOf(doc.archivo?.file);
                    return {
                        name: doc.archivo?.nombreArchivo || '',
                        fileType: doc?.fileType || '',
                        path: doc.archivo?.path || '',
                        extension: doc.archivo?.nombreArchivo.substring(doc.archivo?.nombreArchivo.lastIndexOf('.') + 1).toLowerCase() || '',
                        fileIndex: index || 0,
                    }
                });
            }
            let documentosAdicionalesAux: any[] = [];
            if (this.documentosAdicionales.length > 0) {
                documentosAdicionalesAux = this.documentosAdicionales.map((doc: any) => {

                    listaAdjuntos.push(doc.archivo?.file);
                    const index = listaAdjuntos.indexOf(doc.archivo?.file);
                    return {
                        name: doc.archivo?.nombreArchivo || '',
                        fileType: doc.archivo?.fileType || '',
                        path: doc.archivo?.path || '',
                        extension: doc.archivo?.nombreArchivo.substring(doc.archivo?.nombreArchivo.lastIndexOf('.') + 1).toLowerCase() || '',
                        fileIndex: index || 0,
                    }
                });
            }

            console.log('Datos a registrar:', this.formPersonaJuridica.value);

            let registroPerfil: RegistroPersonaJuridica = {
                name: this.formPersonaJuridica.value.name,
                identDocNumber: this.formPersonaJuridica.value.identDocNumber,
                contactPhone: this.formPersonaJuridica.value.telefonoContacto,
                address: this.formPersonaJuridica.value.direccion,
                countryOfConstitution: this.formPersonaJuridica.value.paisConstitucion,
                organizationTypeId: this.formPersonaJuridica.value.tipoOrganizacion,
                classificationId: this.formPersonaJuridica.value.clasificacion,
                dptUbigeo: this.formPersonaJuridica.value.departamento,
                prvUbigeo: this.formPersonaJuridica.value.provincia,
                dstUbigeo: this.formPersonaJuridica.value.distrito,
                applyItf: this.formPersonaJuridica.value.aplicaITF,
                filesAttach: [...documentosRequeridosAux, ...documentosAdicionalesAux],
                attorneys: apoderados_,
                activitySector: this.formPersonaJuridica.value.sectorActividad,
                user: 'usuarioEjemplo', // TODO: Reemplazar c
                ubigeo: `${this.formPersonaJuridica.value.departamento}${this.formPersonaJuridica.value.provincia}${this.formPersonaJuridica.value.distrito}`,
                addressDetail: this.formPersonaJuridica.value.direccion
            }
            console.log('Registro Persona Jurídica:', registroPerfil);

            const formData = new FormData();
            // 🔹 IMPORTANTE: params como string
            formData.append('params', JSON.stringify(registroPerfil));
            listaAdjuntos.forEach((file, index) => {
                formData.append('files', file); // index0.pdf
            });
            const response = await this.cuentaEmpresaService.crear_persona_juridica(registroPerfil);
            if (response?.codigo === 1) {
                this.toastr.add({ severity: 'success', summary: 'Éxito', detail: response?.mensaje });
                this.dialogRef.close({
                    event: 'close', accion: 'update'
                })
            } else {
                this.toastr.add({ severity: 'error', summary: 'Actualización fallida', detail: `No se pudo actualizar el perfil` });
            }
            //this.disableButtonAdd = false;
        } catch (error) {
            console.error('Error:', error);
        }
    }

    inicializarDocumentosRequeridos() {
        this.documentosRequeridos = [
            { tipo: 'Vigencia de poderes', archivo: null, requerido: true, fileType: TIPODOCUMENTO.VIGENCIA_PODER },
            { tipo: 'Escritura de constitución', archivo: null, requerido: true, fileType: TIPODOCUMENTO.MINUTA_CONSTITUCION },            
        ];
    }

    agregarDocumentoAdicional() {
        this.documentosAdicionales.push({ tipo: '', archivo: null, requerido: false, fileType: TIPODOCUMENTO.DOCUMENTO_ADICIONALES });
    }

    eliminarDocumentoAdicional(index: number) {
        this.documentosAdicionales.splice(index, 1);
    }

    cambiarEstadoApoderado(index: number, apoderado: FormGroup) {
        const nuevoEstado = apoderado.get('activo')?.value ? '1' : '0';
        const flagEstado = apoderado.get('activo')?.value ? true : false;
        const apoderadoId = apoderado.get('id')?.value;
        this.confirmationService.confirm({
            message: `¿Deseas ${nuevoEstado === '1' ? 'habilitar' : 'deshabilitar'} este apoderado?`,
            header: 'Cambiar estado del apoderado',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {

                    const response = await this.cuentaEmpresaService.habilitar_desabilidad_apoderado_id(0, apoderadoId.toString(), flagEstado);

                    if (response?.codigo === 0) {
                        this.toastr.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: `Apoderado ${nuevoEstado === '1' ? 'habilitado' : 'deshabilitado'} correctamente`
                        });
                    } else {
                        this.toastr.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: response?.mensaje || 'Error al cambiar el estado'
                        });
                        // Revertir el cambio en el formulario
                        apoderado.patchValue({ activo: !apoderado.get('activo')?.value });
                    }
                } catch (error) {
                    console.error('Error al cambiar estado:', error);
                    this.toastr.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al cambiar el estado del apoderado'
                    });
                    // Revertir el cambio en el formulario
                    apoderado.patchValue({ activo: !apoderado.get('activo')?.value });
                }
            },
            reject: () => {
                // Revertir el cambio si el usuario cancela
                apoderado.patchValue({ activo: !apoderado.get('activo')?.value });
            }
        });
    }

    cancelar() {
        this.dialogRef.close();
    }

    previewDocumento(archivo: any) {

        if (!archivo) {
            this.toastr.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No hay archivo para mostrar'
            });
            return;
        }

        try {
            // Si el archivo tiene un ID, obtenerlo del servidor
            if (archivo.id) {
                this.cuentaEmpresaService.obtener_apoderado_archivo_id(archivo.id).then(response => {
                    if (response?.codigo === 0) {
                        const base64String = `data:application/octet-stream;base64,${response.data.base64Content}`;
                        const extension = response.data.extension || archivo.nombreArchivo.substring(archivo.nombreArchivo.lastIndexOf('.') + 1).toLowerCase();

                        // Abrir en nueva pestaña
                        const blob = UtilService.base64ToBlob(base64String, UtilService.getMimeType(extension));
                        const url = window.URL.createObjectURL(blob);
                        window.open(url, '_blank');

                        // Limpiar el objeto URL después de un tiempo
                        setTimeout(() => {
                            window.URL.revokeObjectURL(url);
                        }, 100);
                    } else {
                        this.toastr.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'No se pudo obtener el archivo'
                        });
                    }
                }).catch(error => {
                    console.error('Error al obtener archivo:', error);
                    this.toastr.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al obtener el archivo del servidor'
                    });
                });
            } else if (archivo.file) {
                // Si es un archivo nuevo sin ID, usar FileReader
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    const base64String = e.target.result;
                    const extension = archivo.nombreArchivo.substring(archivo.nombreArchivo.lastIndexOf('.') + 1).toLowerCase();

                    // Abrir en nueva pestaña
                    const blob = UtilService.base64ToBlob(base64String, UtilService.getMimeType(extension));
                    const url = window.URL.createObjectURL(blob);
                    window.open(url, '_blank');

                    // Limpiar el objeto URL después de un tiempo
                    setTimeout(() => {
                        window.URL.revokeObjectURL(url);
                    }, 100);
                };
                reader.readAsDataURL(archivo.file);
            } else {
                this.toastr.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No hay archivo para mostrar'
                });
            }
        } catch (error) {
            console.error('Error al mostrar preview:', error);
            this.toastr.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo mostrar la vista previa del archivo'
            });
        }
    }

    async descargarDocumento(archivo: any) {
        const response = await this.cuentaEmpresaService.obtener_apoderado_archivo_id(archivo.id);
        if (response?.codigo === 0) {
            UtilService.downloadBase64File(response.data.base64Content, response.data.name, response.data.extension);
        }
    }
    async descargarDocumentoEmpresa(archivo: any) {
        const response = await this.cuentaEmpresaService.obtener_empresa_archivo_id(archivo.id);
        if (response?.codigo === 0) {
            UtilService.downloadBase64File(response.data.base64Content, response.data.name, response.data.extension);
        }
    }
    previewDocumentoEmpresa(archivo: any) {
        if (!archivo) {
            this.toastr.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No hay archivo para mostrar'
            });
            return;
        }

        try {
            // Si el archivo tiene un ID, obtenerlo del servidor
            if (archivo.id) {
                this.cuentaEmpresaService.obtener_empresa_archivo_id(archivo.id).then(response => {
                    if (response?.codigo === 0) {
                        const base64String = `data:application/octet-stream;base64,${response.data.base64Content}`;
                        const extension = response.data.extension || archivo.nombreArchivo.substring(archivo.nombreArchivo.lastIndexOf('.') + 1).toLowerCase();

                        // Abrir en nueva pestaña
                        const blob = UtilService.base64ToBlob(base64String, UtilService.getMimeType(extension));
                        const url = window.URL.createObjectURL(blob);
                        window.open(url, '_blank');

                        // Limpiar el objeto URL después de un tiempo
                        setTimeout(() => {
                            window.URL.revokeObjectURL(url);
                        }, 100);
                    } else {
                        this.toastr.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'No se pudo obtener el archivo'
                        });
                    }
                }).catch(error => {
                    console.error('Error al obtener archivo:', error);
                    this.toastr.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al obtener el archivo del servidor'
                    });
                });
            } else if (archivo.file) {
                // Si es un archivo nuevo sin ID, usar FileReader
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    const base64String = e.target.result;
                    const extension = archivo.nombreArchivo.substring(archivo.nombreArchivo.lastIndexOf('.') + 1).toLowerCase();

                    // Abrir en nueva pestaña
                    const blob = UtilService.base64ToBlob(base64String, UtilService.getMimeType(extension));
                    const url = window.URL.createObjectURL(blob);
                    window.open(url, '_blank');

                    // Limpiar el objeto URL después de un tiempo
                    setTimeout(() => {
                        window.URL.revokeObjectURL(url);
                    }, 100);
                };
                reader.readAsDataURL(archivo.file);
            } else {
                this.toastr.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No hay archivo para mostrar'
                });
            }
        } catch (error) {
            console.error('Error al mostrar preview:', error);
            this.toastr.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo mostrar la vista previa del archivo'
            });
        }
    }
}
