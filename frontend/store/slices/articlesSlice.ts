import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getArticles, getFeaturedArticles, getArticle } from '@/lib/db';
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
  async (params?: { limit?: number; category?: string; search?: string }) =>
    getArticles({ limit: params?.limit, category: params?.category, search: params?.search })
);

export const fetchFeaturedArticles = createAsyncThunk(
  'articles/fetchFeatured',
  async () => getFeaturedArticles(4)
);

export const fetchArticleBySlug = createAsyncThunk(
  'articles/fetchOne',
  async (slug: string) => {
    const a = await getArticle(slug);
    if (!a) throw new Error('Article not found');
    return a;
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
