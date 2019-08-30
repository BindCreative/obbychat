import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore, persistReducer } from 'redux-persist'
import saga from 'redux-saga';
import storage from 'redux-persist/lib/storage';
import rootReducer from '../reducers/root';


export default function configureStore(preloadedState = {}) {
  // Middleware setup
  const middlewares = [saga];
  const middlewareEnhancer = applyMiddleware(...middlewares);
  const storeEnhancers = [middlewareEnhancer];
  const composedEnhancer = compose(...storeEnhancers);

  // Persist setup
  const persistConfig = {
    key: 'root',
    storage,
  };
  const persistedReducer = persistReducer(persistConfig, rootReducer);

  const store = createStore(
    persistedReducer,
    preloadedState,
    composedEnhancer,
  );

  const persistor = persistStore(store);

  return { store,  persistor };
}