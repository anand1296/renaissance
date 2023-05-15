import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { MapboxService } from '../../services/mapbox.service';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { environment } from 'src/environments/environment';
import { DataService } from 'src/app/services/data.service';
import chartList from 'src/assets/jsons/charts.json'
import { ChartData_ } from 'src/app/models/p-chart.model';
import { GeoJSONSource, GeoJSONSourceRaw, LngLat, Map, Marker, NavigationControl } from 'mapbox-gl';
import { ChartsService } from 'src/app/services/charts.service';
import { ChatMessage } from 'src/app/models/chat-message.model';

interface CountryModel {
  code: string,
  hdi: number,
  name: string
}

interface MapStyle {
  name: string,
  url: string
}

const USA = {
  name: "USA",
  center: [-100.89116, 40.079922],
  zoom: 2.8,
  short_code: "us"
};

const NY_CITY = {
  name: "NY CITY",
  center: [-74.0059413, 40.7127837],
  zoom: 8.4,
  short_code: "us"
};

const polygonTypes: any = {
  SIMPLE: "Polygon",
  MULTI: "MultiPolygon"
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {

  // map: mapboxgl.Map; //gives error
  public map: Map | any;
  public draw: MapboxDraw = new MapboxDraw();
  public style = 'mapbox://styles/mapbox/dark-v9';
  public place_coordinates: Array<any> = [];
  public geoJsonObjList: Array<any> = [];
  public poiList: Array<any> = [];

  // public insightsList: Array<{ header: string, chartData: ChartData_}> = chartList;
  public insightsList: Array<{ header: string, chartData: ChartData_}> = [];

  public showInsights: boolean = false;
  public openChatBot: boolean = false;
  public invertColor: boolean = false;
  private poiMarkers: Array<Marker> = [];

  private searchQuery = '';

  public mapStyles: Array<MapStyle> = [
    {
      name: 'Light', url: 'mapbox://styles/mapbox/light-v9'
    },
    {
      name: 'Dark', url: 'mapbox://styles/mapbox/dark-v9'
    }, {
      name: 'Outdoors', url: 'mapbox://styles/mapbox/outdoors-v10'
    }, {
      name: 'Satellite', url: 'mapbox://styles/mapbox/satellite-v9'
    }, {
      name: 'Satellite Streets', url: 'mapbox://styles/mapbox/satellite-streets-v10'
    }, {
      name: 'Streets', url: 'mapbox://styles/mapbox/streets-v10'
    }, {
      name: 'Traffic Day', url: 'mapbox://styles/mapbox/traffic-day-v2'
    }, {
      name: 'Traffic Night', url: 'mapbox://styles/mapbox/traffic-night-v2'
    }, {
      name: 'Preview Day', url: 'mapbox://styles/mapbox/navigation-preview-day-v2'
    }, {
      name: 'Preview Night', url: 'mapbox://styles/mapbox/navigation-preview-night-v2'
    }, {
      name: 'Guidance Day', url: 'mapbox://styles/mapbox/navigation-guidance-day-v2'
    }, {
      name: 'Guidance Night', url: 'mapbox://styles/mapbox/navigation-guidance-night-v2'
    }];

  // public mapStylesList: Array<string> = this.mapStyles.map((item: MapStyle) => item.name);

  public selectedMapStyle: string = this.mapStyles[5].name;

  // public selectedMapStyleString: string = this.mapStylesList[0];

  constructor(private mapService: MapboxService, private dataService: DataService, private chartService: ChartsService) { }

  ngOnInit(): void {
    // console.log(this.insightsList);
    this.initializemap();
    // this.mapService.getGeoJSON().subscribe((data: any) => {
    //   console.log(data);
    //   this.geoJsonObjList = data;
    // });
    this.dataService.searchQuery$.subscribe((botRespObj: { msg: ChatMessage, showCharts: boolean, showTradeArea: boolean }) => {
      console.log(botRespObj);
      // this.searchQuery = userMsg;
      if(botRespObj.msg.msg.length) {
        this.openChatBot = true;
      }

      setTimeout(() => {
        if(botRespObj.showCharts) {
          this.openChatBot = false;
          console.log(this.insightsList);
          this.chartService.getChartData().subscribe((resp) => {
            console.log(resp);
            this.insightsList = resp.body.payload;
            this.showInsights = true;
          })
        }
  
        if(botRespObj.showTradeArea) {
          this.loadGeojsons();
        }
      }, 1000)

      //remove map layers
      // this.clearMap();
      // this.initializemap();
      // if (value === 'Option 3') {
      //   this.mapService.getGeoJSON().subscribe((data: any) => {
      //     // console.log(data);
      //     this.geoJsonObjList = data;
      //     this.setMultiPolygons(data);
      //   });

      //   this.mapService.getPois().subscribe((data: any) => {
      //     console.log(data);
      //     this.poiList = data;
      //     this.poiMarkers = [];
      //     this.setMarkerClusters(data);
      //   });
      // }
      // else if(value === 'Option 2') {
      //   //remove map layers
      //   this.clearMap();
      //   this.poiMarkers = [];
      // }
    });

    // console.log(this.insightsList);
    // this.chartService.getChartData().subscribe((resp) => {
    //   console.log(resp);
    //   this.insightsList = resp.body.payload;
    // })
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.map?.resize();
    }, 1000);
  }

  clearMap(): void {

    if (this.map.getLayer('polygons')) {
      this.map.removeLayer('polygons')
    }
    if (this.map.getLayer('multi-polygons')) {
      this.map.removeLayer('multi-polygons')
    }
    if (this.map.getLayer('polygons-optimal')) {
      this.map.removeLayer('polygons-optimal')
    }
    if (this.map.getLayer('multi-polygons-optimal')) {
      this.map.removeLayer('multi-polygons-optimal')
    }
    if (this.map.getLayer('polygons-outline')) {
      this.map.removeLayer('polygons-outline')
    }
    if (this.map.getLayer('multi-polygons-outline')) {
      this.map.removeLayer('multi-polygons-outline')
    }
    if (this.map.getLayer('polygons-optimal-outline')) {
      this.map.removeLayer('polygons-optimal-outline')
    }
    if (this.map.getLayer('multi-polygons-optimal-outline')) {
      this.map.removeLayer('multi-polygons-optimal-outline')
    }

    if (this.map.getSource('near-p')) {
      this.map.removeSource('near-p');
    }
    if (this.map.getSource('near-mp')) {
      this.map.removeSource('near-mp')
    }
    if (this.map.getSource('near-p-optimal')) {
      this.map.removeSource('near-p-optimal');
    }
    if (this.map.getSource('near-mp-optimal')) {
      this.map.removeSource('near-mp-optimal')
    }

    if(this.poiMarkers.length) {
      this.poiMarkers.forEach((marker: Marker) => {
        marker.remove();
      })
    }
  }

  initializemap() {
    this.map = new Map({
      container: 'map',
      style: this.mapStyles[5].url,
      accessToken: environment.mapbox.accessToken,
      zoom: NY_CITY.zoom,
      center: new LngLat(NY_CITY.center[0], NY_CITY.center[1]),
      minZoom: 5,
      maxZoom: 18
    });

    //
    this.map.addControl(new NavigationControl({
      showCompass: false
    }), 'bottom-right');
    // const navigation = new mapboxgl.NavigationControl();
    // this.map.addControl(navigation, 'top-right');
    this.map.on('load', () => {
      // this.geoJsonArea();
      this.drawPolygon();
      // this.loadGeojsons();
    });

  }


  drawPolygon() {
    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      // Select which mapbox-gl-draw control buttons to add to the map.
      controls: {
        polygon: true,
        trash: true
      },
      // Set mapbox-gl-draw to draw by default.
      // The user does not have to click the polygon control button first.
      // defaultMode: 'draw_polygon'
    });
    // console.log(this.draw);
    this.map?.addControl(this.draw);

    this.map?.on('draw.create', () => { });
    this.map?.on('draw.delete', () => { });
    this.map?.on('draw.update', () => { });

    this.map?.on('mouseenter', ['clusters', 'unclustered-point'], () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map?.on('mouseleave', ['clusters', 'unclustered-point'], () => {
      this.map.getCanvas().style.cursor = '';
    });
  }

  getPolygonsByType(geoAssetArray: any, polygonType: any) {
    const featureCollection: any = { type: 'FeatureCollection' };
    featureCollection['features'] = [];
    geoAssetArray.forEach((geoAssetObj: any) => {
      const data = geoAssetObj.coordinates;
      // const data = geoAssetObj;
      const feature = {
        type: 'Feature',
        properties: {
          optimal: geoAssetObj.optimal
        },
        geometry: {
          type: polygonType,
          coordinates: data
        }
      };
      featureCollection['features'].push(feature);
    });
    return featureCollection;
  }

  flyToPolygon(geoJsonObject: GeoJSON.FeatureCollection<GeoJSON.Polygon>) {
    // if (geoAssetArray.length) {
      const geoAssetObj: GeoJSON.Feature<GeoJSON.Polygon, GeoJSON.GeoJsonProperties> = geoJsonObject.features[0];
      const polygonType = geoAssetObj.type;

      // if (Object.keys(geoAssetObj).length) {
        const data: GeoJSON.Position[][] = geoAssetObj.geometry.coordinates;
        // let center: LngLat = geoAssetObj.center ? new LngLat(geoAssetObj.center.split(',')[1], geoAssetObj.center.split(',')[0]) : new LngLat(NY_CITY.center[0], NY_CITY.center[1]);
        // if (!center) {
        //   center = data[0][0];
        // }
        const center = data[0][0];
        this.map?.flyTo({ center, zoom: (NY_CITY.zoom + 2.8) });
      // }
    // }
  }

  setMultiPolygons(geoJsonObject: GeoJSON.FeatureCollection<GeoJSON.Polygon> | any) {
    // Object.keys(polygonTypes).forEach(key => {
      // let polygons = data.filter((ele: any) => ele.type === polygonTypes[key]);
      // let source = (polygonTypes[key] === polygonTypes.SIMPLE) ? 'near-p' : 'near-mp';
      // const source: string = 'trade-area';
      const source: string = geoJsonObject.name;
      // console.log(source);
      // if (this.map?.getSource(source)) {
      //   // this.updateMultiPolyGon(geoJsonObject);
      //   this.updateGeoJsonToPolygon(source, geoJsonObject);
      // } else {
        // this.addMultiPolyGon(geoJsonObject);
        this.plotGeoJsonToPolygon(source, geoJsonObject);
      // }
    // });
    this.flyToPolygon(geoJsonObject);
  }

  // addMultiPolyGon(geoJsonObject: GeoJSON.FeatureCollection<GeoJSON.Geometry>) {
  //   this.plotGeoJsonToPolygon(geoAssetArray, polygonType);
  // }

  // updateMultiPolyGon(geoJsonObject: GeoJSON.FeatureCollection<GeoJSON.Geometry>) {
  //   this.updateGeoJsonToPolygon(geoAssetArray, polygonType);
  // }

  plotGeoJsonToPolygon(source: string, geoJsonObject: GeoJSON.FeatureCollection<GeoJSON.Polygon> | any) {
    // if (geoAssetArray.length) {
      // let source = (polygonType == polygonTypes.SIMPLE) ? 'near-p' : 'near-mp';
      // let layerId = (polygonType == polygonType.SIMPLE) ? 'polygons' : 'multi-polygons';
      const layerId = 'polygons';
      // let geojson = this.getPolygonsByType(geoAssetArray, polygonType);
      console.log(source, geoJsonObject);
      this.map?.addSource(source, {
        type: 'geojson',
        data: geoJsonObject
      });
      this.map?.addLayer({
        id: layerId + geoJsonObject.name,
        type: 'fill',
        source: source,
        layout: {},
        paint: {
          'fill-color': geoJsonObject.name === 'output_poly' ? '#fd1414' : '#ffc107',
          'fill-opacity': geoJsonObject.name === 'output_poly' ? 0.7 : 0.3
        }
      });

      // Add a outline around the polygon.
      this.map?.addLayer({
        'id': layerId + geoJsonObject.name + '-outline',
        'type': 'line',
        'source': source,
        'layout': {},
        'paint': {
          'line-color': geoJsonObject.name === 'output_poly' ? '#fd1414' : '#ffc107',
          'line-width': geoJsonObject.name === 'output_poly' ? 2 : 1
        }
      });

      // const optimalArea = geojson['features'].filter((item: any) => item.properties.optimal === true);
      // console.log(optimalArea);
      // if (optimalArea.length) {
      //   const source_optimal = source + '-optimal'
      //   this.map?.addSource(source_optimal, {
      //     type: 'geojson',
      //     data: {
      //       type: 'FeatureCollection',
      //       features: optimalArea
      //     }
      //   });

        // this.map?.addLayer({
        //   id: layerId + '-optimal',
        //   type: 'fill',
        //   source: source_optimal,
        //   layout: {},
        //   paint: {
        //     'fill-color': '#5eead4',
        //     'fill-opacity': 0.5
        //   }
        // });

        // Add a outline around the polygon.
        // this.map?.addLayer({
        //   'id': layerId + '-optimal-outline',
        //   'type': 'line',
        //   'source': source_optimal,
        //   'layout': {},
        //   'paint': {
        //     'line-color': '#5eead4',
        //     'line-width': 3
        //   }
        // });
      // }
    // }
  }

  updateGeoJsonToPolygon(source: string, geoJsonObject: GeoJSON.FeatureCollection<GeoJSON.Geometry>) {
    // let source = (polygonType == polygonType.SIMPLE) ? 'near-p' : 'near-mp';
    (this.map?.getSource(source) as GeoJSONSource).setData(geoJsonObject);
  }

  setMarkerClusters(data: any): void {
    if (this.map?.getSource('nearPoiLists')) {
      this.updateMarkerClusters(data);
    } else {
      this.addMarkerClusters(data);
    }
  }

  updateMarkerClusters(data: any) {
    const poidata = this.constructGeoJsonData(data);
    // (this.map?.getSource('nearPoiLists') as GeoJSONSource).setData(poidata);
  }

  addMarkerClusters(data: any) {
    const poidata = this.constructGeoJsonData(data);
    // this.map?.addSource('nearPoiLists', {
    //   type: 'geojson',
    //   data: poidata,
    //   cluster: true,
    //   clusterMaxZoom: 14, // Max zoom to cluster points on
    //   clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    // });

    // this.map?.addLayer({
    //   id: 'clusters',
    //   type: 'circle',
    //   source: 'nearPoiLists',
    //   filter: ['has', 'point_count'],
    //   paint: {
    //     'circle-color': '#31bc73',
    //     'circle-radius': ['step', ['get', 'point_count'], 20, 1, 40, 2, 60, 3, 80],
    //     //'circle-radius': ['step', ['get', 'point_count'], 60, 100, 70, 500, 80],
    //     'circle-opacity': 0.15,
    //     'circle-stroke-width': 2,
    //     'circle-stroke-color': '#31bc73'
    //   }
    // });

    // this.map?.addLayer({
    //   id: 'cluster-count',
    //   type: 'symbol',
    //   source: 'nearPoiLists',
    //   filter: ['has', 'point_count'],
    //   layout: {
    //     'text-field': '{point_count_abbreviated}',
    //     'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
    //     'text-size': ['step', ['get', 'point_count'], 25, 2, 37]
    //   },
    //   paint: {
    //     'text-color': '#31bc73'
    //   }
    // });

    // this.map?.addLayer({
    //   id: `unclustered-point`,
    //   type: 'symbol',
    //   source: 'nearPoiLists',
    //   filter: ['!', ['has', 'point_count']],
    //   layout: {
    //     'icon-image': 'custom-marker',
    //   }
    // });

    // this.map.loadImage('../../../assets/images/places-pin-green.png', (error, image) => {
    //   if (error) { throw error; }
    //   if (!this.map.hasImage('custom-marker')) {
    //     this.map.addImage('custom-marker', image);
    //   }
    //   this.map.addLayer({
    //     id: `unclustered-point`,
    //     type: 'symbol',
    //     source: 'nearPoiLists',
    //     filter: ['!', ['has', 'point_count']],
    //     layout: {
    //       'icon-image': 'custom-marker',
    //     }
    //   });
    // });

    // inspect a cluster on click
    this.map?.on('click', `clusters`, (e: any) => {
      const features: any = this.map?.queryRenderedFeatures(e.point, { layers: [`clusters`] });
      const clusterId = features[0].properties.cluster_id;
      (this.map?.getSource('nearPoiLists') as GeoJSONSource).getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
        if (err) {
          return;
        }
        this.map?.easeTo({
          center: features[0].geometry.coordinates,
          zoom
        });
      });
    });
  }

  constructGeoJsonData(data: any) {
    // const featureCollection: any = { type: 'FeatureCollection' };
    // featureCollection['features'] = [];
    // if (data?.length) {
    //   data.forEach((element: any) => {
    //     const feature = {
    //       type: 'Feature',
    //       properties: {
    //         id: element.near_poi_id
    //       },
    //       geometry: {
    //         type: 'Point',
    //         coordinates: [element.lon, element.lat]
    //       }
    //     };
    //     featureCollection['features'].push(feature);
    //     const marker: Marker = new Marker().setLngLat([element.lon, element.lat]).addTo(this.map);
    //     this.poiMarkers.push(marker);
    //   });
    // }
    // return featureCollection;
    data.map((latlonObj: any) => {

      const marker: Marker = new Marker({color: '#0f5cfe'}).setLngLat([latlonObj.properties.lon, latlonObj.properties.lat]).addTo(this.map);
    })
  }

  changeMapStyle(selectedStyle: MapStyle): void {
    this.map?.setStyle(selectedStyle.url);
    // this.dataService.setSearchQuery("");
    // this.loadGeojsons();
    this.invertColor = selectedStyle.url.includes('dark');
  }

  loadGeojsons() {
    this.mapService.getTradeArea().subscribe((data: any) => {
      console.log(data);
      // this.geoJsonObjList = data;
      this.setMultiPolygons(data);
    });
    this.mapService.getGeoJSON().subscribe((data: any) => {
      console.log(data);
      // this.geoJsonObjList = data;
      this.setMultiPolygons(data);
    });
    this.mapService.getPois().subscribe((data: any) => {
      console.log(data);
      // this.geoJsonObjList = data;
      // this.setMultiPolygons(data);
      this.constructGeoJsonData(data)
    });
  }

  closeChatbot(event: any): void {
    this.openChatBot = !event;
  }

}
