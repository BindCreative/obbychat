import { AsyncStorage } from 'react-native';
import createSecureStore from 'redux-persist-expo-securestore';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { persistStore, persistReducer, persistCombineReducers } from 'redux-persist';
import createSagaMiddleware from '@redux-saga/core';
import rootSaga from './../sagas';
import { reducer as formReducer } from 'redux-form';
import walletReducer from '../reducers/wallet';
import balancesReducer from '../reducers/balances';
import exchangeRatesReducer from '../reducers/exchangeRates';
import walletHistoryReducer from '../reducers/walletHistory';
import settingsReducer from '../reducers/settings';


export default function configureStore() {
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
    key: 'main',
    storage: AsyncStorage
  };

  const rootReducer = combineReducers({
    main: persistReducer(mainPersistConfig, combineReducers({
      form: formReducer,
      balances: balancesReducer,
      exchangeRates: exchangeRatesReducer,
      walletHistory: walletHistoryReducer,
      settings: settingsReducer,
    })),
    secure: persistReducer(securePersistConfig, combineReducers({
      wallet: walletReducer,
    }))
  });

  const store = createStore(
    rootReducer,
    undefined,
    composedEnhancer,
  );
  sagaMiddleware.run(rootSaga);
  const persistor = persistStore(store);

  return { store, persistor };
}