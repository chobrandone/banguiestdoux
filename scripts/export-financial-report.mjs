import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('fr-FR') : '';
}

async function main() {
  const [ordersRes, itemsRes, hotelRes, carRes] = await Promise.all([
    supabase.from('orders').select('*').order('created_at', { ascending: false }),
    supabase.from('order_items').select('*'),
    supabase.from('hotel_bookings').select('*').order('created_at', { ascending: false }),
    supabase.from('car_rentals').select('*').order('created_at', { ascending: false }),
  ]);

  if (ordersRes.error) throw ordersRes.error;
  if (itemsRes.error) throw itemsRes.error;
  if (hotelRes.error) throw hotelRes.error;
  if (carRes.error) throw carRes.error;

  const orders = ordersRes.data || [];
  const orderItems = itemsRes.data || [];
  const hotelBookings = hotelRes.data || [];
  const carRentals = carRes.data || [];

  const ordersRows = orders.map(o => ({
    'ID': o.id,
    'Client': o.customer_name || '',
    'Téléphone': o.customer_phone || '',
    'Email': o.customer_email || o.guest_email || '',
    'Sous-total (XAF)': o.subtotal,
    'Livraison (XAF)': o.shipping_cost,
    'Total (XAF)': o.total,
    'Statut': o.status,
    'Statut paiement': o.payment_status,
    'Méthode paiement': o.payment_method,
    'Code promo': o.promo_code || '',
    'Réduction (XAF)': o.discount || 0,
    'Date': fmtDate(o.created_at),
  }));

  const itemsRows = orderItems.map(i => ({
    'Commande ID': i.order_id,
    'Article': i.name,
    'Quantité': i.quantity,
    'Prix unitaire (XAF)': i.price,
    'Total (XAF)': i.price * i.quantity,
    'Taille': i.size || '',
    'Couleur': i.color || '',
  }));

  const hotelRows = hotelBookings.map(b => ({
    'ID': b.id,
    'Hôtel': b.hotel_name,
    'Chambre': b.room_type,
    'Client': b.guest_name,
    'Téléphone': b.guest_phone || '',
    'Email': b.guest_email || '',
    'Arrivée': fmtDate(b.check_in),
    'Départ': fmtDate(b.check_out),
    'Nuits': b.nights,
    'Total (XAF)': b.total_price,
    'Statut': b.status,
    'Date': fmtDate(b.created_at),
  }));

  const carRows = carRentals.map(r => ({
    'ID': r.id,
    'Voiture': r.car_name,
    'Client': r.renter_name,
    'Téléphone': r.renter_phone || '',
    'Email': r.renter_email || '',
    'Début': fmtDate(r.start_date),
    'Fin': fmtDate(r.end_date),
    'Jours': r.days,
    'Lieu de prise en charge': r.pickup_location || '',
    'Trajet accueil': r.is_welcome_ride ? 'Oui' : 'Non',
    'Total (XAF)': r.total_price,
    'Statut': r.status,
    'Date': fmtDate(r.created_at),
  }));

  const shopRevenue  = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total || 0), 0);
  const hotelRevenue = hotelBookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + Number(b.total_price || 0), 0);
  const carRevenue   = carRentals.filter(r => r.status !== 'cancelled').reduce((s, r) => s + Number(r.total_price || 0), 0);

  const summaryRows = [
    { 'Source': 'Boutique',           'Nombre': orders.length,        'Revenus (XAF)': shopRevenue },
    { 'Source': 'Réservations Hôtel', 'Nombre': hotelBookings.length, 'Revenus (XAF)': hotelRevenue },
    { 'Source': 'Locations Voitures', 'Nombre': carRentals.length,    'Revenus (XAF)': carRevenue },
    { 'Source': 'TOTAL',              'Nombre': orders.length + hotelBookings.length + carRentals.length, 'Revenus (XAF)': shopRevenue + hotelRevenue + carRevenue },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), 'Résumé');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ordersRows), 'Commandes Boutique');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(itemsRows), 'Articles commandés');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(hotelRows), 'Réservations Hôtel');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(carRows), 'Locations Voitures');

  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}h${pad(now.getMinutes())}`;
  const outDir = path.resolve(process.cwd(), 'exports');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `rapport_financier_${stamp}.xlsx`);
  XLSX.writeFile(wb, outPath);

  console.log('Rapport généré :', outPath);
  console.log('Résumé :', summaryRows);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
