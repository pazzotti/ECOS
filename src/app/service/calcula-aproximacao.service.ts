import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalculaAproximacaoService {
  
  url = "https://29nn627mt5.execute-api.sa-east-1.amazonaws.com/v1"


  constructor(private http: HttpClient) { }
  
  verificaDistancia(json: any): Observable<any> {
    const url = this.url;
    return this.http.post<any>(url, json);
  }
}