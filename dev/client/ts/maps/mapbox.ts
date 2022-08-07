import config from '../config.json';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import GeoLocation from './geolocation';
import { MapTouchEvent } from 'mapbox-gl';
import MapboxUtils from '../helpers/mapboxutils';

/**
 * @see https://labs.mapbox.com/bites/00279/
 * @see https://api.onwater.io/api/v1/results/51.9240641,4.509943
 */
export default class MapBox {
  private static instance: MapBox;
  private _map: mapboxgl.Map;
  private activeMarker: mapboxgl.Marker = null;
  private geoLocation: GeoLocation;
  private spoof: boolean = config.spoof.enabled;
  private spoofIncremental: boolean = config.spoof.isIncremental;
  private lastMouseMovePosition: { x: number, y: number };

  get map (): mapboxgl.Map
  {
    return this._map;
  }

  private constructor ()
  {
    this.geoLocation = new GeoLocation();
    this.initMap();
  }

  /**
   * Singleton rewritten as 'i' to make code in application cleaner
   * @return MapBox
   */
  public static i (): MapBox
  {
    return MapBox.instance || (MapBox.instance = new MapBox());
  }

  private initMap ()
  {
    mapboxgl.accessToken = config.mapbox.accessToken;
    this._map = new mapboxgl.Map(config.mapbox.mapSettings);
    this._map.once('load', () => this.mapLoaded());

    this._map.on('touchstart', (e: MapTouchEvent) => this.lastMouseMovePosition = e.point);
    this._map.on('touchmove', (e: MapTouchEvent) => this.touchMoveHandler(e));
  }

  private mapLoaded ()
  {
    this.geoLocation.getCurrentPosition((position: GeolocationPosition) => this.updatePosition(position));
    // this.add3D()
    this.removeLabels();
    const nav = new mapboxgl.NavigationControl();
    this._map.addControl(nav, 'top-left');
  }

  /**
   * Enable rotating with 1 finger interaction. Mapbox doesn't offer this by default it seems
   *
   * @param e
   * @private
   */
  private touchMoveHandler (e: MapTouchEvent)
  {
    //Make sure we don't interrupt the zoom experience
    if (this._map.isZooming() || e.points.length > 1) {
      return;
    }

    let bearingTo = 0;
    if (e.point.x < this.lastMouseMovePosition.x) {
      bearingTo = this._map.getBearing() + 2;
      this._map.rotateTo(this._map.getBearing() + 2, { duration: 0 });
    } else {
      bearingTo = this._map.getBearing() - 2;
    }

    this._map.rotateTo(bearingTo, { duration: 0 });
    this.lastMouseMovePosition = { x: e.point.x, y: e.point.y };
  }

  private spoofPosition ()
  {
    setInterval(() => {
      const p = this._map.getCenter();
      const offset = this.spoofIncremental ? 0.0001 : 0.005;
      const lng = this.spoofIncremental ? (p.lng + offset) : (p.lng + offset - (Math.random() * offset * 2));
      const lat = this.spoofIncremental ? (p.lat + offset) : (p.lat + offset - (Math.random() * offset * 2));

      this.updateActiveMarker({
        coords: {
          longitude: lng,
          latitude: lat
        }
      });
    }, 1000);
  }

  /**
   * @param position
   */
  private updatePosition (position: GeolocationPosition): void
  {
    this.setMapFocus([position.coords.longitude, position.coords.latitude]);
    document.querySelector('#map').classList.remove('is-invisible');
    document.getElementById('main').classList.remove('is-loading');

    if (this.spoof) {
      this.spoofPosition();
    } else {
      this.geoLocation.watchCurrentPosition((position) => this.updateActiveMarker(position));
    }
  }

  /**
   * @param lngLat
   */
  private setMapFocus (lngLat: [number, number])
  {
    this._map.setCenter(lngLat);
  }

  /**
   * @param position
   */
  private updateActiveMarker (position: any): void
  {
    //TODO the spawns should be push from the server instead of pulled from the client.
    let getSpawns = false;
    if (this.activeMarker === null) {
      let el = document.createElement('div');
      el.classList.add('marker');

      this.activeMarker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
      })
        .setLngLat([position.coords.longitude, position.coords.latitude])
        .addTo(this._map);
      getSpawns = true;
    } else {
      this.activeMarker.setLngLat([position.coords.longitude, position.coords.latitude]);
    }

    //Don't update anything when we didn't move anyway
    let meterDifference = MapboxUtils.getLatLngDistanceInMeters([this.activeMarker.getLngLat().lng, this.activeMarker.getLngLat().lat], [position.coords.longitude, position.coords.latitude]);
    if (meterDifference === 0 && getSpawns === false) {
      return;
    }

    this.setMapFocus([position.coords.longitude, position.coords.latitude]);
    window.dispatchEvent(new CustomEvent('mapbox:activeMarkerUpdate', {
      detail: {
        lng: position.coords.longitude,
        lat: position.coords.latitude
      }
    }));
  }

  private add3D ()
  {
    // Insert the layer beneath any symbol layer.
    const layers = this._map.getStyle().layers as any; //ugly hack for TS

    let labelLayerId;
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
        labelLayerId = layers[i].id;
        break;
      }
    }

    this._map.addLayer({
      'id': '3d-buildings',
      'source': 'composite',
      'source-layer': 'building',
      'filter': ['==', 'extrude', 'true'],
      'type': 'fill-extrusion',
      'minzoom': 15,
      'paint': {
        'fill-extrusion-color': '#aaa',

        // use an 'interpolate' expression to add a smooth transition effect to the
        // buildings as the user zooms in
        'fill-extrusion-height': [
          'interpolate', ['linear'], ['zoom'],
          15, 0,
          15.05, ['get', 'height']
        ],
        'fill-extrusion-base': [
          'interpolate', ['linear'], ['zoom'],
          15, 0,
          15.05, ['get', 'min_height']
        ],
        'fill-extrusion-opacity': .6
      }
    }, labelLayerId);
  }

  private removeLabels ()
  {
    this._map.getStyle().layers.forEach((layer) => {
      if (layer.type === 'symbol') {
        this.map.removeLayer(layer.id);
      }
    });
  }
}
