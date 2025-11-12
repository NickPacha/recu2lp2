import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medico } from '../models/medico';

@Injectable({
  providedIn: 'root',
})
export class MedicoService {
  private http = inject(HttpClient);
  private base = 'http://localhost:8080/api/v1/medicos';

  listar(): Observable<Medico[]> {
    return this.http.get<Medico[]>(this.base);
  }

  obtener(id: number): Observable<Medico> {
    return this.http.get<Medico>(`${this.base}/${id}`);
  }

  crear(dto: Medico): Observable<Medico> {
    return this.http.post<Medico>(this.base, dto);
  }

  actualizar(id: number, dto: Medico): Observable<Medico> {
    return this.http.put<Medico>(`${this.base}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
