import { configureStore, combineReducers } from "@reduxjs/toolkit"
import groupReducer from "@/store/groupSlice"
import { persistReducer, persistStore } from "redux-persist"
import storage from "@/store/persistStorage"

// combine reducers
const rootReducer = combineReducers({
  group: groupReducer,
})

// persist configuration
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["group"], // only persist group slice
}

// persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch