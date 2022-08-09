import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import MapboxUtils from '../helpers/mapboxutils';
import MapBox from '../maps/mapbox';
import storage from '../helpers/storage';

export default class SpawnObject {
  public spawn: any;
  private marker: mapboxgl.Marker;
  private active: boolean = false;
  private readonly outOfRangeCallback: any;
  private eventCallback = (e: Event) => this.checkOutOfRange((e as CustomEvent).detail);

  constructor (spawn: any, outOfRangeCallback: any)
  {
    this.spawn = spawn;
    this.createMarker();
    this.outOfRangeCallback = outOfRangeCallback;
    window.addEventListener('position:update', this.eventCallback);
  }

  /**
   * @param focusLocation
   * @return boolean
   */
  public update (focusLocation: [number, number]): boolean
  {
    let meterDifference = MapboxUtils.getLatLngDistanceInMeters(this.spawn.loc.coordinates, focusLocation);

    if (this.active && meterDifference > 100) {
      this.marker.remove();
      this.active = false;
      return false;
    } else if (!this.active && meterDifference <= 100) {
      this.createMarker();
    }
    return true;
  }

  private createMarker (): void
  {
    let el = document.createElement('div');
    el.classList.add('marker', `marker-pokemon-${this.spawn.number}`);
    if (this.spawn.special) {
      el.classList.add('special');
    }
    el.addEventListener('click', () => {
      fetch('/api/spawns/catch', {
        method: 'POST',
        body: JSON.stringify({ spawnId: this.spawn._id, userId: 1 }),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => res.json())
        .then(() => {
          storage.addSpawn(this.spawn);
          const bag = storage.find('bag');
          console.log(bag.length, bag);
        })
        .catch(error => console.error('Error:', error));
    });
    this.active = true;
    this.marker = new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(this.spawn.loc.coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }) // add popups
          .setHTML(
            `<h3>Hello!</h3><div class="popup-image-${this.spawn.number} ${this.spawn.special ? 'special' : ''}"></div>`
          )
      )
      .addTo(MapBox.i().map);
  }

  private checkOutOfRange (location: GeolocationPosition)
  {
    if (MapboxUtils.getLatLngDistanceInMeters(this.spawn.loc.coordinates, [location.coords.longitude, location.coords.latitude]) > 100) {
      this.outOfRangeCallback(this.spawn._id);
    }
  }

  public removeMarker (): void
  {
    this.marker.remove();
    window.removeEventListener('position:update', this.eventCallback);
  }
}
