import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { ModulosService } from '@/pages/service/modulos.service';
import { ListaModulos, RegistroModulos } from '@/models/Modulos';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    selector: 'app-reg-edit-modulos',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, CheckboxModule, ToastModule, TooltipModule, InputTextModule, InputNumberModule, ReactiveFormsModule],
    providers: [MessageService, DialogService],
    templateUrl: './reg-edit-modulos.component.html',
    styleUrls: ['./reg-edit-modulos.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.Emulated
})
export class Reg_EditModulosComponent implements OnInit {
   
    modulo!: ListaModulos;
    formAddPerfil!: FormGroup;

    isUpdate: boolean = false;
    disableButtonAdd: boolean = false;
    disableButtonUpdate: boolean = false;

    constructor(
        private readonly modulosService: ModulosService,        
        private dialogRef: DynamicDialogRef,
        private config: DynamicDialogConfig,
        public toastr: MessageService,
        private readonly fb: FormBuilder,
    ) {
        this.isUpdate = !(config.data);
    }
    async ngOnInit() {
        this.modulo = this.config.data ? this.config.data : {} as ListaModulos;
        this.createformAddPerfil();      
    }

    createformAddPerfil() {
        this.formAddPerfil = this.fb.group({
            nombre: new FormControl(((this.config.data) ? this.modulo.nombre : null), [Validators.required]),
            descripcion: new FormControl(((this.config.data) ? this.modulo.descripcion : null), [Validators.required])
        })
    }

    async updatePerfil() {

        this.disableButtonUpdate = true;
        try {
            let registroPerfil: RegistroModulos = {
                opcionId: this.modulo.opcionId,
                nombre: this.formAddPerfil.get('nombre')!.value,
                descripcion: this.formAddPerfil.get('descripcion')!.value,              
            }
            const response = await this.modulosService.modify_modulo(registroPerfil);
            if (response?.codigo === 1) {
                this.toastr.add({ severity: 'success', summary: 'Éxito', detail:  response?.mensaje });
            } else {
                this.toastr.add({ severity: 'error', summary: 'Actualización fallida', detail:  response?.mensaje});
            }
            this.disableButtonUpdate = false;
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async guardar() {
        this.disableButtonAdd = true;
     
        try {
            let registroModulos: RegistroModulos = {
                opcionId: this.modulo.opcionId,
                nombre: this.formAddPerfil.get('nombre')!.value,
                descripcion: this.formAddPerfil.get('descripcion')!.value        
            }
            const response = await this.modulosService.create_modulo(registroModulos);
            if (response?.codigo === 1) {            
                this.toastr.add({ severity: 'success', summary: 'Éxito', detail: response?.mensaje });
            } else {
                this.toastr.add({ severity: 'error', summary: 'Actualización fallida', detail:  response?.mensaje });
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
