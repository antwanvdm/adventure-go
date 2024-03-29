import config from '../config.json';

type FunctionPositionCallback = (data: GeolocationPosition) => any;

export default class GeoLocation {
  private geoWatchID: number = 0;

  constructor ()
  {
    if (!('geolocation' in navigator)) {
      throw new Error('Your browser fails');
    }
  }

  /**
   * @param callback
   */
  public getCurrentPosition (callback: FunctionPositionCallback)
  {
    navigator.geolocation.getCurrentPosition(callback, () => {
      //@todo ERROR
    }, config.geoOptions);
  }

  /**
   * @param callback
   */
  public watchCurrentPosition (callback: FunctionPositionCallback)
  {
    if (this.geoWatchID !== 0) {
      return;
    }

    this.geoWatchID = navigator.geolocation.watchPosition(callback, () => {
      //@todo ERROR
    }, config.geoOptions);
  }

  public clearWatchCurrentPosition ()
  {
    navigator.geolocation.clearWatch(this.geoWatchID);
  }
}
