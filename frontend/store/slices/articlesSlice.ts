import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { articlesAPI } from '@/lib/api';
import type { Article } from '@/types';

interface ArticlesState {
  items:     Article[];
  featured:  Article[];
  selected:  Article | null;
  isLoading: boolean;
  error:     string | null;
}

const initialState: ArticlesState = {
  items: [], featured: [], selected: null, isLoading: false, error: null,
};

export const fetchArticles = createAsyncThunk(
  'articles/fetchAll',
  async (params?: object) => {
    const { data } = await articlesAPI.getAll(params);
    return data.data as Article[];
  }
);

export const fetchFeaturedArticles = createAsyncThunk(
  'articles/fetchFeatured',
  async () => {
    const { data } = await articlesAPI.getFeatured();
    return data.data as Article[];
  }
);

export const fetchArticleBySlug = createAsyncThunk(
  'articles/fetchOne',
  async (slug: string) => {
    const { data } = await articlesAPI.getOne(slug);
    return data.data as Article;
  }
);

const articlesSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchArticles.pending,   (s) => { s.isLoading = true; })
      .addCase(fetchArticles.fulfilled, (s, { payload }) => { s.isLoading = false; s.items = payload; })
      .addCase(fetchArticles.rejected,  (s, { error }) => { s.isLoading = false; s.error = error.message || 'Error'; })
      .addCase(fetchFeaturedArticles.fulfilled, (s, { payload }) => { s.featured = payload; })
      .addCase(fetchArticleBySlug.pending,   (s) => { s.isLoading = true; })
      .addCase(fetchArticleBySlug.fulfilled, (s, { payload }) => { s.isLoading = false; s.selected = payload; })
      .addCase(fetchArticleBySlug.rejected,  (s) => { s.isLoading = false; });
  },
});

export default articlesSlice.reducer;
