import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FILE_TYPE } from '@/layout/Utils/constants/aba.constants';
import { CommonService } from '@/pages/service/commonService';
import { ListarCuentaCCEService } from './listar-cuenta-cce.service';
import { VerArchivoComponent } from '../ver-archivo/ver-archivo.component';

export interface ListarCCE {
    id: number;
    tipoRegistro: string;
    nroSolicitud: number;
    uidCliente: string;
    uidCuenta: string;
    celularAnterior: string;
    celular: string;
    numeroCuentaCci: string;
    primerNombre: string;
    segundoNombre: string;
    primerApellido: string;
    segundoApellido: string;
    tipoDocumento: string;
    numeroDocumento: string;
    codCanal: string;
    estado: string;
    nombDocumentoSustento: string;
    documentoSustento: string;
    usuarioCreacion: string;
    fechaCreacion: string;
}

@Component({
    selector: 'app-listar-cuenta-cce.component',
    templateUrl: './listar-cuenta-cce.component.html',
    styleUrls: ['./listar-cuenta-cce.component.scss'],
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TooltipModule],
    providers: [DialogService],
    encapsulation: ViewEncapsulation.None
})
export class ListarCuentaCCEComponent implements OnInit {
    uidCuenta: string;
    uidCliente: string;
    listCCE: ListarCCE[] = [];
    rows = 15;

    constructor(
        private readonly commonService: CommonService,
        private readonly listarCuentaCCEService: ListarCuentaCCEService,
        private readonly dialog: DialogService,
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig
    ) {
        this.uidCliente = config.data.uidCliente;
        this.uidCuenta = config.data.uidCuenta;
    }

    ngOnInit() {
        this.loadHistorico();
    }

    private async loadHistorico(): Promise<void> {
        const respuestaListarHistorico: any = await this.listarCuentaCCEService.getListarHistorico(
            this.uidCliente,
            this.uidCuenta
        );

        if (respuestaListarHistorico.codigo == 0) {
            this.listCCE = respuestaListarHistorico.data;
        }
    }

    openDialogVerArchivo(base64File: any, fileName: any): void {
        const type = base64File.substring(base64File.indexOf('/') + 1, base64File.indexOf(';base64'));
        const displayFile = true;

        if (type !== FILE_TYPE.PDF && type !== FILE_TYPE.JPEG && type !== FILE_TYPE.PNG) {
            this.commonService.downloadFile(base64File, fileName);
            return;
        }

        this.dialog.open(VerArchivoComponent, {
            width: '40vw',
            height: displayFile ? '90vh' : '150px',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            },
            data: {
                base64File,
                fileName,
                displayFile
            }
        });
    }

    close() {
        this.dialogRef.close({
            event: 'close'
        });
    }
}
