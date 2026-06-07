import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard,
  ShoppingBag,
  Package,
  FolderTree,
  TicketPercent,
  Settings,
  LogOut,
  Menu,
  X,
  Activity,
  Store,
  FlaskConical
} from 'lucide-react';
import './AdminPage.css';
import { AdminLogin } from './AdminLogin';
import { publicAssetUrl } from '../../lib/publicUrl';
import { DashboardTab } from './DashboardTab';
import { OrdersTab } from './OrdersTab';
import { ProductsTab } from './ProductsTab';
import { CategoriesTab } from './CategoriesTab';
import { PromosTab } from './PromosTab';

import { SettingsTab } from './SettingsTab';
import { ServerTab } from './ServerTab';
import { OfficialShopsTab } from './OfficialShopsTab';
import { IngredientsTab } from './IngredientsTab';

type TabId = 'dashboard' | 'orders' | 'products' | 'categories' | 'ingredients' | 'promos' | 'official-shops' | 'settings' | 'server';

export function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(14);

  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  const navItems: Array<{ id: TabId; label: string; icon: typeof LayoutDashboard; badge?: number }> = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'orders', label: 'Commandes', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'products', label: 'Produits', icon: Package },
    { id: 'categories', label: 'Catégories', icon: FolderTree },
    { id: 'ingredients', label: 'Ingrédients', icon: FlaskConical },
    { id: 'promos', label: 'Promotions', icon: TicketPercent },
    { id: 'official-shops', label: 'Boutiques Off.', icon: Store },
    { id: 'settings', label: 'Paramètres', icon: Settings },
    { id: 'server', label: 'Serveur (VPS)', icon: Activity },
  ];

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab />;
      case 'orders': return <OrdersTab />;
      case 'products': return <ProductsTab />;
      case 'categories': return <CategoriesTab />;
      case 'ingredients': return <IngredientsTab />;
      case 'promos': return <PromosTab />;
      case 'official-shops': return <OfficialShopsTab />;
      case 'settings': return <SettingsTab />;
      case 'server': return <ServerTab />;
      default: return <DashboardTab />;
    }
  };

  return (
    <div className="admin-layout">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`admin-sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
        onClick={() => setIsSidebarOpen(false)} 
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <img src={publicAssetUrl('logo.png')} alt="Fassia Secret" className="admin-sidebar-logo" />
          <button className="admin-mobile-close" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="admin-nav">
          {navItems.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              className={`admin-nav-item ${activeTab === id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(id);
                setIsSidebarOpen(false);
              }}
            >
              <Icon size={20} className="admin-nav-icon" />
              <span className="admin-nav-label">{label}</span>
              {badge ? <span className="admin-nav-badge">{badge}</span> : null}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-nav-item logout" onClick={handleLogout}>
            <LogOut size={20} className="admin-nav-icon" />
            <span className="admin-nav-label">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Mobile Header */}
        <div className="admin-mobile-header">
          <button onClick={() => setIsSidebarOpen(true)} className="admin-mobile-menu-btn">
            <Menu size={24} />
          </button>
          <h2>{navItems.find(item => item.id === activeTab)?.label}</h2>
          <div style={{ width: 24 }} /> {/* Spacer for centering */}
        </div>

        {/* Tab Content */}
        <div className="admin-content-area">
          {renderActiveTab()}
        </div>
      </main>
    </div>
  );
}
