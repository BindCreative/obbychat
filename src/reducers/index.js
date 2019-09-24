import { reducer as form } from 'redux-form';
import wallet from './wallet';


export function mainReducer() {
  return { form };
}

export function mainSecureReducer() {
  return { wallet };
}

export default { mainReducer, mainSecureReducer }