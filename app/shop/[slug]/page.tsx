'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ShoppingBag, Tag } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import { getProduct } from '@/lib/db';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { lang, t } = useLanguage();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState<string | undefined>();
  const [color, setColor] = useState<string | undefined>();

  useEffect(() => {
    getProduct(slug).then(setProduct).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-night pt-32 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-white dark:bg-night pt-32 flex flex-col items-center justify-center text-center px-4">
      <p className="text-2xl font-display text-night dark:text-beige mb-4">
        {lang === 'fr' ? 'Produit introuvable' : 'Product not found'}
      </p>
      <button onClick={() => router.push('/shop')} className="btn-gold px-6 py-3">
        ← {lang === 'fr' ? 'Retour' : 'Back'}
      </button>
    </div>
  );

  const name = lang === 'fr' ? (product.nameFr || product.name) : product.name;
  const images = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'];

  const handleAddToCart = () => {
    addItem(product, 1, size, color);
    toast.success(lang === 'fr' ? 'Ajouté au panier !' : 'Added to cart!');
  };

  return (
    <div className="min-h-screen bg-beige dark:bg-night pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/shop"
          className="flex items-center gap-2 text-sm text-night/40 dark:text-beige/50 hover:text-gold mb-6 transition-colors">
          <ChevronLeft size={16} /> {lang === 'fr' ? 'Boutique' : 'Shop'}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images */}
          <div>
            <div className="relative h-80 md:h-[420px] rounded-3xl overflow-hidden bg-white dark:bg-night-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[activeImg]} alt={name} className="w-full h-full object-cover" />
              {product.isLimited && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-gold text-night text-xs font-bold rounded-full uppercase flex items-center gap-1">
                  <Tag size={12} /> {lang === 'fr' ? 'Édition limitée' : 'Limited edition'}
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${activeImg === i ? 'border-gold' : 'border-transparent'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-3xl font-bold text-night dark:text-beige">{name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-2xl font-bold text-gold">{formatPrice(product.price, 'XAF')}</span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-night/30 dark:text-beige/30 line-through text-sm">{formatPrice(product.comparePrice, 'XAF')}</span>
                )}
              </div>
            </div>

            {product.description && (
              <p className="text-night/70 dark:text-beige/70 leading-relaxed">
                {lang === 'fr' ? (product.descriptionFr || product.description) : product.description}
              </p>
            )}

            {(product.sizes?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-semibold text-night/40 dark:text-beige/40 uppercase tracking-wider mb-2">{lang === 'fr' ? 'Taille' : 'Size'}</p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes!.map(s => (
                    <button key={s} onClick={() => setSize(s)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${size === s ? 'bg-gold text-night border-gold' : 'border-gold/20 text-night/70 dark:text-beige/70 hover:border-gold/50'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(product.colors?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-semibold text-night/40 dark:text-beige/40 uppercase tracking-wider mb-2">{lang === 'fr' ? 'Couleur' : 'Color'}</p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors!.map(c => (
                    <button key={c.name} onClick={() => setColor(c.name)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all flex items-center gap-1.5 ${color === c.name ? 'bg-gold text-night border-gold' : 'border-gold/20 text-night/70 dark:text-beige/70 hover:border-gold/50'}`}>
                      <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="w-full py-4 bg-gold text-night font-bold rounded-2xl hover:bg-gold/85 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingBag size={18} />
              {product.stock > 0 ? t('shop.addToCart') : (lang === 'fr' ? 'Épuisé' : 'Out of stock')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
