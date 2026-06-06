"use client";

import { Header } from './Header';
import { Footer } from './Footer';
import { Cart } from './Cart';
import { CartProvider, useCart } from './CartContext';
import { SiteConfigProvider } from './SiteConfigContext';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, removeItem, totalCartCount } = useCart();

  return (
    <div className="app-container">
      <Header onCartOpen={() => setIsCartOpen(true)} cartCount={totalCartCount} />
      
      <main>
        {children}
      </main>
      
      <Footer />

      {/* Cart Drawer */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
      />
    </div>
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteConfigProvider>
      <CartProvider>
        <LayoutContent>{children}</LayoutContent>
      </CartProvider>
    </SiteConfigProvider>
  );
}
