'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Heart, ArrowRight, Tag, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { cn, formatPrice } from '@/lib/utils';
import type { Product } from '@/types';
import { productsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const CATS = [
  { key:'all',             fr:'Tout' },
  { key:'t-shirts',        fr:'T-Shirts' },
  { key:'caps',            fr:'Casquettes' },
  { key:'tote-bags',       fr:'Tote Bags' },
  { key:'glassware',       fr:'Verrerie' },
  { key:'accessories',     fr:'Accessoires' },
  { key:'limited-editions',fr:'Éditions Limitées' },
];

export default function ShopPage() {
  const { t } = useLanguage();
  const { addItem } = useCart();
  const [products, setProducts]     = useState<Product[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selectedCat, setSelectedCat] = useState('all');
  const [wishlist, setWishlist]       = useState<string[]>([]);

  useEffect(() => {
    productsAPI.getAll({ limit: '50' })
      .then((res) => {
        const data = res.data?.data ?? [];
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = selectedCat === 'all' ? products : products.filter(p => p.category === selectedCat);

  const toggleWishlist = (id: string) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <>
      {/* Hero */}
      <div className="relative h-64 bg-night overflow-hidden flex items-end pb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=1920" alt="Shop" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-night to-transparent" />
        <div className="container-custom relative z-10 pt-24">
          <span className="label-editorial">Lifestyle Store</span>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-beige mt-2">Boutique</h1>
          <p className="text-beige/60 mt-2">Représentez la culture de Bangui</p>
        </div>
      </div>

      <div className="bg-beige dark:bg-night min-h-screen">
        <div className="container-custom py-10">
          {/* Banner */}
          <div className="bg-gradient-to-r from-gold-500 to-gold-400 rounded-2xl p-4 mb-8 flex items-center gap-3">
            <Zap className="w-5 h-5 text-night" />
            <p className="text-night font-semibold text-sm">Livraison gratuite à Bangui pour toute commande supérieure à 50 000 XAF</p>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-hide pb-2">
            {CATS.map(({ key, fr }) => (
              <button key={key} onClick={() => setSelectedCat(key)}
                className={cn('flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all',
                  selectedCat === key ? 'bg-gold text-night shadow-gold' : 'bg-white dark:bg-night-50 text-night/70 dark:text-beige/70 border border-gold/10 hover:bg-gold/10'
                )}>{fr}</button>
            ))}
          </div>

          {/* Loading spinner */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
            </div>
          )}

          {/* Empty state */}
          {!loading && products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShoppingBag className="w-16 h-16 text-beige/10 mb-4" />
              <p className="text-beige/40 text-lg font-semibold">Aucun contenu disponible</p>
              <p className="text-beige/30 text-sm mt-1">Revenez bientôt pour du nouveau contenu</p>
            </div>
          )}

          {/* Products */}
          {!loading && products.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filtered.map((product, i) => (
                <motion.div key={product._id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07 }}>
                  <div className="group bg-white dark:bg-night-50 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {product.isLimited && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-night text-gold uppercase">Édition Limitée</span>}
                        {product.comparePrice && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-500 text-white uppercase">-{Math.round((1-product.price/product.comparePrice)*100)}%</span>}
                      </div>

                      {/* Wishlist */}
                      <button onClick={() => toggleWishlist(product._id)} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 dark:bg-night/90 shadow hover:scale-110 transition-all">
                        <Heart className={cn('w-4 h-4 transition-colors', wishlist.includes(product._id) ? 'text-red-500 fill-red-500' : 'text-night/40 dark:text-beige/40')} />
                      </button>

                      {/* Quick add */}
                      <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <button
                          onClick={() => addItem(product)}
                          className="w-full btn-gold text-xs py-2 gap-1"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> {t('shop.addToCart')}
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <Link href={`/shop/${product.slug}`}>
                        <h3 className="font-semibold text-sm text-night dark:text-beige group-hover:text-gold transition-colors line-clamp-1 mb-1">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-night/40 dark:text-beige/40 line-clamp-1 mb-3">{product.description}</p>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-night dark:text-beige text-sm">
                            {formatPrice(product.price, 'XAF')}
                          </span>
                          {product.comparePrice && (
                            <span className="text-xs text-night/30 dark:text-beige/30 line-through ml-2">
                              {formatPrice(product.comparePrice, 'XAF')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-gold fill-gold" />
                          <span className="text-xs font-semibold text-night dark:text-beige">4.8</span>
                        </div>
                      </div>

                      {/* Colors */}
                      {product.colors && (
                        <div className="flex items-center gap-1.5 mt-2">
                          {product.colors.map(c => (
                            <div key={c.hex} className="w-4 h-4 rounded-full border-2 border-white dark:border-night-50 shadow-sm" style={{ backgroundColor: c.hex }} title={c.name} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
