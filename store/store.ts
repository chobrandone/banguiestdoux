import { configureStore } from '@reduxjs/toolkit';
import eventsReducer     from './slices/eventsSlice';
import restaurantsReducer from './slices/restaurantsSlice';
import articlesReducer   from './slices/articlesSlice';

export const store = configureStore({
  reducer: {
    events:      eventsReducer,
    restaurants: restaurantsReducer,
    articles:    articlesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
