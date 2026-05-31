import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { restaurantsAPI } from '@/lib/api';
import type { Restaurant } from '@/types';

interface RestaurantsState {
  items:     Restaurant[];
  featured:  Restaurant[];
  selected:  Restaurant | null;
  isLoading: boolean;
  error:     string | null;
}

const initialState: RestaurantsState = {
  items: [], featured: [], selected: null, isLoading: false, error: null,
};

export const fetchRestaurants = createAsyncThunk(
  'restaurants/fetchAll',
  async (params?: object) => {
    const { data } = await restaurantsAPI.getAll(params);
    return data.data as Restaurant[];
  }
);

export const fetchFeaturedRestaurants = createAsyncThunk(
  'restaurants/fetchFeatured',
  async () => {
    const { data } = await restaurantsAPI.getFeatured();
    return data.data as Restaurant[];
  }
);

export const fetchRestaurantBySlug = createAsyncThunk(
  'restaurants/fetchOne',
  async (slug: string) => {
    const { data } = await restaurantsAPI.getOne(slug);
    return data.data as Restaurant;
  }
);

const restaurantsSlice = createSlice({
  name: 'restaurants',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurants.pending,  (s) => { s.isLoading = true; })
      .addCase(fetchRestaurants.fulfilled,(s, { payload }) => { s.isLoading = false; s.items = payload; })
      .addCase(fetchRestaurants.rejected, (s, { error }) => { s.isLoading = false; s.error = error.message || 'Error'; })
      .addCase(fetchFeaturedRestaurants.fulfilled, (s, { payload }) => { s.featured = payload; })
      .addCase(fetchRestaurantBySlug.pending,   (s) => { s.isLoading = true; })
      .addCase(fetchRestaurantBySlug.fulfilled, (s, { payload }) => { s.isLoading = false; s.selected = payload; })
      .addCase(fetchRestaurantBySlug.rejected,  (s) => { s.isLoading = false; });
  },
});

export default restaurantsSlice.reducer;
