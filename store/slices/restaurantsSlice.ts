import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getRestaurants, getFeaturedRestaurants, getRestaurant } from '@/lib/db';
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
  async (params?: { limit?: number; category?: string; search?: string }) =>
    getRestaurants({ limit: params?.limit, category: params?.category, search: params?.search })
);

export const fetchFeaturedRestaurants = createAsyncThunk(
  'restaurants/fetchFeatured',
  async () => getFeaturedRestaurants(4)
);

export const fetchRestaurantBySlug = createAsyncThunk(
  'restaurants/fetchOne',
  async (slug: string) => {
    const r = await getRestaurant(slug);
    if (!r) throw new Error('Restaurant not found');
    return r;
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
