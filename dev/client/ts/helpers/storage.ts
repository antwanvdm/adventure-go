/**
 * 
 * @param key 
 */
function find(key: string) {
  const state = localStorage.getItem(key);
  if (state === null) return null;
  return JSON.parse(state);
}

/**
 * 
 * @param key 
 * @param state 
 */
function insert(key: string, state: any, override = false) {
  if (override === false && localStorage.getItem(key) !== null) return;
  localStorage.setItem(key, JSON.stringify(state));
}

/**
 * 
 * @param spawn 
 */
function addSpawn(spawn: any){
  const bag = find('bag');
  bag.push(spawn);
  insert('bag', bag, true);
}

export default { find, insert, addSpawn };