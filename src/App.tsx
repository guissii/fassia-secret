import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductSection } from './components/ProductSection';
import { Categories } from './components/Categories';
import { Brands } from './components/Brands';
import { Footer } from './components/Footer';
import { Cart, type CartItem } from './components/Cart';

// Demo cart items matching the product style
const DEMO_CART_ITEMS: CartItem[] = [
  {
    id: 1,
    name: "Derma Hydrating Serum",
    price: 180.00,
    image: "19bd7403-d2ac-49a4-a584-be5895add421.png",
    category: "Visage",
    quantity: 1,
  },
  {
    id: 2,
    name: "Hydra Boost Gel Cream",
    price: 199.00,
    oldPrice: 249.00,
    image: "d6f902fd-0b09-48d0-8055-d03094820431.png",
    category: "Visage",
    quantity: 2,
  },
];

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(DEMO_CART_ITEMS);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  function handleUpdateQuantity(id: number, quantity: number) {
    setCartItems(prev =>
      prev.map(item => item.id === id ? { ...item, quantity } : item)
    );
  }

  function handleRemoveItem(id: number) {
    setCartItems(prev => prev.filter(item => item.id !== id));
  }

  return (
    <div className="app-container">
      <Header onCartOpen={() => setIsCartOpen(true)} cartCount={totalCartCount} />
      <main>
        <Hero />
        
        <ProductSection title="Nouveautés" />
        <ProductSection title="Meilleures Ventes" />
        
        <Categories />
        
        <ProductSection title="Beauté Coréenne" />
        
        <Brands />
      </main>
      <Footer />

      {/* Cart Drawer */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </div>
  );
}

export default App;
