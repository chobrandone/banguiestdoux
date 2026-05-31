import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { eventsAPI } from '@/lib/api';
import type { Event } from '@/types';

interface EventsState {
  items:      Event[];
  featured:   Event[];
  upcoming:   Event[];
  selected:   Event | null;
  isLoading:  boolean;
  error:      string | null;
  pagination: { total: number; page: number; pages: number };
}

const initialState: EventsState = {
  items:      [],
  featured:   [],
  upcoming:   [],
  selected:   null,
  isLoading:  false,
  error:      null,
  pagination: { total: 0, page: 1, pages: 1 },
};

export const fetchEvents = createAsyncThunk(
  'events/fetchAll',
  async (params?: object) => {
    const { data } = await eventsAPI.getAll(params);
    return data;
  }
);

export const fetchFeaturedEvents = createAsyncThunk(
  'events/fetchFeatured',
  async () => {
    const { data } = await eventsAPI.getFeatured();
    return data.data as Event[];
  }
);

export const fetchUpcomingEvents = createAsyncThunk(
  'events/fetchUpcoming',
  async () => {
    const { data } = await eventsAPI.getUpcoming();
    return data.data as Event[];
  }
);

export const fetchEventBySlug = createAsyncThunk(
  'events/fetchOne',
  async (slug: string) => {
    const { data } = await eventsAPI.getOne(slug);
    return data.data as Event;
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearSelected: (state) => { state.selected = null; },
    setSelected:   (state, action: PayloadAction<Event>) => { state.selected = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      /* fetchAll */
      .addCase(fetchEvents.pending,  (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchEvents.fulfilled,(state, { payload }) => {
        state.isLoading  = false;
        state.items      = payload.data;
        state.pagination = payload.pagination || state.pagination;
      })
      .addCase(fetchEvents.rejected, (state, { error }) => {
        state.isLoading = false;
        state.error     = error.message || 'Error';
      })
      /* fetchFeatured */
      .addCase(fetchFeaturedEvents.fulfilled, (state, { payload }) => { state.featured = payload; })
      /* fetchUpcoming */
      .addCase(fetchUpcomingEvents.fulfilled, (state, { payload }) => { state.upcoming = payload; })
      /* fetchOne */
      .addCase(fetchEventBySlug.pending,   (state) => { state.isLoading = true; })
      .addCase(fetchEventBySlug.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.selected  = payload;
      })
      .addCase(fetchEventBySlug.rejected,  (state) => { state.isLoading = false; });
  },
});

export const { clearSelected, setSelected } = eventsSlice.actions;
export default eventsSlice.reducer;
