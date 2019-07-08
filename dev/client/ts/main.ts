import '../scss/style.scss';
import storage from './helpers/storage';
import Game from './game';

window.addEventListener('load', () => {
  // Insert a new userId (without override)
  storage.insert('userId', Date.now());
  // Insert an empty bag (without override)
  storage.insert('bag', []);
  // Show user connected info log
  console.info(`User connected with id: ${storage.find('userId')}`, storage.find('bag'));
  // Start the game!
  new Game();
});
