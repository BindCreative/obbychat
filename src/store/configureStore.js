import { AsyncStorage } from 'react-native';
import createSecureStore from 'redux-persist-expo-securestore';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import createSagaMiddleware from 'redux-saga';
import { mainReducer, mainSecureReducer } from './../reducers';
import rootSaga from './../sagas';


export default function configureStore(preloadedState = {}) {
  // Middleware setup
  const sagaMiddleware = createSagaMiddleware();
  const middlewares = [sagaMiddleware];
  const middlewareEnhancer = applyMiddleware(...middlewares);
  const storeEnhancers = [middlewareEnhancer];
  const composedEnhancer = compose(...storeEnhancers);

  // Secure storage
  const secureStorage = createSecureStore();
  const securePersistConfig = {
    key: 'secure',
    storage: secureStorage
  };

  // Non-secure storage
  const mainPersistConfig = {
    key: 'nonsecure',
    storage: AsyncStorage
  };

  const rootReducer = combineReducers({
    nonsecure: persistReducer(mainPersistConfig, mainReducer),
    secure: persistReducer(securePersistConfig, mainSecureReducer)
  });

  const store = createStore(
    rootReducer,
    preloadedState,
    composedEnhancer,
  );
  sagaMiddleware.run(rootSaga);
  const persistor = persistStore(store);

  return { store, persistor };
}