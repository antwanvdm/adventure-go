import Storage from './storage';
import config from '../config.json';

/**
 * Wrapper class for native WebSocket
 */
export default class WS {
  private socket: WebSocket;
  private currentPosition: GeolocationPosition;
  static MESSAGE_TYPES: { [key: string]: string } = {
    'POSITION': 'POSITION',
  };

  constructor (position: GeolocationPosition)
  {
    this.currentPosition = position;
    this.initialize();
  }

  private initialize ()
  {
    this.socket = new WebSocket(config.websocketUrl);
    console.log(this.socket);

    //Send our location as start
    this.socket.addEventListener('open', () => {
      this.socket.send(JSON.stringify({
        id: Storage.find('userId'),
        type: WS.MESSAGE_TYPES.POSITION,
        lat: this.currentPosition.coords.latitude,
        lng: this.currentPosition.coords.longitude
      }));
      window.addEventListener('position:update', (e) => this.send((e as CustomEvent).detail));
    });

    //Listen for messages
    this.socket.addEventListener('message', (event) => {
      let data = JSON.parse(event.data);
      if (typeof data.type === 'undefined' || typeof data.content === 'undefined') {
        console.log('Message from server is broken and missing type and/or data', event.data);
        return;
      }

      window.dispatchEvent(new CustomEvent(`ws:message:${data.type}`, {
        detail: data.content
      }));
    });

    this.socket.addEventListener('close', () => {
      console.log('time for restart..');
      this.initialize();
    });
  }

  private send (position: GeolocationPosition)
  {
    this.currentPosition = position;

    this.socket.send(JSON.stringify({
      id: Storage.find('userId'),
      type: WS.MESSAGE_TYPES.POSITION,
      lat: this.currentPosition.coords.latitude,
      lng: this.currentPosition.coords.longitude
    }));
  }
}