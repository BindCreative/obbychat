import AsyncStorage from '@react-native-community/async-storage';
import createSecureStore from 'redux-persist-expo-securestore';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { persistStore, persistReducer } from 'redux-persist';
import createSagaMiddleware from '@redux-saga/core';
import rootSaga from './../sagas';

import secureReducer from '../reducers/secureReducer';
import mainReducer from '../reducers/mainReducer';
import temporaryReducer from '../reducers/temporaryReducer';

import customMiddleware from './customMiddleware';

export default function configureStore() {
  // Middleware setup
  const sagaMiddleware = createSagaMiddleware();
  const middlewares = [sagaMiddleware, customMiddleware];
  const middlewareEnhancer = applyMiddleware(...middlewares);
  const storeEnhancers = [middlewareEnhancer];
  const composedEnhancer = composeWithDevTools(...storeEnhancers);
  // const composedEnhancer = compose(...storeEnhancers);

  // Secure storage
  const secureStorage = createSecureStore();
  const securePersistConfig = {
    key: 'secure',
    // storage: secureStorage,
    storage: AsyncStorage,
  };

  // Non-secure storage
  const mainPersistConfig = {
    key: 'main',
    storage: AsyncStorage,
  };

  const rootReducer = combineReducers({
    main: persistReducer(
      mainPersistConfig,
      mainReducer
    ),
    secure: persistReducer(
      securePersistConfig,
      secureReducer
    ),
    temporary: temporaryReducer
  });

  const store = createStore(rootReducer, undefined, composedEnhancer);
  sagaMiddleware.run(rootSaga);
  const persistor = persistStore(store);

  return { store, persistor };
}
