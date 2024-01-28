import { configureStore } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import Storage from './Storage'
import rootReducer from './reducers'

const persistConfig = {
  key: 'state',
  version: 1,
  storage: new Storage(),
}

const persistedReducer = persistReducer(persistConfig, rootReducer)
const useDevTools = process.env.NODE_ENV === 'production' ? false : true

const store = configureStore({
  reducer: persistedReducer,
  devTools: useDevTools,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

let persistor = persistStore(store)

export { store, persistor }
