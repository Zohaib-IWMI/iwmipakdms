// import { configureStore } from "@reduxjs/toolkit";
// import mapView from "../slices/mapView";

// const store = configureStore({
//   reducer: {
//     mapView: mapView,
//   },
// });

// export default store;

import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage
import mapViewReducer from "../slices/mapView";

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, mapViewReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

let persistor = persistStore(store);

export { store, persistor };
