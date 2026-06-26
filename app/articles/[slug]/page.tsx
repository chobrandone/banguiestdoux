'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Clock, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getArticle } from '@/lib/db';
import type { Article } from '@/types';

const categoryColors: Record<string, string> = {
  nightlife: 'bg-purple-500', gastronomy: 'bg-orange-500', travel: 'bg-blue-500',
  culture: 'bg-gold', cinema: 'bg-blue-500', news: 'bg-red-500',
  lifestyle: 'bg-pink-500', interview: 'bg-teal-500', guide: 'bg-indigo-500', other: 'bg-gray-500',
};

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { lang } = useLanguage();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getArticle(slug).then(setArticle).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-night pt-32 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );

  if (!article) return (
    <div className="min-h-screen bg-white dark:bg-night pt-32 flex flex-col items-center justify-center text-center px-4">
      <p className="text-2xl font-display text-night dark:text-beige mb-4">
        {lang === 'fr' ? 'Article introuvable' : 'Article not found'}
      </p>
      <button onClick={() => router.push('/cinema')} className="btn-gold px-6 py-3">
        ← {lang === 'fr' ? 'Retour' : 'Back'}
      </button>
    </div>
  );

  const title   = lang === 'fr' ? (article.titleFr   || article.title)   : article.title;
  const content = lang === 'fr' ? (article.contentFr || article.content) : article.content;

  return (
    <div className="min-h-screen bg-beige dark:bg-night pb-20">
      {/* Hero */}
      <div className="relative h-72 md:h-[420px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={article.image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent" />
        <div className="absolute top-24 left-4 sm:left-6 lg:left-8">
          <Link href="/cinema" className="flex items-center gap-2 text-sm text-white/70 hover:text-gold transition-colors">
            <ChevronLeft size={16} /> {lang === 'fr' ? 'Retour' : 'Back'}
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 max-w-3xl mx-auto">
          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider ${categoryColors[article.category] || 'bg-gold'}`}>
            {article.category}
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-white mt-3 leading-tight">{title}</h1>
          <div className="flex items-center gap-4 mt-3 text-white/60 text-sm">
            {article.readTime && (
              <span className="flex items-center gap-1.5"><Clock size={14} /> {article.readTime} min</span>
            )}
            {article.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} /> {new Date(article.publishedAt).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {article.excerpt && (
          <p className="text-lg text-night/70 dark:text-beige/70 font-medium italic mb-6 leading-relaxed">
            {lang === 'fr' ? (article.excerptFr || article.excerpt) : article.excerpt}
          </p>
        )}
        <div className="text-night/80 dark:text-beige/80 leading-relaxed whitespace-pre-line">
          {content}
        </div>

        {article.gallery && article.gallery.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
            {article.gallery.map((img, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
