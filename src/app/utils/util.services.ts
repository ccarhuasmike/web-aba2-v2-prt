import { Injectable } from "@angular/core";
@Injectable()
export class UtilService {

    constructor() { }

    static filterByField<T>(
        data: T[],
        query: string,
        field: keyof T
    ): T[] {

        if (!Array.isArray(data)) {
            return [];
        }

        const normalizedQuery = (query ?? '').trim().toLowerCase();

        if (normalizedQuery.length === 0) {
            return data; // ← importante: si escribes 1 carácter, busca.
        }

        return data.filter(item => {
            const value = String(item[field] ?? '').toLowerCase();
            return value.includes(normalizedQuery);
        });
    }

    static downloadBase64File(base64: string, fileName: string, extension: string) {
        // Detectar tipo MIME según extensión
        const mimeTypes: any = {
            pdf: 'application/pdf',
            png: 'image/png',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            txt: 'text/plain'
        };

        const mimeType = mimeTypes[extension.toLowerCase()] || 'application/octet-stream';

        // Convertir base64 a byte array
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);

        // Crear blob
        const blob = new Blob([byteArray], { type: mimeType });

        // Crear URL y descargar
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = fileName;

        a.click();

        window.URL.revokeObjectURL(url);
    }

      static base64ToBlob(base64String: string, mimeType: string): Blob {
        const byteCharacters = atob(base64String.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    }

    static getMimeType(extension: string): string {
        const mimeTypes: { [key: string]: string } = {
            'pdf': 'application/pdf',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'xls': 'application/vnd.ms-excel',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        };
        return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
    }

}

