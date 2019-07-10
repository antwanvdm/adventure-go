import config from '../config.json';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import GeoLocation from "./geolocation";

export default class MapBox {
    private static instance: MapBox;
    private _map: mapboxgl.Map;
    private activeMarker: mapboxgl.Marker = null;
    private geoLocation: GeoLocation;
    private spoof = false;

    get map(): mapboxgl.Map {
        return this._map;
    }

    private constructor() {
        this.geoLocation = new GeoLocation();
        this.initMap();
    }

    /**
     * Singleton rewritten as 'i' to make code in application cleaner
     * @return MapBox
     */
    public static i(): MapBox {
        return MapBox.instance || (MapBox.instance = new MapBox());
    }


    private initMap() {
        mapboxgl.accessToken = config.mapbox.accessToken;
        this._map = new mapboxgl.Map(config.mapbox.mapSettings);
        this._map.once('load', () => this.geoLocation.getCurrentPosition(this.updatePosition.bind(this)));
    }

    private spoofPosition(){
        const p = this._map.getCenter();
        setInterval(() => {
            const offset = 0.005;
            this.updateActiveMarker({ coords: {
                longitude: p.lng + offset - (Math.random() * offset * 2),
                latitude: p.lat + offset - (Math.random() * offset * 2),
            }})
        }, 5000)
    }

    /**
     * @param position
     */
    private updatePosition(position: Position): void {
        this.setMapFocus([position.coords.longitude, position.coords.latitude]);
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
    private setMapFocus(lngLat: [number, number]) {
        this._map.setCenter(lngLat);
        this._map.setZoom(17);
    }

    /**
     * @param position
     */
    private updateActiveMarker(position: any): void {
        if (this.activeMarker !== null) {
            this.activeMarker.remove();
        }

        let $el = document.createElement('div');
        $el.classList.add('marker');

        this.activeMarker = new mapboxgl.Marker($el)
            .setLngLat([position.coords.longitude, position.coords.latitude])
            .addTo(this._map);

        this.setMapFocus([position.coords.longitude, position.coords.latitude]);
        window.dispatchEvent(new CustomEvent('mapbox:activeMarkerUpdate', {
            detail: {
                lng: position.coords.longitude,
                lat: position.coords.latitude
            }
        }));
    }
}
