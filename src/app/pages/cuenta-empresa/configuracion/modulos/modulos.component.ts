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
import { ModulosService } from '@/pages/service/modulos.service';
import { ListaModulos, RegistroModulos } from '@/models/Modulos';
import { Reg_EditModulosComponent } from './modals/reg-edit-modulos/reg-edit-modulos.component';

@Component({
    selector: 'app-modulos',
    templateUrl: './modulos.component.html',
    styleUrls: ['./modulos.component.scss'],
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
export class ModulosComponent implements OnInit {
    modulos: ListaModulos[] = [];
    loading: boolean = false;
    dropdownItem: any;
    dropdownItems: any[] = [];
    searchText: string = '';
    moduloSeleccionado: any;

    constructor(
        private readonly dialogService: DialogService,
        private readonly modulosService: ModulosService,
        private readonly toastr: MessageService
    ) { }

    ngOnInit() {
        this.loadModulos();
        this.loadDropdownItems();
    }

    loadDropdownItems() {
        this.dropdownItems = [
            { name: 'Nombre' },
            { name: 'Descripción' }
        ];
    }

    async loadModulos() {
        try {
            this.loading = true;
            const response = await this.modulosService.listar_modulos(1, 'codigoCanalEjemplo', 'usuarioEjemplo');
            if (response?.codigo === 1) {
                this.modulos = Array.isArray(response.data) ? response.data : [];
                console.log(response.mensaje);
            }
            this.loading = false;
        } catch (error) {
            console.error('Error:', error);
        } finally {
            this.loading = false;
        }
    }

    async buscar() {
        if (this.searchText.trim()) {
            this.toastr.add({
                severity: 'info',
                summary: 'Búsqueda',
                detail: `Buscando: ${this.searchText}`
            });
            await this.loadModulos();
        }
    }
   onNew() {
        const ref = this.dialogService.open(Reg_EditModulosComponent, {
            header: `Registrar Modulos`,
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

        // this.messageService.add({
        //     severity: 'info',
        //     summary: 'Información',
        //     detail: `Editando perfil: ${perfil.nombre}`
        // });
    }
    onEdit(modulo: ListaModulos) {
        const ref = this.dialogService.open(Reg_EditModulosComponent, {
            header: `Editar Modulos`,
            width: '30vw',
            modal: true,
            data: modulo
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

        // this.toastr.add({
        //     severity: 'info',
        //     summary: 'Información',
        //     detail: `Editando módulo: ${modulo.nombre}`
        // });
    }

    async onDelete(modulo: ListaModulos) {
        try {
            let registroPerfil: RegistroModulos = { opcionId: modulo.opcionId }
            const response = await this.modulosService.delete_modulo(registroPerfil);
            if (response?.codigo === 1) {
                this.toastr.add({ severity: 'success', summary: 'Éxito', detail: response?.mensaje });
            } else {
                this.toastr.add({ severity: 'error', summary: 'Actualización fallida', detail: response?.mensaje });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    onActivate(modulo: any) {
        modulo.estado = modulo.estado === 1 ? 0 : 1;
        this.toastr.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Módulo ${modulo.nombre} ${modulo.estado === 1 ? 'Activo' : 'Inactivo'}`
        });
    }

    onSelectModulo(modulo: any) {
        this.moduloSeleccionado = modulo;
    }
}
