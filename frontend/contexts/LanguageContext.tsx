'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage } from '@/lib/utils';

type Lang = 'fr' | 'en';

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

/* ─── Translations ───────────────────────────────── */
const translations: Record<Lang, Record<string, string>> = {
  fr: {
    /* Nav */
    'nav.home':         'Accueil',
    'nav.events':       'Événements',
    'nav.restaurants':  'Restaurants & Nightlife',
    'nav.cinema':       'Cinéma & Culture',
    'nav.discover':     'Découvrir Bangui',
    'nav.practical':    'Infos Pratiques',
    'nav.talents':      'Talents & Inspirations',
    'nav.gallery':      'Galerie',
    'nav.shop':         'Boutique',
    'nav.contact':      'Contact',
    'nav.admin':        'Admin',

    /* Home hero */
    'hero.tagline':     'Le meilleur de Bangui',
    'hero.subtitle':    'Événements, restaurants, culture et nightlife à Bangui, République Centrafricaine',
    'hero.cta.discover':'Découvrir Bangui',
    'hero.cta.events':  'Explorer les événements',
    'hero.cta.book':    'Réserver une expérience',

    /* Sections */
    'section.events.title':      'Événements à venir',
    'section.events.subtitle':   'Ne manquez aucun événement',
    'section.restaurants.title': 'Restaurants & Nightlife',
    'section.restaurants.subtitle': 'Les meilleures adresses de Bangui',
    'section.talents.title':     'Talents & Inspirations',
    'section.talents.subtitle':  'Rencontrez les personnalités de Bangui',
    'section.gallery.title':     'Galerie',
    'section.gallery.subtitle':  'Les plus beaux moments',
    'section.articles.title':    'Derniers articles',
    'section.articles.subtitle': 'Découvrez notre magazine',
    'section.newsletter.title':  'Restez connecté',
    'section.newsletter.subtitle':'Recevez nos meilleures recommandations',
    'section.newsletter.cta':    'S\'abonner',
    'section.newsletter.placeholder': 'Votre email',

    /* General */
    'general.seeAll':     'Voir tout',
    'general.learnMore':  'En savoir plus',
    'general.bookNow':    'Réserver',
    'general.loading':    'Chargement...',
    'general.error':      'Une erreur est survenue',
    'general.noResults':  'Aucun résultat',
    'general.free':       'Gratuit',
    'general.from':       'À partir de',
    'general.at':         'à',
    'general.by':         'par',
    'general.on':         'le',
    'general.in':         'à',
    'general.readMore':   'Lire la suite',
    'general.share':      'Partager',
    'general.filter':     'Filtrer',
    'general.all':        'Tout',
    'general.featured':   'À la une',
    'general.new':        'Nouveau',
    'general.sold_out':   'Complet',
    'general.limited':    'Édition limitée',
    'general.save':       'Enregistrer',
    'general.cancel':     'Annuler',
    'general.delete':     'Supprimer',
    'general.edit':       'Modifier',
    'general.add':        'Ajouter',
    'general.search':     'Rechercher',
    'general.close':      'Fermer',
    'general.back':       'Retour',
    'general.next':       'Suivant',
    'general.prev':       'Précédent',
    'general.submit':     'Envoyer',
    'general.confirm':    'Confirmer',
    'general.success':    'Succès !',

    /* Events */
    'events.title':        'Événements',
    'events.category.all': 'Tous',
    'events.rsvp':         'RSVP',
    'events.tickets':      'Billets',
    'events.countdown':    'Compte à rebours',
    'events.past':         'Événement passé',
    'events.today':        'Aujourd\'hui',

    /* Restaurants */
    'restaurants.reserve':    'Réserver une table',
    'restaurants.hours':      'Horaires',
    'restaurants.menu':       'Menu',
    'restaurants.gallery':    'Photos',
    'restaurants.reviews':    'Avis',
    'restaurants.call':       'Appeler',
    'restaurants.directions': 'Itinéraire',

    /* Shop */
    'shop.cart':           'Panier',
    'shop.addToCart':      'Ajouter au panier',
    'shop.checkout':       'Commander',
    'shop.total':          'Total',
    'shop.quantity':       'Quantité',
    'shop.size':           'Taille',
    'shop.color':          'Couleur',
    'shop.empty':          'Votre panier est vide',

    /* Contact */
    'contact.title':       'Contact',
    'contact.name':        'Votre nom',
    'contact.email':       'Votre email',
    'contact.phone':       'Votre téléphone',
    'contact.subject':     'Sujet',
    'contact.message':     'Message',
    'contact.send':        'Envoyer le message',
    'contact.sent':        'Message envoyé !',

    /* Auth */
    'auth.login':          'Se connecter',
    'auth.register':       'S\'inscrire',
    'auth.logout':         'Se déconnecter',
    'auth.email':          'Email',
    'auth.password':       'Mot de passe',
    'auth.name':           'Nom complet',
    'auth.forgotPassword': 'Mot de passe oublié ?',

    /* Footer */
    'footer.rights':       '© 2025 Bangui est Doux. Tous droits réservés.',
    'footer.newsletter':   'Newsletter',
    'footer.follow':       'Nous suivre',
  },
  en: {
    /* Nav */
    'nav.home':         'Home',
    'nav.events':       'Events',
    'nav.restaurants':  'Restaurants & Nightlife',
    'nav.cinema':       'Cinema & Culture',
    'nav.discover':     'Discover Bangui',
    'nav.practical':    'Practical Info',
    'nav.talents':      'Talents & Inspirations',
    'nav.gallery':      'Gallery',
    'nav.shop':         'Shop',
    'nav.contact':      'Contact',
    'nav.admin':        'Admin',

    /* Home hero */
    'hero.tagline':     'The Best of Bangui',
    'hero.subtitle':    'Events, restaurants, culture and nightlife in Bangui, Central African Republic',
    'hero.cta.discover':'Discover Bangui',
    'hero.cta.events':  'Explore Events',
    'hero.cta.book':    'Book an Experience',

    /* Sections */
    'section.events.title':      'Upcoming Events',
    'section.events.subtitle':   "Don't miss a thing",
    'section.restaurants.title': 'Restaurants & Nightlife',
    'section.restaurants.subtitle': "Bangui's best addresses",
    'section.talents.title':     'Talents & Inspirations',
    'section.talents.subtitle':  "Meet Bangui's personalities",
    'section.gallery.title':     'Gallery',
    'section.gallery.subtitle':  'The best moments',
    'section.articles.title':    'Latest Articles',
    'section.articles.subtitle': 'Discover our magazine',
    'section.newsletter.title':  'Stay Connected',
    'section.newsletter.subtitle':'Get our best recommendations',
    'section.newsletter.cta':    'Subscribe',
    'section.newsletter.placeholder': 'Your email',

    /* General */
    'general.seeAll':     'See all',
    'general.learnMore':  'Learn more',
    'general.bookNow':    'Book now',
    'general.loading':    'Loading...',
    'general.error':      'An error occurred',
    'general.noResults':  'No results',
    'general.free':       'Free',
    'general.from':       'From',
    'general.at':         'at',
    'general.by':         'by',
    'general.on':         'on',
    'general.in':         'in',
    'general.readMore':   'Read more',
    'general.share':      'Share',
    'general.filter':     'Filter',
    'general.all':        'All',
    'general.featured':   'Featured',
    'general.new':        'New',
    'general.sold_out':   'Sold out',
    'general.limited':    'Limited edition',
    'general.save':       'Save',
    'general.cancel':     'Cancel',
    'general.delete':     'Delete',
    'general.edit':       'Edit',
    'general.add':        'Add',
    'general.search':     'Search',
    'general.close':      'Close',
    'general.back':       'Back',
    'general.next':       'Next',
    'general.prev':       'Prev',
    'general.submit':     'Submit',
    'general.confirm':    'Confirm',
    'general.success':    'Success!',

    /* Events */
    'events.title':        'Events',
    'events.category.all': 'All',
    'events.rsvp':         'RSVP',
    'events.tickets':      'Tickets',
    'events.countdown':    'Countdown',
    'events.past':         'Past event',
    'events.today':        'Today',

    /* Restaurants */
    'restaurants.reserve':    'Reserve a table',
    'restaurants.hours':      'Hours',
    'restaurants.menu':       'Menu',
    'restaurants.gallery':    'Photos',
    'restaurants.reviews':    'Reviews',
    'restaurants.call':       'Call',
    'restaurants.directions': 'Directions',

    /* Shop */
    'shop.cart':           'Cart',
    'shop.addToCart':      'Add to cart',
    'shop.checkout':       'Checkout',
    'shop.total':          'Total',
    'shop.quantity':       'Quantity',
    'shop.size':           'Size',
    'shop.color':          'Color',
    'shop.empty':          'Your cart is empty',

    /* Contact */
    'contact.title':       'Contact',
    'contact.name':        'Your name',
    'contact.email':       'Your email',
    'contact.phone':       'Your phone',
    'contact.subject':     'Subject',
    'contact.message':     'Message',
    'contact.send':        'Send message',
    'contact.sent':        'Message sent!',

    /* Auth */
    'auth.login':          'Login',
    'auth.register':       'Sign up',
    'auth.logout':         'Logout',
    'auth.email':          'Email',
    'auth.password':       'Password',
    'auth.name':           'Full name',
    'auth.forgotPassword': 'Forgot password?',

    /* Footer */
    'footer.rights':       '© 2025 Bangui est Doux. All rights reserved.',
    'footer.newsletter':   'Newsletter',
    'footer.follow':       'Follow us',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'fr',
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr');

  useEffect(() => {
    const saved = storage.get('bed_lang') as Lang | null;
    if (saved === 'fr' || saved === 'en') setLangState(saved);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    storage.set('bed_lang', l);
    document.documentElement.lang = l;
  }, []);

  const t = useCallback(
    (key: string) => translations[lang][key] ?? translations['en'][key] ?? key,
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
