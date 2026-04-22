import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { finalize, debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DOCUMENT, CURRENCY, ACCOUNT_TYPES } from '@/layout/Utils/constants/aba.constants';
import { CommonService } from '@/pages/service/commonService';
import { PagarRetencionService } from './pagar-retencion.service';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CommonModule } from '@angular/common';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { UtilService } from '@/utils/util.services';
export type MonedaTipo = keyof typeof CURRENCY;

export type AccountType = {
  bin: string;
  moneda: MonedaTipo;
  codigoMoneda: string;
};

@Component({
    selector: 'app-pagar-retencion',
    templateUrl: './pagar-retencion.component.html',
    styleUrls: ['./pagar-retencion.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AutoCompleteModule,
        ButtonModule,
        InputTextModule,
        TableModule,
        FileUploadModule,
        MessageModule,
        ToastModule
    ],
    providers: [MessageService],
    encapsulation: ViewEncapsulation.None
})
export class PagarRetencionComponent implements OnInit {
    public debouncerCalcularItf: Subject<any> = new Subject<any>();

    uidCliente: any = '';
    uidCuenta: any = '';
    numeroCuenta: any = '';
  tipoCuenta!: AccountType | undefined;
    idRetencion: any = null;
    capitalCapturado: number = 0;
    capitalRestante: number = 0;
    capitalDisponible: number = 0;
    capitalRetenido: number = 0;
    importeRetenido: number = 0;

    formBusqueda: FormGroup;
    formPagoRetencion: FormGroup;

    tipoDocumento: any[] = [];
    tipoPago: any[] = [];
    tipoBanco: any[] = [];
    tipoBeneficiario: any[] = [];
    tipoMotivoDesembolso: any[] = [];
    files: File[] = [];
    filteredElement: any[] = [];

    loadingFile = false;
    disableButton = false;
    activaCss = false;
    nroCaracter: number = 0;
    totalBeneficiarios: number = 0;

    constructor(
        private readonly commonService: CommonService,
        private readonly toastr: MessageService,
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private readonly pagoRetencionService: PagarRetencionService
    ) {
        const data = config.data;
        this.uidCliente = data.uidCliente;
        this.uidCuenta = data.uidCuenta;
        this.numeroCuenta = data.numeroCuenta;
        this.idRetencion = data.idRetencion;
        this.capitalCapturado = data.saldoDisponible;
        this.capitalRestante = data.saldoDisponible;
        this.capitalDisponible = data.saldoDisponible;
        this.capitalRetenido = data.saldoRetenido;
        this.importeRetenido = data.importeRetenido;

        this.formPagoRetencion = new FormGroup({
            beneficiarios: new FormArray([], [Validators.required]),
            nombreArchivo: new FormControl(null, [Validators.required]),
            archivosAdjuntos: new FormControl(null, [Validators.required]),
            capitalCapturado: new FormControl(this.capitalCapturado, [Validators.pattern(/^(\d+(\.\d+)?)$/)]),
            capitalRestante: new FormControl(this.capitalRestante, [Validators.pattern(/^(\d+(\.\d+)?)$/)]),
            tipoMoneda: new FormControl(null, [Validators.required])
        });

        this.formBusqueda = new FormGroup({
            id: new FormControl({ value: null, disabled: true }),
            nombres: new FormControl({ value: null, disabled: true }),
            tipoBeneficiario: new FormControl({ value: null, disabled: true }, [Validators.required]),
            tipoDocumento: new FormControl(null, [Validators.required]),
            nroDocumento: new FormControl(null, [Validators.required])
        });

        const numeroCuenta = this.numeroCuenta;
        const bin = numeroCuenta.slice(0, 2);
        this.tipoCuenta = ACCOUNT_TYPES.find(type => type.bin === bin) as AccountType | undefined;
    }

    ngOnInit() {
        this.getCombos();

        this.debouncerCalcularItf
            .pipe(debounceTime(1000))
            .subscribe((obj) => {
                this.calculateItf(obj.capital, obj.item);
            });
    }

    get beneficiarios(): FormArray {
        return this.formPagoRetencion.get('beneficiarios') as FormArray;
    }

    beneficiarioFormGroup(data: any): FormGroup {
        return new FormGroup({
            id: new FormControl(data.id, [Validators.required]),
            nombres: new FormControl(data.nombres, [Validators.required]),
            docIde: new FormControl(data.docIde, [Validators.required]),
            tipoDocIde: new FormControl(data.tipoDocIde, [Validators.required]),
            capital: new FormControl(0, [Validators.required]),
            porcentaje: new FormControl(0, [Validators.required, Validators.pattern(/^(\d+(\.\d+)?)$/)]),
            importeItf: new FormControl(0, [Validators.required, Validators.pattern(/^(\d+(\.\d+)?)$/)]),
            importePago: new FormControl(0, [Validators.required, Validators.pattern(/^(\d+(\.\d+)?)$/)]),
            medio: new FormControl(null, [Validators.required]),
            banco: new FormControl(null, [Validators.required])
        });
    }

    addBeneficiario() {
        if (this.totalBeneficiarios >= 1) {
            this.toastr.add({ severity: 'error', summary: 'No se pudo agregar beneficiario', detail: 'La máxima cantidad de beneficiarios es de 1' });
            return;
        }

        const objIndex = this.beneficiarios.value.findIndex((obj: any) => { return obj.id == this.formBusqueda.get('id')!.value });
        if (objIndex == -1) {
            this.beneficiarios.push(
                this.beneficiarioFormGroup({
                    id: this.formBusqueda.get('id')!.value,
                    nombres: this.formBusqueda.get('nombres')!.value,
                    docIde: this.formBusqueda.get('nroDocumento')!.value,
                    tipoDocIde: this.formBusqueda.get('tipoDocumento')!.value.id,
                })
            );

            this.totalBeneficiarios++;
            this.calculateMonto(0, 'porcentaje', { value: 100 });
        } else {
            this.toastr.add({ severity: 'warn', summary: 'No se permite duplicados', detail: 'Beneficiario ya agregado' });
        }
    }

    getCombos() {
        this.commonService.getMultipleCombosPromiseCliente(['documentos/tipos'])
            .then(resp => {
                this.tipoDocumento = resp[0]['data']['content']
                    .filter((item: any) => item['nombre'] == DOCUMENT.RUC)
                    .map((item: any) => {
                        return {
                            id: item['codigo'],
                            descripcion: item['nombre']
                        };
                    });
            });

        const tipoBeneficiario = this.tipoBeneficiario.find((e: any) =>
            e.descripcion === 'PERSONA JURIDICA'
        );

        this.formBusqueda.get('tipoBeneficiario')!.patchValue(tipoBeneficiario);

        this.commonService.getMultipleCombosPromise([
            'TIPO_PERSONA_LEGAL',
            'TIPO_PAGO_EHOST',
            'BANCO_EHOST',
            'MOTIVO_DESEMBOLSO',
            'TIPO_MONEDA_TRAMA'
        ]).then(resp => {
            this.tipoBeneficiario = resp[0]['data'].map((item: any) => {
                return {
                    id: item['codTablaElemento'],
                    descripcion: item['valCadLargo']
                };
            });

            const tipoBeneficiario = this.tipoBeneficiario.find((e: any) =>
                e.descripcion === 'PERSONA JURIDICA'
            );

            this.formBusqueda.get('tipoBeneficiario')!.patchValue(tipoBeneficiario);

            this.tipoPago = resp[1]['data'].filter((item: any) => item['valCadLargo'] == 'CHEQUE').map((item: any) => {
                return {
                    id: item['codTablaElemento'],
                    descripcion: item['valCadLargo']
                };
            });

            this.tipoBanco = resp[2]['data'].filter((item: any) => item['estParametro'] === 1).map((item: any) => {
                return {
                    id: item['codTablaElemento'],
                    descripcion: item['valCadLargo'],
                    desElemento: item['desElemento']
                };
            });

            this.tipoMotivoDesembolso = resp[3]['data'].map((item: any) => {
                return {
                    id: item['codTablaElemento'],
                    desElemento: item['desElemento'],
                    valCadLargo: item['valCadLargo'],
                    valCadCorto: item['valCadCorto']
                };
            });

            const tipoMoneda = resp[4]['data'].find((e: any) =>
                e.valCadLargo === this.tipoCuenta?.moneda
            );
            this.formPagoRetencion.get('tipoMoneda')!.patchValue(tipoMoneda);
        });
    }

    filterElement(event: any, data: any) {
        this.filteredElement = [];
        const query = event?.query ?? '';
        this.filteredElement = UtilService.filterByField(data, query, 'descripcion');
    }

    searchPersonas() {
        const obj = this.formBusqueda.value;

        for (const key in obj) {
            if (obj[key] !== null && typeof obj[key] === 'object') {
                obj[key] = obj[key].id;
            }
        }

        this.commonService.getBeneficiario(obj['tipoDocumento'], obj['nroDocumento'])
            .subscribe((resp: any) => {
                if (resp['codigo'] == 0) {
                    this.formBusqueda.get('nombres')!.setValue(`${resp['data'].razonSocial}`);
                    this.formBusqueda.get('id')!.setValue(resp['data'].idPersona);
                } else {
                    this.formBusqueda.get('nombres')!.setValue('Beneficiario no encontrado...');
                    this.formBusqueda.get('id')!.setValue(null);
                }
            }, (_error: any) => {
                this.toastr.add({ severity: 'error', summary: 'Error getBeneficiario', detail: 'Error en el servicio de obtener datos del beneficiario' });
            });
    }

    removeBeneficiario(index: number) {
        this.totalBeneficiarios--;
        this.beneficiarios.removeAt(index);
        this.sumaCapital();
    }

    sumaCapital() {
        let sumatoria = 0;
        this.beneficiarios.value.forEach((element: any) => {
            sumatoria = sumatoria + Number(element.capital);
        });

        this.capitalRestante = this.capitalCapturado - sumatoria;

        this.formPagoRetencion.get('capitalRestante')!.patchValue(this.capitalRestante);

        this.activaCss = this.capitalRestante < 0;
    }

    calculateMonto(index: any, label: any, event: any) {
        const beneficiarios = this.formPagoRetencion.get('beneficiarios') as FormArray;
        const item = beneficiarios.at(index);
        const valor = event.value;

        item.get(label)!.patchValue(valor);

        if (label == 'capital') {
            if (Number.isNaN(valor)) return;
            const valorPorcentaje = ((valor / this.importeRetenido) * 100);
            item.get('porcentaje')!.patchValue(valorPorcentaje);
        } else {
            if (Number.isNaN(valor)) return;
            const valorCapital = ((valor * this.importeRetenido) / 100);
            item.get('capital')!.patchValue(valorCapital.toFixed(2));
        }

        const capital = Number(item.get('capital')!.value);
        this.debouncerCalcularItf.next({ capital: capital, item: item });
        this.sumaCapital();
    }

    calculateItf(capital: any, item: any) {
        if (capital >= 1000 && this.tipoCuenta) {
            this.commonService.getCalculoItf(CURRENCY[this.tipoCuenta.moneda].CODIGO, capital)
                .subscribe((resp: any) => {
                    if (resp['codigo'] == 0) {
                        const itfCliente = Number(resp['data'].comisionItf);
                        item.get('importeItf')!.patchValue(itfCliente);
                        item.get('importePago')!.patchValue(capital - itfCliente);
                    } else {
                        item.get('importeItf')!.patchValue(0);
                        item.get('importePago')!.patchValue(0);
                        this.toastr.add({ severity: 'error', summary: 'Error calculateItf', detail: resp['mensaje'] });
                    }
                }, (_error: any) => {
                    item.get('importeItf')!.patchValue(0);
                    item.get('importePago')!.patchValue(0);
                    this.toastr.add({ severity: 'error', summary: 'Error calculateItf', detail: 'Error en el servicio de cálculo de ITF' });
                });
        } else {
            item.get('importeItf')!.patchValue(0);
            item.get('importePago')!.patchValue(capital);
        }
    }

    pagarRetencion() {
        this.disableButton = true;

        const formValue = this.formPagoRetencion.value;

        const beneficiarios = this.beneficiarios.value;

        const usuario = JSON.parse(localStorage.getItem('userABA')!);

        this.formPagoRetencion.disable();

        const motivoDesembolso = this.tipoMotivoDesembolso.find((e: any) =>
            e.valCadCorto == beneficiarios[0].medio.descripcion &&
            e.valCadLargo == beneficiarios[0].banco.descripcion
        );

        const object = {
            entidadFinanciera: beneficiarios[0].banco.descripcion,
            bancoCtaBeneficiario: beneficiarios[0].banco.descripcion,
            tipoPagoBeneficiario: beneficiarios[0].medio.id,
            tipoDesembolso: beneficiarios[0].medio.descripcion,
            motivoDesembolso: motivoDesembolso.desElemento,
            motivoPagoBeneficiario: 2,
            interesPago: 0,
            importePago: Number(beneficiarios[0].importePago.toFixed(2)),
            porcentajePago: Number(beneficiarios[0].porcentaje.toFixed(2)),
            itfPago: Number(beneficiarios[0].importeItf.toFixed(2)),
            docIde: beneficiarios[0].docIde,
            tipoDocIde: beneficiarios[0].tipoDocIde,
            numCtaTitular: this.numeroCuenta,
            idRetencion: this.idRetencion,
            plan: 2,
            transferenciaBancaria: false,
            monto: Number(this.importeRetenido.toFixed(2)),
            importeRetencionTotal: Number(this.capitalRetenido.toFixed(2)),
            saldoDisponible: Number(this.capitalDisponible.toFixed(2)),
            moneda: formValue.tipoMoneda.valCadCorto,
            archivoSustento: formValue.archivosAdjuntos,
            nombreSustento: formValue.nombreArchivo,
            uidCliente: this.uidCliente,
            uidCuenta: this.uidCuenta,
            idCuenta: this.numeroCuenta,
            usuarioCreacion: usuario.email
        };

        this.pagoRetencionService.postPagoRetencion(object).pipe(
            finalize(() => {
                this.disableButton = false;
            })
        ).subscribe(
            (resp: any) => {
                if (resp['codigo'] == -1) {
                    this.toastr.add({ severity: 'error', summary: 'Error Pago retención', detail: resp['mensaje'] });
                } else {
                    this.toastr.add({ severity: 'success', summary: '', detail: 'Pago de retención registrada' });
                    this.dialogRef.close({
                        event: 'close', data: resp
                    });
                }
            }, (_error: any) => {
                this.dialogRef.close();
            }
        );
    }

    changeModelTipoDocumento(event: any) {
        this.formBusqueda.get('nroDocumento')!.setValue(null);
        this.formBusqueda.get('nombres')!.setValue(null);
        this.formBusqueda.get('id')!.setValue(null);
        if (event.id == 1) {
            this.nroCaracter = 8;
            this.formBusqueda.get('nroDocumento')!.setValidators([Validators.minLength(this.nroCaracter), Validators.maxLength(this.nroCaracter), Validators.required]);
        } else if (event.id == 2) {
            this.nroCaracter = 9;
            this.formBusqueda.get('nroDocumento')!.setValidators([Validators.minLength(this.nroCaracter), Validators.maxLength(this.nroCaracter), Validators.required]);
        } else if (event.id == 3) {
            this.nroCaracter = 11;
            this.formBusqueda.get('nroDocumento')!.setValidators([Validators.minLength(this.nroCaracter), Validators.maxLength(this.nroCaracter), Validators.required]);
        } else {
            this.nroCaracter = 0;
            this.formBusqueda.get('nroDocumento')!.clearValidators();
        }
    }

    removeAll() {
        this.files = [];
    }

    uploader(event: any) {
        this.loadingFile = true;
        this.files = event.files;
        const filereader = new FileReader();
        filereader.readAsDataURL(this.files[0]);
        filereader.onload = () => {
            this.formPagoRetencion.get('archivosAdjuntos')!.setValue(filereader.result);
            this.formPagoRetencion.get('nombreArchivo')!.setValue(this.files[0].name);
            this.toastr.add({ severity: 'info', summary: 'Carga exitosa', detail: `${this.files.length} archivos listos para enviar` });
            this.loadingFile = false;
        };
        filereader.onerror = () => {
            this.toastr.add({ severity: 'error', summary: 'Carga fallida', detail: 'No se pudo cargar los archivos' });
            this.loadingFile = false;
        };
    }

    removeElement(event: any) {
        if (this.files.length > 0) {
            this.formPagoRetencion.get('archivosAdjuntos')!.setValue(null);
            this.formPagoRetencion.get('nombreArchivo')!.setValue(null);
            this.files = this.files.filter((element) => {
                return element !== event.file;
            });
        }
    }
}
