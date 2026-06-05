'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ShoppingBag, Trash2, Plus, Minus, ArrowRight,
  User, Phone, Mail, MapPin, CheckCircle2,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatPrice } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface CheckoutForm {
  name:    string;
  phone:   string;
  email:   string;
  address: string;
}

type Step = 'cart' | 'checkout' | 'success';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, total, itemCount, clearCart } = useCart();
  const { t, lang } = useLanguage();

  const [step,    setStep]    = useState<Step>('cart');
  const [loading, setLoading] = useState(false);
  const [form,    setForm]    = useState<CheckoutForm>({ name: '', phone: '', email: '', address: '' });
  const [orderId, setOrderId] = useState('');

  const shippingCost = total >= 50000 ? 0 : (items.length > 0 ? 5000 : 0);
  const orderTotal   = total + shippingCost;

  const handleClose = () => {
    closeCart();
    setTimeout(() => setStep('cart'), 400);
  };

  const setField = (key: keyof CheckoutForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      toast.error(t('cart.required'));
      return;
    }

    setLoading(true);
    try {
      const subtotal  = total;
      const shipping  = shippingCost;
      const orderTot  = orderTotal;

      const { data: order, error } = await supabase
        .from('orders')
        .insert([{
          customer_name:    form.name.trim(),
          customer_phone:   form.phone.trim(),
          customer_email:   form.email.trim(),
          guest_email:      form.email.trim(),
          shipping_address: form.address
            ? { fullName: form.name.trim(), street: form.address.trim(), phone: form.phone.trim() }
            : {},
          subtotal,
          shipping_cost: shipping,
          total:         orderTot,
          status:        'pending',
          payment_method: 'cash',
          payment_status: 'pending',
          notes: items.map(i =>
            `${i.product.name} x${i.quantity}${i.size ? ` (${i.size})` : ''}${i.color ? ` [${i.color}]` : ''}`
          ).join('; '),
        }])
        .select()
        .single();

      if (error) throw error;

      setOrderId(String(order?.id || ''));
      clearCart();
      setStep('success');
      toast.success(t('cart.orderSuccess'));
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || 'Erreur lors de la commande';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white dark:bg-night shadow-night flex flex-col"
          >
            {/* ── CART VIEW ─────────────────────────────── */}
            {step === 'cart' && (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gold/10">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5 text-gold" />
                    <h2 className="font-display text-xl font-bold text-night dark:text-beige">{t('shop.cart')}</h2>
                    {itemCount > 0 && (
                      <span className="px-2.5 py-0.5 bg-gold text-white dark:text-night text-xs font-bold rounded-full">{itemCount}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {items.length > 0 && (
                      <button onClick={clearCart} className="text-xs text-night/40 dark:text-beige/40 hover:text-red-500 transition-colors">
                        {t('cart.clear')}
                      </button>
                    )}
                    <button onClick={handleClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gold/10 transition-colors">
                      <X className="w-5 h-5 text-night dark:text-beige" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                      <ShoppingBag className="w-16 h-16 text-gold/30" />
                      <p className="font-display text-xl font-bold text-night/40 dark:text-beige/40">{t('shop.empty')}</p>
                      <p className="text-sm text-night/30 dark:text-beige/30">{t('cart.discoverShop')}</p>
                      <button onClick={handleClose} className="btn-gold mt-2">
                        {t('cart.explore')} <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 space-y-4">
                      {items.map((item, i) => (
                        <motion.div
                          key={`${item.product._id}-${item.size}-${item.color}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 50 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex gap-4 bg-beige dark:bg-night-50 rounded-2xl p-3"
                        >
                          <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-night dark:text-beige line-clamp-1">{item.product.name}</h4>
                            {item.size  && <p className="text-xs text-night/50 dark:text-beige/50">{t('cart.sizeLabel')}: {item.size}</p>}
                            {item.color && <p className="text-xs text-night/50 dark:text-beige/50">{t('cart.colorLabel')}: {item.color}</p>}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQty(item.product._id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="w-6 h-6 flex items-center justify-center rounded-full bg-gold/20 text-gold hover:bg-gold hover:text-night transition-all disabled:opacity-40"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-sm font-bold text-night dark:text-beige w-4 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQty(item.product._id, item.quantity + 1)}
                                  className="w-6 h-6 flex items-center justify-center rounded-full bg-gold/20 text-gold hover:bg-gold hover:text-night transition-all"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-sm text-night dark:text-beige">
                                  {formatPrice(item.product.price * item.quantity, 'XAF')}
                                </span>
                                <button onClick={() => removeItem(item.product._id)} className="text-night/30 dark:text-beige/30 hover:text-red-500 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {items.length > 0 && (
                  <div className="p-6 border-t border-gold/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-night/60 dark:text-beige/60">{t('cart.subtotal')}</span>
                      <span className="font-semibold text-night dark:text-beige">{formatPrice(total, 'XAF')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-night/60 dark:text-beige/60">{t('cart.shipping')}</span>
                      <span className={`font-semibold text-sm ${shippingCost === 0 ? 'text-gold' : 'text-night dark:text-beige'}`}>
                        {shippingCost === 0 ? t('cart.freeShipping') : formatPrice(shippingCost, 'XAF')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-gold/10 pt-3">
                      <span className="font-display text-base font-bold text-night dark:text-beige">{t('shop.total')}</span>
                      <span className="font-display text-xl font-bold text-gold">{formatPrice(orderTotal, 'XAF')}</span>
                    </div>
                    {total < 50000 && (
                      <div className="text-xs text-night/40 dark:text-beige/40 text-center bg-gold/5 rounded-xl py-2">
                        {lang === 'en'
                          ? `Only ${formatPrice(50000 - total, 'XAF')} away from free shipping`
                          : `Plus que ${formatPrice(50000 - total, 'XAF')} pour la livraison gratuite`}
                      </div>
                    )}
                    <button
                      onClick={() => setStep('checkout')}
                      className="btn-gold w-full justify-center py-4 text-base"
                    >
                      {t('cart.order')} <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ── CHECKOUT FORM ─────────────────────────── */}
            {step === 'checkout' && (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gold/10">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setStep('cart')}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gold/10 transition-colors"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180 text-night dark:text-beige" />
                    </button>
                    <h2 className="font-display text-xl font-bold text-night dark:text-beige">{t('cart.yourOrder')}</h2>
                  </div>
                  <button onClick={handleClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gold/10 transition-colors">
                    <X className="w-5 h-5 text-night dark:text-beige" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <p className="text-sm text-night/60 dark:text-beige/60 mb-6">
                    {t('cart.checkoutInfo')}
                  </p>

                  <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-semibold text-night/50 dark:text-beige/50 uppercase tracking-wider mb-1.5">
                        {t('cart.fullName')} *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-night/30 dark:text-beige/30" />
                        <input
                          type="text"
                          value={form.name}
                          onChange={setField('name')}
                          placeholder="Jean Dupont"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-beige dark:bg-night-50 border border-gold/10 rounded-xl text-sm text-night dark:text-beige placeholder:text-night/30 dark:placeholder:text-beige/30 outline-none focus:border-gold/50 transition-all"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-semibold text-night/50 dark:text-beige/50 uppercase tracking-wider mb-1.5">
                        {t('cart.phoneLabel')} *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-night/30 dark:text-beige/30" />
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={setField('phone')}
                          placeholder="+236 70 00 00 00"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-beige dark:bg-night-50 border border-gold/10 rounded-xl text-sm text-night dark:text-beige placeholder:text-night/30 dark:placeholder:text-beige/30 outline-none focus:border-gold/50 transition-all"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-night/50 dark:text-beige/50 uppercase tracking-wider mb-1.5">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-night/30 dark:text-beige/30" />
                        <input
                          type="email"
                          value={form.email}
                          onChange={setField('email')}
                          placeholder="votre@email.com"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-beige dark:bg-night-50 border border-gold/10 rounded-xl text-sm text-night dark:text-beige placeholder:text-night/30 dark:placeholder:text-beige/30 outline-none focus:border-gold/50 transition-all"
                        />
                      </div>
                    </div>

                    {/* Address (optional) */}
                    <div>
                      <label className="block text-xs font-semibold text-night/50 dark:text-beige/50 uppercase tracking-wider mb-1.5">
                        {t('cart.addressLabel')} <span className="text-night/30 dark:text-beige/30 normal-case font-normal">({t('cart.optional')})</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-night/30 dark:text-beige/30" />
                        <input
                          type="text"
                          value={form.address}
                          onChange={setField('address')}
                          placeholder="Quartier, rue, Bangui"
                          className="w-full pl-10 pr-4 py-3 bg-beige dark:bg-night-50 border border-gold/10 rounded-xl text-sm text-night dark:text-beige placeholder:text-night/30 dark:placeholder:text-beige/30 outline-none focus:border-gold/50 transition-all"
                        />
                      </div>
                    </div>
                  </form>

                  {/* Order summary */}
                  <div className="mt-6 bg-beige dark:bg-night-50 rounded-2xl p-4 space-y-2">
                    <p className="text-xs font-semibold text-night/50 dark:text-beige/50 uppercase tracking-wider mb-3">{t('cart.summary')}</p>
                    {items.map(item => (
                      <div key={item.product._id} className="flex justify-between text-sm">
                        <span className="text-night/70 dark:text-beige/70 line-clamp-1 flex-1 mr-2">{item.product.name} × {item.quantity}</span>
                        <span className="font-semibold text-night dark:text-beige flex-shrink-0">{formatPrice(item.product.price * item.quantity, 'XAF')}</span>
                      </div>
                    ))}
                    <div className="border-t border-gold/10 pt-2 flex justify-between font-bold">
                      <span className="text-night dark:text-beige">{t('shop.total')}</span>
                      <span className="text-gold">{formatPrice(orderTotal, 'XAF')}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gold/10">
                  <button
                    form="checkout-form"
                    type="submit"
                    disabled={loading}
                    className="btn-gold w-full justify-center py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-night/30 border-t-night rounded-full animate-spin" />
                        {t('cart.processing')}
                      </>
                    ) : (
                      <>{t('cart.confirmOrder')} <ArrowRight className="w-5 h-5" /></>
                    )}
                  </button>
                  <p className="text-center text-xs text-night/40 dark:text-beige/40 mt-3">
                    {t('cart.emailConfirmation')}
                  </p>
                </div>
              </>
            )}

            {/* ── SUCCESS VIEW ──────────────────────────── */}
            {step === 'success' && (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="w-20 h-20 rounded-full bg-gold/15 flex items-center justify-center mb-6"
                >
                  <CheckCircle2 className="w-10 h-10 text-gold" />
                </motion.div>
                <h3 className="font-display text-2xl font-bold text-night dark:text-beige mb-2">
                  {t('cart.confirmed')}
                </h3>
                <p className="text-night/60 dark:text-beige/60 text-sm mb-2">
                  {t('cart.thankYou')}
                </p>
                {orderId && (
                  <p className="text-xs text-gold font-mono mb-4">
                    #{String(orderId).slice(-8).toUpperCase()}
                  </p>
                )}
                <p className="text-night/50 dark:text-beige/50 text-sm mb-8">
                  {t('cart.confirmationSentTo')} <strong>{form.email}</strong>.<br />
                  {t('cart.teamContact')}
                </p>
                <button onClick={handleClose} className="btn-gold">
                  {t('cart.continueShopping')}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
