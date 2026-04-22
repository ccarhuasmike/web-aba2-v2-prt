import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-perfil-modulos',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, CheckboxModule, ToastModule, TooltipModule],
    providers: [MessageService],
    templateUrl: './perfil-modulos.component.html',
    styleUrls: ['./perfil-modulos.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.Emulated
})
export class PerfilModulosComponent implements OnInit {
    modulos: any[] = [];
    perfil: any;

    constructor(
        private dialogRef: DynamicDialogRef,
        private config: DynamicDialogConfig,
        public messageService: MessageService
    ) {}

    ngOnInit() {
        this.perfil = this.config.data?.perfil || {};
        this.loadModulos();
    }

    loadModulos() {
        // Módulos disponibles
        const todosModulos = [
            { id: 1, nombre: 'Dashboard', descripcion: 'Panel de control principal', seleccionado: false },
            { id: 2, nombre: 'Cuentas', descripcion: 'Gestión de cuentas bancarias', seleccionado: false },
            { id: 3, nombre: 'Transferencias', descripcion: 'Realizar transferencias', seleccionado: false },
            { id: 4, nombre: 'Consultas', descripcion: 'Consultar transacciones', seleccionado: false },
            { id: 5, nombre: 'Reportes', descripcion: 'Generar reportes', seleccionado: false },
            { id: 6, nombre: 'Administración', descripcion: 'Configuración del sistema', seleccionado: false },
            { id: 7, nombre: 'Usuarios', descripcion: 'Gestión de usuarios', seleccionado: false },
            { id: 8, nombre: 'Auditoría', descripcion: 'Registro de auditoría', seleccionado: false },
            { id: 9, nombre: 'Tokenización', descripcion: 'Gestión de tokenización', seleccionado: false }
        ];

        this.modulos = todosModulos;
    }

    toggleModulo(modulo: any) {
        modulo.seleccionado = !modulo.seleccionado;
    }

    seleccionarTodos() {
        this.modulos.forEach(m => m.seleccionado = true);
    }

    deseleccionarTodos() {
        this.modulos.forEach(m => m.seleccionado = false);
    }

    guardar() {
        const modulosSeleccionados = this.modulos.filter(m => m.seleccionado);
        
        if (modulosSeleccionados.length === 0) {
            this.messageService.add({ 
                severity: 'warn', 
                summary: 'Advertencia', 
                detail: 'Debe seleccionar al menos un módulo' 
            });
            return;
        }

        const resultado = {
            perfilId: this.perfil.id,
            modulosSeleccionados: modulosSeleccionados
        };

        this.messageService.add({ 
            severity: 'success', 
            summary: 'Éxito', 
            detail: 'Módulos asignados correctamente' 
        });

        this.dialogRef.close(resultado);
    }

    cancelar() {
        this.dialogRef.close();
    }
}
