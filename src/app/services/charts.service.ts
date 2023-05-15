import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChartsService {

  private baseUrl: string = environment.baseUrl;
  private endpoint: string = 'computed';

  constructor(private httpClient: HttpClient) { }

  getChartData(params: HttpParams = new HttpParams()): Observable<any> {
    const url: string = `${this.baseUrl}/${this.endpoint}`;
    return this.httpClient.get(url,
      { params, observe: 'response' })
      .pipe(catchError(this.formatErrors));
  }

  private formatErrors(error: any) {
    return throwError(error.error);
  }
}
