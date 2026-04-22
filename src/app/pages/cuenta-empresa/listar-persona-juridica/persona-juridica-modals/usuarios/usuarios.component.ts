import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { RegistroUsuariosComponent } from '../registro-usuarios/registro-usuarios.component';
import { ListaUsuario, RegistroUsuario } from '@/models/Usuario';
import { UsuarioService } from '@/pages/service/usuario.service';


@Component({
    selector: 'app-usuarios',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, InputTextModule, TooltipModule, ToastModule],
    providers: [MessageService],
    templateUrl: './usuarios.component.html',
    styleUrls: ['./usuarios.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class UsuariosComponent implements OnInit {
    usuarios: ListaUsuario[] = [];
    loading = false;

    constructor(

        private readonly usuarioService: UsuarioService,
        private readonly dialogRef: DynamicDialogRef,
        private readonly config: DynamicDialogConfig,
        public toastr: MessageService,
        private readonly dialogService: DialogService,
        private readonly cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadUsuarios();
    }

    async loadUsuarios() {
        try {
            this.loading = true;
            this.cdr.markForCheck();

            const response = await this.usuarioService.listar_usuarios(1, 'codigoCanalEjemplo', 'usuarioEjemplo');
            if (response?.codigo === 1) {
                this.usuarios = Array.isArray(response.data) ? response.data : [];
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            this.loading = false;
            this.cdr.markForCheck();
        }
    }

     editarUsuario(usuario: ListaUsuario) {
       const ref = this.dialogService.open(RegistroUsuariosComponent, {
            header: 'Editar Usuario',
            width: '50vw',
            modal: true,
            data: 
             { idPersonaJuridica: this.config.data?.idPersonaJuridica, usuario: usuario }
        });

        ref?.onClose.subscribe((nuevoUsuario: any) => {
            if (nuevoUsuario) {
                // this.usuarios.push(nuevoUsuario);
                // this.toastr.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario registrado correctamente' });
            }
        });
    }

    abrirModalRegistroUsuarios() {
        const ref = this.dialogService.open(RegistroUsuariosComponent, {
            header: 'Registrar Nuevo Usuario',
            width: '50vw',
            modal: true,
            data: { idPersonaJuridica: this.config.data?.idPersonaJuridica, usuario: null  }
        });

        ref?.onClose.subscribe((nuevoUsuario: any) => {
            if (nuevoUsuario) {
                // this.usuarios.push(nuevoUsuario);
                // this.toastr.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario registrado correctamente' });
            }
        });
    }

    async eliminarUsuario(usuario: ListaUsuario) {

        try {
            let registroUsuario: RegistroUsuario = { idUsuario: usuario.idUsuario }
            const response = await this.usuarioService.delete_usuario(registroUsuario);

            if (response?.codigo === 1) {
                this.toastr.add({ severity: 'success', summary: 'Éxito', detail: response?.mensaje });
            } else {
                this.toastr.add({ severity: 'error', summary: 'Eliminación fallida', detail: response?.mensaje });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
    cancelar() {
        this.dialogRef.close();
    }
}
