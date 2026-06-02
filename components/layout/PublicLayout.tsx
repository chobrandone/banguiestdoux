'use client';

import { usePathname } from 'next/navigation';
import Navbar    from './Navbar';
import Footer    from './Footer';
import CartDrawer from '@/components/shop/CartDrawer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/addmin');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
