import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, ReactiveFormsModule, FormArray, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { FileUploadModule } from 'primeng/fileupload';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { CuentaRegistroUsuario, ListaUsuario, RegistroUsuario } from '@/models/Usuario';
import { UsuarioService } from '@/pages/service/usuario.service';
import { PerfilesService } from '@/pages/service/perfiles.service';
import { ListaPerfiles } from '@/models/Perfiles';
import { CommonService } from '@/pages/service/commonService';
@Component({
    selector: 'app-registro-usuarios',
    templateUrl: './registro-usuarios.component.html',
    styleUrls: ['./registro-usuarios.component.scss'],
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
        MultiSelectModule,
        FileUploadModule,
        CardModule,
        DividerModule
    ],
    providers: [MessageService],
    encapsulation: ViewEncapsulation.Emulated
})
export class RegistroUsuariosComponent implements OnInit {
    formUsuario!: FormGroup;
    tiposDocumento: any[] = [];
    estadosOptions: any[] = [];
    cuentasDisponibles: any[] = [];
    perfilesDisponibles: ListaPerfiles[] = [];
    imagenDocumento: any = null;
    mostrarAutonomia: boolean = false;
    monedaBase: string = 'USD';
    idPersonaJuridica: string = '';
    selectedFile: File | null = null;
    perfilActual: any = null;
    usuarioEncontrado: boolean = false;
    buscandoUsuario: boolean = false;
    usuariosDisponibles: any[] = [];
    isUpdate: boolean = false;
    disableButtonAdd: boolean = false;
    disableButtonUpdate: boolean = false;
    usuario!: ListaUsuario;

    constructor(
        private readonly fb: FormBuilder,
        private readonly toastr: MessageService,
        private readonly usuarioService: UsuarioService,
        private readonly perfilService: PerfilesService,
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private readonly cdr: ChangeDetectorRef,
        private readonly commonService: CommonService,
    ) {
        this.isUpdate = this.config.data?.usuario == null;
    }

    ngOnInit() {
        this.usuario = this.config.data?.usuario ? this.config.data.usuario : {} as ListaUsuario;

        this.idPersonaJuridica = this.config.data?.idPersonaJuridica || '';
        this.getCombos();
        this.createFormulario();
        this.cargarCuentasDisponibles();
        this.cargarPerfilesDisponibles();
        this.cargarUsuariosDisponibles();
        if (this.usuario != null) {
            this.usuario.cuentas = this.usuario.cuentas || [];

            console.log('Usuario recibido en el modal:', this.usuario.cuentas);

            const perfilId = this.usuario.perfiles?.length ? this.usuario.perfiles[0].idPerfil : null;
            this.formUsuario.patchValue({
                tipoDocumento: this.usuario.tipoDocumento,
                numeroDocumento: this.usuario.dni,
                nombres: this.usuario.nombre,
                apellidosPaterno: this.usuario.apellidoPaterno,
                apellidosMaterno: this.usuario.apellidoMaterno,
                correo: this.usuario.correo,
                celular: this.usuario.celular,
                estado: this.usuario.estado,
                perfil: perfilId
            });

            // Cargar documento si existe
            if (this.usuario.documento && this.usuario.documento.length > 0) {
                const doc = this.usuario.documento[0];
                this.imagenDocumento = {
                    rutaDocumento: doc.rutaDocumento,
                    fileBase64: doc.fileBase64
                };
            }

            // Si el perfil está disponible, cargar las cuentas con checkboxes seteados
            if (perfilId) {
                setTimeout(() => {
                    this.onPerfilChange({ value: perfilId });
                }, 100);
            }
        }
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

    createFormulario() {
        this.formUsuario = this.fb.group({
            tipoDocumento: new FormControl(null, [Validators.required]),
            numeroDocumento: new FormControl('', [Validators.required, Validators.pattern(/^\d{8}$/)]),
            nombres: new FormControl('', [Validators.required, Validators.maxLength(255)]),
            apellidosPaterno: new FormControl('', [Validators.required, Validators.maxLength(255)]),
            apellidosMaterno: new FormControl('', [Validators.required, Validators.maxLength(255)]),
            correo: new FormControl('', [Validators.required, Validators.email]),
            celular: new FormControl('', [Validators.required, Validators.pattern(/^\d{9}$/)]),
            perfil: new FormControl(null, [Validators.required]),
            cuentasAcceso: new FormArray([])
        });
    }

    get cuentasAccesoArray(): FormArray {
        return this.formUsuario.get('cuentasAcceso') as FormArray;
    }

    get cuentasAccesoControls() {
        return (this.formUsuario.get('cuentasAcceso') as FormArray).controls as FormGroup[];
    }

    cargarCuentasDisponibles() {
        // TODO: Reemplazar con llamada a tu servicio
        // this.cuentasDisponibles = this.cuentaService.obtenerCuentas();

        // Datos de ejemplo
        this.cuentasDisponibles = [
            { label: 'Ahorros Oh - 12345678', value: '9007199254740991', idCuenta: 1 },
            { label: 'Cuenta Corriente - 87654321', value: '9007199254740992', idCuenta: 2 },
            { label: 'Cuenta de Inversión - 11223344', value: '9007199254740993', idCuenta: 3 },
            { label: 'DPF - 55667788', value: '9007199254740994', idCuenta: 4 }
        ];
    }

    async cargarPerfilesDisponibles() {
        // TODO: Reemplazar con llamada a tu servicio       
        try {
            const response = await this.perfilService.listar_perfiles(1, 'codigoCanalEjemplo', 'usuarioEjemplo');
            if (response?.codigo === 1) {
                this.perfilesDisponibles = Array.isArray(response.data) ? response.data : [];
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    cargarUsuariosDisponibles() {
        // TODO: Reemplazar con llamada a tu servicio
        // this.usuariosDisponibles = this.usuarioService.obtenerUsuarios();

        // Datos de ejemplo - usuarios que se pueden buscar
        this.usuariosDisponibles = [
            {
                tipoDocumento: 'DNI',
                numeroDocumento: '12345678',
                nombres: 'Juan',
                apellidos: 'Pérez García',
                correo: 'juan.perez@example.com',
                celular: '987654321'
            },
            {
                tipoDocumento: 'DNI',
                numeroDocumento: '87654321',
                nombres: 'María',
                apellidos: 'López Martínez',
                correo: 'maria.lopez@example.com',
                celular: '912345678'
            },
            {
                tipoDocumento: 'PASAPORTE',
                numeroDocumento: '11223344',
                nombres: 'Carlos',
                apellidos: 'González Rodríguez',
                correo: 'carlos.gonzalez@example.com',
                celular: '998765432'
            },
            {
                tipoDocumento: 'DNI',
                numeroDocumento: '55667788',
                nombres: 'Ana',
                apellidos: 'Rodríguez Flores',
                correo: 'ana.rodriguez@example.com',
                celular: '945678901'
            }
        ];
    }

    buscarUsuario() {
        const tipoDocumento = this.formUsuario.get('tipoDocumento')?.value;
        const numeroDocumento = this.formUsuario.get('numeroDocumento')?.value;

        if (!tipoDocumento || !numeroDocumento) {
            this.toastr.add({
                severity: 'warning',
                summary: 'Validación',
                detail: 'Ingrese tipo y número de documento'
            });
            return;
        }

        this.buscandoUsuario = true;

        // Simular delay de búsqueda
        setTimeout(() => {
            // Buscar el usuario en la lista disponible
            const usuarioEncontrado = this.usuariosDisponibles.find(
                u => u.tipoDocumento === tipoDocumento && u.numeroDocumento === numeroDocumento
            );

            if (usuarioEncontrado) {
                // Llenar los campos del formulario
                this.formUsuario.patchValue({
                    nombres: usuarioEncontrado.nombres,
                    apellidos: usuarioEncontrado.apellidos,
                    correo: usuarioEncontrado.correo,
                    celular: usuarioEncontrado.celular
                });

                this.usuarioEncontrado = true;
                this.toastr.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: `Usuario ${usuarioEncontrado.nombres} ${usuarioEncontrado.apellidos} encontrado`
                });
            } else {
                this.usuarioEncontrado = false;

                // Limpiar campos de nombres, apellidos, correo y celular
                this.formUsuario.patchValue({
                    nombres: '',
                    apellidos: '',
                    correo: '',
                    celular: ''
                });

                this.toastr.add({
                    severity: 'error',
                    summary: 'No encontrado',
                    detail: 'No se encontró un usuario con esos datos. Por favor, complete los campos manualmente.'
                });
            }

            this.buscandoUsuario = false;
        }, 500);
    }

    onPerfilChange(event: any) {

        const perfilId = event.value;
        this.perfilActual = this.perfilesDisponibles.find(p => p.idPerfil === perfilId);

        // Limpiar las cuentas
        const cuentasArray = this.formUsuario.get('cuentasAcceso') as FormArray;
        cuentasArray.clear();

        if (this.perfilActual) {
            this.mostrarAutonomia = this.perfilActual.autonomia === 'Sí';
            this.cdr.markForCheck();

            // Obtener UIDs de cuentas del usuario actual (si estamos en modo edición)
            const uidsCuentasUsuario = this.usuario?.cuentas?.map((c: any) => c.uidCuenta.toString()) || [];

            // Crear un FormGroup por cada cuenta disponible
            this.cuentasDisponibles.forEach(cuenta => {
                // Verificar si esta cuenta está asignada al usuario
                const isSelected = uidsCuentasUsuario.includes(cuenta.value);

                const cuentaGroup = this.fb.group({
                    value: new FormControl(cuenta.value),
                    selected: new FormControl(isSelected),
                    limiteDiario: new FormControl(null),
                    limiteTransaccion: new FormControl(null),
                    numeroMaximoTransacciones: new FormControl(null)
                });
                cuentasArray.push(cuentaGroup);
            });
        }
    }

    onCuentaSelectionChange(index: number) {
        const cuentasArray = this.formUsuario.get('cuentasAcceso') as FormArray;
        const cuenta = cuentasArray.at(index) as FormGroup;
        const esSeleccionada = cuenta.get('selected')?.value;

        // Actualizar validadores según si está seleccionada y tiene autonomía
        if (this.mostrarAutonomia && esSeleccionada) {
            cuenta.get('limiteDiario')?.setValidators([Validators.required, Validators.min(0)]);
            cuenta.get('limiteTransaccion')?.setValidators([Validators.required, Validators.min(0)]);
            cuenta.get('numeroMaximoTransacciones')?.setValidators([Validators.required, Validators.min(1)]);
        } else {
            cuenta.get('limiteDiario')?.clearValidators();
            cuenta.get('limiteTransaccion')?.clearValidators();
            cuenta.get('numeroMaximoTransacciones')?.clearValidators();

            // Limpiar valores si se deselecciona
            if (!esSeleccionada) {
                cuenta.get('limiteDiario')?.reset();
                cuenta.get('limiteTransaccion')?.reset();
                cuenta.get('numeroMaximoTransacciones')?.reset();
            }
        }

        // Actualizar validadores
        cuenta.get('limiteDiario')?.updateValueAndValidity();
        cuenta.get('limiteTransaccion')?.updateValueAndValidity();
        cuenta.get('numeroMaximoTransacciones')?.updateValueAndValidity();

        // Marcar para detección de cambios
        this.cdr.markForCheck();

        // Validar que al menos una cuenta esté seleccionada
        this.validarCuentasSeleccionadas();
    }

    validarCuentasSeleccionadas() {
        const cuentasArray = this.formUsuario.get('cuentasAcceso') as FormArray;
        const algunaSeleccionada = cuentasArray.value.some((cuenta: any) => cuenta.selected);

        if (algunaSeleccionada) {
            cuentasArray.setErrors(null);
        } else {
            cuentasArray.setErrors({ 'requireCheckedToEqual': true });
        }
    }

    getNombreCuenta(valor: string): string {
        const cuenta = this.cuentasDisponibles.find(c => c.value === valor);
        return cuenta ? cuenta.label : valor;
    }

    onFileUpload(event: any) {
        if (event.files && event.files.length > 0) {
            this.selectedFile = event.files[0];
            
            if (this.selectedFile) {
                const filereader = new FileReader();
                filereader.readAsDataURL(this.selectedFile);
        
                filereader.onload = () => {
                    
                    this.imagenDocumento = {
                        nombre: this.selectedFile!.name,
                        tamanio: this.selectedFile!.size,
                        file: filereader.result
                    };
                    this.toastr.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: `Archivo ${event.files[0].name} cargado correctamente`
                    });
                };
                filereader.onerror = () => {
                    this.toastr.add({ severity: 'error', summary: 'Carga fallida', detail: 'No se pudo cargar los archivos' });
                };
            }
        }
    }
    eliminarImagen() {
        this.imagenDocumento = null;
        this.selectedFile = null;
    }
    async updatePerfil() {

        if (this.formUsuario.invalid) {
            this.toastr.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Por favor completa todos los campos requeridos'
            });
            return;
        }
        this.disableButtonUpdate = true;
        try {
            
            const cuentasSeleccionadas: CuentaRegistroUsuario[] =
                (this.formUsuario.get('cuentasAcceso') as FormArray).value
                    .filter((c: any) => c.selected)
                    .map((c: any): CuentaRegistroUsuario => ({
                        uidCuenta: c.value
                    }));
            let registroUsuario: RegistroUsuario = {
                idUsuario: Math.floor(Math.random() * 10000),
                //idPersonaJuridica: this.idPersonaJuridica,
                tipoDocumento: this.formUsuario.get('tipoDocumento')?.value,
                dni: this.formUsuario.get('numeroDocumento')?.value,
                nombre: this.formUsuario.get('nombres')?.value,
                apellidoPaterno: this.formUsuario.get('apellidosPaterno')?.value,
                apellidoMaterno: this.formUsuario.get('apellidosMaterno')?.value,
                correo: this.formUsuario.get('correo')?.value,
                celular: this.formUsuario.get('celular')?.value,
                codInternoPj: this.formUsuario.get('estado')?.value,
                documento: {
                    rutaDocumento: '',
                    fileBase64: this.imagenDocumento?.file || ''
                },
                perfiles: [{ perfilId: this.formUsuario.get('perfil')?.value }],
                cuentas: cuentasSeleccionadas,
            }


            const response = await this.usuarioService.modify_usuario(registroUsuario);

            if (response?.codigo === 1) {
                this.toastr.add({ severity: 'success', summary: 'Éxito', detail: `Usuario modificado correctamente` });
                this.dialogRef.close({
                    event: 'close', accion: 'update'
                })

            } else {
                this.toastr.add({ severity: 'error', summary: 'Error', detail: `No se pudo modificar el usuario` });
            }
            this.disableButtonUpdate = false;
        } catch (error) {
            console.error('Error:', error);
        }

    }
    async guardar() {
        
        if (this.formUsuario.invalid) {
            this.toastr.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Por favor completa todos los campos requeridos'
            });
            return;
        }
        this.disableButtonAdd = true;
        try {

            const cuentasSeleccionadas: CuentaRegistroUsuario[] =
                (this.formUsuario.get('cuentasAcceso') as FormArray).value
                    .filter((c: any) => c.selected)
                    .map((c: any): CuentaRegistroUsuario => ({
                        uidCuenta: c.value
                    }));
            let registroUsuario: RegistroUsuario = {
                idUsuario: Math.floor(Math.random() * 10000),
                //idPersonaJuridica: this.idPersonaJuridica,
                tipoDocumento: this.formUsuario.get('tipoDocumento')?.value,
                dni: this.formUsuario.get('numeroDocumento')?.value,
                nombre: this.formUsuario.get('nombres')?.value,
                apellidoPaterno: this.formUsuario.get('apellidosPaterno')?.value,
                apellidoMaterno: this.formUsuario.get('apellidosMaterno')?.value,
                correo: this.formUsuario.get('correo')?.value,
                celular: this.formUsuario.get('celular')?.value,
                codInternoPj: this.formUsuario.get('estado')?.value,
                documento: {
                    rutaDocumento: '',
                    fileBase64: this.imagenDocumento?.file || ''
                },
                perfiles: [{ perfilId: this.formUsuario.get('perfil')?.value }],
                cuentas: cuentasSeleccionadas,
            }
            const response = await this.usuarioService.create_usuario(registroUsuario);
            if (response?.codigo === 1) {
                this.toastr.add({ severity: 'success', summary: 'Éxito', detail: `Usuario registrado correctamente` });
                this.dialogRef.close({
                    event: 'close', accion: 'create'
                })
            } else {
                this.toastr.add({ severity: 'error', summary: 'Error', detail: `No se pudo registrar el usuario` });
            }
            this.disableButtonAdd = false;
        } catch (error) {
            console.error('Error:', error);
        }
    }
    cancelar() {
        this.dialogRef.close();
    }
}
