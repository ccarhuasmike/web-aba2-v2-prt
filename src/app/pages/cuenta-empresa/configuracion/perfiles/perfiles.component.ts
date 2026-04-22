import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { PerfilModulosComponent } from './perfil-modals/perfil-modulos/perfil-modulos.component';
import { ListaPerfiles, RegistroPerfil } from '@/models/Perfiles';
import { PerfilesService } from '@/pages/service/perfiles.service';
import { Reg_EditPerfilModulosComponent } from './perfil-modals/reg-edit-perfil/reg-edit-perfil.component';

@Component({
    selector: 'app-perfiles',
    templateUrl: './perfiles.component.html',
    styleUrls: ['./perfiles.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        TableModule,
        InputTextModule,
        SelectModule,
        ToastModule,
        TooltipModule
    ],
    providers: [MessageService, DialogService]
})
export class PerfilesComponent implements OnInit {
    perfiles: ListaPerfiles[] = [];


    loading: boolean = false;
    dropdownItem: any;
    dropdownItems: any[] = [];
    searchText: string = '';
    perfilSeleccionado: any;

    constructor(
        private readonly perfilService: PerfilesService,
        private readonly toastr: MessageService,
        private readonly dialogService: DialogService
    ) { }

    async ngOnInit() {
       await this.loadPerfiles();
        this.loadDropdownItems();
    }

    loadDropdownItems() {
        this.dropdownItems = [
            { name: 'Nombre' },
            { name: 'Descripción' }
        ];
    }

    async loadPerfiles() {
        try {
            this.loading = true;

            const response = await this.perfilService.listar_perfiles(1, 'codigoCanalEjemplo', 'usuarioEjemplo');

            if (response?.codigo === 1) {
                this.perfiles = Array.isArray(response.data) ? response.data : [];
                console.log(response.mensaje);
            }
            this.loading = false;
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async buscar() {
        if (this.searchText.trim()) {
            this.toastr.add({
                severity: 'info',
                summary: 'Búsqueda',
                detail: `Buscando: ${this.searchText}`
            });
            await this.loadPerfiles();
        }
    }
    onNew() {
        const ref = this.dialogService.open(Reg_EditPerfilModulosComponent, {
            header: `Registrar Perfil`,
            width: '30vw',
            modal: true,
            data: null
        });

        ref?.onClose.subscribe((result: any) => {
            if (result) {
                // this.messageService.add({
                //     severity: 'success',
                //     summary: 'Éxito',
                //     detail: 'Módulos asignados correctamente'
                // });
            }
        });        
    }
    onEdit(perfil: ListaPerfiles) {
        const ref = this.dialogService.open(Reg_EditPerfilModulosComponent, {
            header: `Editar Perfil`,
            width: '30vw',
            modal: true,
            data: perfil 
        });

        ref?.onClose.subscribe((result: any) => {
            if (result) {
                // this.messageService.add({
                //     severity: 'success',
                //     summary: 'Éxito',
                //     detail: 'Módulos asignados correctamente'
                // });
            }
        });

        // this.messageService.add({
        //     severity: 'info',
        //     summary: 'Información',
        //     detail: `Editando perfil: ${perfil.nombre}`
        // });
    }

    async onDelete(perfil: ListaPerfiles) {

        try {
            let registroPerfil: RegistroPerfil = { idPerfil: perfil.idPerfil }
            const response = await this.perfilService.delete_perfil(registroPerfil);

            if (response?.codigo === 1) {
                this.toastr.add({ severity: 'success', summary: 'Éxito', detail: response?.mensaje });
            } else {
                this.toastr.add({ severity: 'error', summary: 'Actualización fallida', detail: response?.mensaje });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    onActivate(perfil: any) {
        perfil.estado = perfil.estado === 'Activo' ? 'Inactivo' : 'Activo';
        this.toastr.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Perfil ${perfil.nombre} ${perfil.estado}`
        });
    }

    onManagePermissions(perfil: any) {
        const ref = this.dialogService.open(PerfilModulosComponent, {
            header: `Configurar Módulos - ${perfil.nombre}`,
            width: '70vw',
            modal: true,
            data: { perfil: perfil }
        });

        ref?.onClose.subscribe((result: any) => {
            if (result) {
                this.toastr.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Módulos asignados correctamente'
                });
            }
        });
    }

    onSelectPerfil(perfil: any) {
        this.perfilSeleccionado = perfil;
    }
}
