import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { RegistroPersonaJuridicaComponent } from './registro-persona-juridica/registro-persona-juridica.component';
import { UsuariosComponent } from './persona-juridica-modals/usuarios/usuarios.component';
import { RegistrarCuentaComponent } from './persona-juridica-modals/registrar-cuenta/registrar-cuenta.component';
import { DocumentosPersonaJuridicaComponent } from './documentos-persona-juridica/documentos-persona-juridica.component';
import { CuentaEmpresa, DataCuentaEmpresa, ListaPersonaJuridica } from '@/models/CuentaEmpresa';
import { CuentaEmpresaService } from '@/pages/service/cuentaempresa.service';

@Component({
    selector: 'app-listar-persona-juridica',
    standalone: true,
    templateUrl: './listar-persona-juridica.component.html',
    styleUrls: ['./listar-persona-juridica.component.css'],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        ToastModule,
        MessageModule,
        TagModule,
        RippleModule,
        SelectModule,
        DynamicDialogModule,
    ],
    providers: [MessageService, DialogService],
})
export class ListarPersonaJuridicaComponent implements OnInit {
    personasJuridicas: ListaPersonaJuridica[] = [];
    cuentasPersonaSeleccionada: DataCuentaEmpresa[] = [];
    //cuentasPersonaSeleccionada: any[] = [];
    personaSeleccionada: any = null;
    loading = false;
    loadingCuenta = false;
    tipoBusqueda = [
        { name: 'RUC', code: '01' },
        { name: 'Razón Social', code: '02' }
    ];

    dropdownItem: any = null;
    textBuscar: any = null;

    constructor(
        private readonly messageService: MessageService,
        private readonly dialogService: DialogService,
        private readonly cuentaEmpresaService: CuentaEmpresaService) { }

    ngOnInit() {
        this.loadPersonasJuridicas();
    }

    /** La API usa `name` / `identNumber`; el front antiguo usaba `razonSocial` / `ruc`. */
    nombrePersona(persona: ListaPersonaJuridica | any): string {
        return persona?.name ?? persona?.razonSocial ?? '';
    }

    rucPersona(persona: ListaPersonaJuridica | any): string {
        return persona?.identNumber ?? persona?.ruc ?? '';
    }

    async loadPersonasJuridicas() {
        this.loading = true;
        try {
            const response = await this.cuentaEmpresaService.listar_persona_juridica_empresa(this.dropdownItem?.code, this.textBuscar || '');
            if (response?.codigo === 1) {
                this.personasJuridicas = Array.isArray(response.data) ? response.data : [];
            }
        } catch (error) {
            console.error('Error al cargar personas jurídicas:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar los datos',
            });
        } finally {
            this.loading = false;
        }
    }

 

    onSelectPersona(persona: ListaPersonaJuridica) {

        this.personaSeleccionada = persona;
        // Cargar cuentas de la persona jurídica seleccionada
        this.loadCuentasPersona(persona.customerUid || '');
    }

    async loadCuentasPersona(customerUid: string) {

        this.loadingCuenta = true;
        try {
            const response = await this.cuentaEmpresaService.listar_cuenta_por_empresa_juridica({ clientUids: [customerUid] });

            const ok = response?.codigo === 0 || response?.codigo === 1;
            if (ok && Array.isArray(response!.data)) {
                this.cuentasPersonaSeleccionada = response!.data;
            } else {
                this.cuentasPersonaSeleccionada = [];
            }
        } catch (error) {
            console.error('Error al cargar cuentas jurídicas:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar los datos',
            });
        } finally {
            this.loadingCuenta = false;
        }

        // Datos de ejemplo para cuentas de la persona jurídica
        // const cuentasPorRuc: any = {
        //     '20123456789': [
        //         { producto: 'Cuenta Corriente', numeroCuenta: '001234567890', estado: 'Activo', fechaApertura: '2022-01-15', fechaCierre: null },
        //         { producto: 'Cuenta de Ahorros', numeroCuenta: '001234567891', estado: 'Activo', fechaApertura: '2022-06-20', fechaCierre: null }
        //     ],
        //     '20234567890': [
        //         { producto: 'Cuenta Corriente', numeroCuenta: '002345678901', estado: 'Activo', fechaApertura: '2021-03-10', fechaCierre: null },
        //         { producto: 'Cuenta de Ahorros', numeroCuenta: '002345678902', estado: 'Inactivo', fechaApertura: '2021-08-05', fechaCierre: '2023-12-31' }
        //     ],
        //     '20345678901': [
        //         { producto: 'Cuenta Corriente', numeroCuenta: '003456789012', estado: 'Inactivo', fechaApertura: '2020-05-22', fechaCierre: '2023-06-15' }
        //     ]
        // };

        // this.cuentasPersonaSeleccionada = cuentasPorRuc[ruc] || [];
    }

    onView(persona: any, event: any) {
        event.stopPropagation();
        // TODO: Implementar lógica para ver detalles de una persona jurídica
        console.log('Ver persona:', persona);
    }

    onEdit(persona: any, event: any) {
        event.stopPropagation();
        const dialogRef = this.dialogService.open(RegistroPersonaJuridicaComponent, {
            header: 'Editar Persona Jurídica',
            width: '60vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,
            breakpoints: { '960px': '80vw', '640px': '90vw' },
            data: { persona: persona, isEdit: true }
        });
        if (dialogRef) {
            dialogRef.onClose.subscribe((result: any) => {
                if (result) {
                    console.log('Persona jurídica actualizada:', result);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Persona jurídica actualizada correctamente'
                    });
                    this.loadPersonasJuridicas();
                }
            });
        }
    }
    onAttachments(persona: any, event: any) {
        event.stopPropagation();
        const dialogRef = this.dialogService.open(DocumentosPersonaJuridicaComponent, {
            header: 'Documentos Persona Jurídica',
            width: '60vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,
            breakpoints: { '960px': '80vw', '640px': '90vw' },
            data: { persona: persona, isEdit: true }
        });
        if (dialogRef) {
            dialogRef.onClose.subscribe((result: any) => {
                // if (result) {
                //     console.log('Persona jurídica actualizada:', result);
                //     this.messageService.add({
                //         severity: 'success',
                //         summary: 'Éxito',
                //         detail: 'Persona jurídica actualizada correctamente'
                //     });
                //     this.loadPersonasJuridicas();
                // }
            });
        }
    }
    onUsers(persona: any, event: any) {
        event.stopPropagation();
        const dialogRef = this.dialogService.open(UsuariosComponent, {
            header: `Usuarios de ${this.nombrePersona(persona)}`,
            width: '60vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,
            breakpoints: { '960px': '95vw', '640px': '98vw' },
            data: { idPersonaJuridica: this.rucPersona(persona) }
        });

        if (dialogRef) {
            dialogRef.onClose.subscribe((result: any) => {
                if (result) {
                    console.log('Usuarios registrados:', result);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Usuarios registrados correctamente'
                    });
                }
            });
        }
    }

    onProfiles(persona: any, event: any) {
        event.stopPropagation();
        this.messageService.add({
            severity: 'info',
            summary: 'Información',
            detail: `Gestionando perfiles de: ${this.nombrePersona(persona)}`
        });
    }

    // onAttachments(persona: any, event: any) {
    //     event.stopPropagation();
    //     this.messageService.add({
    //         severity: 'info',
    //         summary: 'Información',
    //         detail: `Viendo archivos adjuntos de: ${persona.razonSocial}`
    //     });
    // }

    async onCreateAccount(persona: any, event: any) {
        event.stopPropagation();
        this.personaSeleccionada = persona;
        await this.loadCuentasPersona(persona.customerUid || '');

        const dialogRef = this.dialogService.open(RegistrarCuentaComponent, {
            header: `Crear Cuenta - ${this.nombrePersona(persona)}`,
            width: '50vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,
            breakpoints: { '960px': '95vw', '640px': '98vw' },
            data: { personaJuridica: persona }
        });

        if (dialogRef) {
            dialogRef.onClose.subscribe((result: any) => {
                if (result) {
                    const account: CuentaEmpresa = {
                        product: result.producto,
                        accountNumber: result.numeroCuenta,
                        accountStatus: result.estado,
                        accountOpeningDate: result.fechaApertura,
                        accountClosingDate: undefined,
                        accountTypeCode: result.tipoCuenta,
                        currencyCode: result.codigoMoneda
                    };
                    const fila: DataCuentaEmpresa = {
                        clientUid: persona?.customerUid ?? this.personaSeleccionada?.customerUid,
                        accounts: [account]
                    };
                    this.cuentasPersonaSeleccionada = [...this.cuentasPersonaSeleccionada, fila];
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Cuenta creada correctamente (simulación en pantalla; no se envía al servidor).'
                    });
                }
            });
        }
    }

    abrirModalRegistroPersonaJuridica() {
        const dialogRef = this.dialogService.open(RegistroPersonaJuridicaComponent, {
            header: 'Registrar Persona Jurídica',
            width: '60vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,
            breakpoints: { '960px': '80vw', '640px': '90vw' }
        });

        if (dialogRef) {
            dialogRef.onClose.subscribe((result: any) => {
                if (result) {
                    console.log('Persona jurídica registrada:', result);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Persona jurídica registrada correctamente'
                    });
                    // Aquí puedes agregar la persona a la lista o recargar los datos
                    // this.personasJuridicas.unshift(result);
                    this.loadPersonasJuridicas();
                }
            });
        }
    }
}
