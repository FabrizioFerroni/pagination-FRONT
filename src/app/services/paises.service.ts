import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';
import { Paises } from '../models/Paises';
import { Mensaje } from '../models/Mensaje';

@Injectable({
  providedIn: 'root',
})
export class PaisesService {
  url!: string;

  constructor(private http: HttpClient) {
    this.url = environment.url;
  }

  getPaises(
    page?: number,
    size?: number,
    order?: string,
    asc?: boolean
  ): Observable<Paises> {
    return this.http.get<Paises>(
      this.url + `paises?page=${page}&size=${size}&order=${order}&asc=${asc}`
    );
  }

  getPaisesBor(
    page?: number,
    size?: number,
    order?: string,
    asc?: boolean,
    deleted?: boolean
  ): Observable<Paises> {
    return this.http.get<Paises>(
      this.url +
        `paisesBor?page=${page}&size=${size}&order=${order}&asc=${asc}&deleted=${deleted}`
    );
  }

  deletePais(id: number): Observable<Mensaje> {
    return this.http.delete<Mensaje>(this.url + `paises/${id}/borrar`);
  }

  restaurarPais(id: number): Observable<Mensaje> {
    return this.http.post<Mensaje>(this.url + `paises/${id}/restaurar`, {});
  }
}
