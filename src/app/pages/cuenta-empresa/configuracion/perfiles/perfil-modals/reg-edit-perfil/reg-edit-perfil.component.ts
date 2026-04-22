import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ModulosService } from '@/pages/service/modulos.service';
import { ListaModulos } from '@/models/Modulos';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ListaPerfiles, RegistroPerfil } from '@/models/Perfiles';
import { PerfilesService } from '@/pages/service/perfiles.service';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
@Component({
    selector: 'app-reg-edit-perfil',
    standalone: true,
    imports: [ToggleSwitchModule,CommonModule, FormsModule, TableModule, ButtonModule, CheckboxModule, ToastModule, TooltipModule, InputTextModule, InputNumberModule, ReactiveFormsModule],
    providers: [MessageService],
    templateUrl: './reg-edit-perfil.component.html',
    styleUrls: ['./reg-edit-perfil.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class Reg_EditPerfilModulosComponent implements OnInit {
    modulos: ListaModulos[] = [];
    perfil!: ListaPerfiles;
    formAddPerfil!: FormGroup;
    modulosSeleccionados: ListaModulos[] = [];

    isUpdate: boolean = false;
    disableButtonAdd: boolean = false;
    disableButtonUpdate: boolean = false;

    constructor(
        private readonly modulosService: ModulosService,
        private readonly perfilService: PerfilesService,
        private dialogRef: DynamicDialogRef,
        private config: DynamicDialogConfig,
        public toastr: MessageService,
        private readonly fb: FormBuilder,
    ) {
        this.isUpdate = !(config.data);
    }
    async ngOnInit() {
        this.perfil = this.config.data ? this.config.data : {} as ListaPerfiles;
        this.createformAddPerfil();
        await this.loadModulos();
    }

    createformAddPerfil() {
        this.formAddPerfil = this.fb.group({
            nombre: new FormControl(((this.config.data) ? this.perfil.nombre : null), [Validators.required]),
            descripcion: new FormControl(((this.config.data) ? this.perfil.descripcion : null), [Validators.required]),
            flagAutonomia: new FormControl(true, [Validators.required]),
        })
    }

    async loadModulos() {
        try {
            const response = await this.modulosService.listar_modulos(1, 'codigoCanalEjemplo', 'usuarioEjemplo');
            if (response?.codigo === 1) {
                this.modulos = Array.isArray(response.data) ? response.data : [];
                // Inicializar seleccionado como false para cada módulo
                this.modulos.forEach(modulo => {
                    modulo.seleccionado = false;
                });
                this.modulosSeleccionados = [];
            }

        } catch (error) {
            console.error('Error:', error);
        } finally {

        }
    }

    toggleModuloCheckbox(modulo: ListaModulos) {
        
        modulo.seleccionado = !modulo.seleccionado;
        // Actualizar el array de seleccionados
        if (modulo.seleccionado) {
            if (!this.modulosSeleccionados.includes(modulo)) {
                this.modulosSeleccionados.push(modulo);
            }
        } else {
            const index = this.modulosSeleccionados.indexOf(modulo);
            if (index > -1) {
                this.modulosSeleccionados.splice(index, 1);
            }
        }
    }

    seleccionarTodos() {
        this.modulos.forEach(m => {
            m.seleccionado = true;
        });
        this.modulosSeleccionados = [...this.modulos];
    }

    deseleccionarTodos() {
        this.modulos.forEach(m => {
            m.seleccionado = false;
        });
        this.modulosSeleccionados = [];
    }


    async updatePerfil() {

        this.disableButtonUpdate = true;
        try {
            let registroPerfil: RegistroPerfil = {
                idPerfil: this.perfil.idPerfil,
                nombre: this.formAddPerfil.get('nombre')!.value,
                descripcion: this.formAddPerfil.get('descripcion')!.value,
                flagAutonomia: false,
                //opciones: this.modulos.filter(m => m.seleccionado).map(m => ({ opcionId: m.idModulo }))
            }
            const response = await this.perfilService.update_perfil(registroPerfil);
            if (response?.codigo === 1) {
                this.toastr.add({ severity: 'success', summary: 'Éxito', detail: `Perfil actualizado correctamente` });
            } else {
                this.toastr.add({ severity: 'error', summary: 'Actualización fallida', detail: `No se pudo actualizar el perfil` });
            }
            this.disableButtonUpdate = false;
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async guardar() {
        this.disableButtonAdd = true;
        
        // Obtener módulos seleccionados
        const modulosSeleccionadosList = this.modulosSeleccionados.map(m => ({ opcionId: m.opcionId }));
        
        if (modulosSeleccionadosList.length === 0) {
            this.toastr.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe seleccionar al menos un módulo'
            });
            this.disableButtonAdd = false;
            return;
        }

        try {
            let registroPerfil: RegistroPerfil = {
                idPerfil: this.perfil.idPerfil,
                nombre: this.formAddPerfil.get('nombre')!.value,
                descripcion: this.formAddPerfil.get('descripcion')!.value,
                flagAutonomia: false,
                //opciones: modulosSeleccionadosList
            }
            const response = await this.perfilService.create_perfil(registroPerfil);

            if (response?.codigo === 1) {
                this.dialogRef.close({
                    event: 'close', accion: 'update'
                })
                this.toastr.add({ severity: 'success', summary: 'Éxito', detail: `Perfil actualizado correctamente` });
            } else {
                this.toastr.add({ severity: 'error', summary: 'Actualización fallida', detail: `No se pudo actualizar el perfil` });
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
