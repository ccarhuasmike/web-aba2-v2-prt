import { HttpHeaders } from '@angular/common/http';


 /**
   * Genera los headers reutilizables con codigo-canal y usuario
   * @param codigoCanal - Código del canal
   * @param usuario - Nombre del usuario
   * @returns HttpHeaders configurado
   */
  export function getHeaders(codigoCanal: string, usuario: string): HttpHeaders {
    return new HttpHeaders({
      'codigo-canal': codigoCanal,
      'usuario': usuario,
      'Content-Type': 'application/json'
    });
  }


export function getUserHeaders(): HttpHeaders {
  let userKey = '';
  const token = localStorage.getItem('tokenABA');

  if (token) {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      userKey = decoded.preferred_username || 'default-key';
    } catch (error) {
      console.error('Error al decodificar token:', error);
      userKey = 'default-key';
    }
  } else {
    userKey = 'default-key';
  }

  return new HttpHeaders({
    'user-key': userKey
  });
}