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
function insert(key: string, state: any) {
  localStorage.setItem(key, JSON.stringify(state));
}

export default { find, insert };