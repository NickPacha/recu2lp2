import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Especialidad } from '../models/especialidad';

@Injectable({
  providedIn: 'root',
})
export class EspecialidadService {
  private http = inject(HttpClient);
  private base = 'http://localhost:8080/api/v1/especialidades';

  listar(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(this.base);
  }

  obtener(id: number): Observable<Especialidad> {
    return this.http.get<Especialidad>(`${this.base}/${id}`);
  }

  crear(dto: Especialidad): Observable<Especialidad> {
    return this.http.post<Especialidad>(this.base, dto);
  }

  actualizar(id: number, dto: Especialidad): Observable<Especialidad> {
    return this.http.put<Especialidad>(`${this.base}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}