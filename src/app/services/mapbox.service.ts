import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class MapboxService {
  constructor(private httpClient: HttpClient) { }

  getGeoJSON() {
    // const localDataPath = '/assets/jsons/geojson1.json';
    // const localDataPath = '/assets/jsons/brooklyn-tradearea.json';
    const localDataPath = '/assets/jsons/output_poly.geojson';
    return this.httpClient.get(`${localDataPath}`, {});
  }

  getTradeArea() {
    const localDataPath = '/assets/jsons/brooklyn-tradearea.json';
    return this.httpClient.get(`${localDataPath}`, {});
  }

  getPois() {
    const localDataPath = '/assets/jsons/output_poi.geojson';
    return this.httpClient.get(`${localDataPath}`, {});
  }
}
