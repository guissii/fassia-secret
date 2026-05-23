import React, { useEffect, useState } from 'react';
import { ShoppingBag, DollarSign, Eye, Users, Clock, Loader } from 'lucide-react';
import { api, Stats, Order, AdminProduct, getOrderStatusLabel, getOrderStatusColor, Skeleton } from './mockData';
import { publicAssetUrl } from '../../lib/publicUrl';

export function DashboardTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [popularProducts, setPopularProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [statsData, ordersData, productsData] = await Promise.all([
          api.getStats(),
          api.getOrders(),
          api.getProducts()
        ]);
        
        setStats(statsData);
        // Sort orders by date descending (already mock sorted, just take first 5)
        setRecentOrders(ordersData.slice(0, 5));
        // Sort products by salesCount descending
        setPopularProducts([...productsData].sort((a, b) => b.salesCount - a.salesCount).slice(0, 5));
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const formatMAD = (amount: number) => {
    return amount.toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MAD';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', { 
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-stats-grid">
          {[...Array(6)].map((_, i) => <Skeleton key={i} height={120} borderRadius="16px" />)}
        </div>
        <div className="admin-dashboard-tables">
          <Skeleton height={300} borderRadius="16px" />
          <Skeleton height={300} borderRadius="16px" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h2>Aperçu de l'activité</h2>
        <p className="admin-subtitle">Vos statistiques en temps réel</p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(225, 0, 116, 0.1)', color: '#e10074' }}>
            <ShoppingBag size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Commandes</span>
            <span className="stat-value">{stats?.totalOrders.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Revenus (MAD)</span>
            <span className="stat-value">{stats ? formatMAD(stats.totalRevenue) : 0}</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <Eye size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Vues Totales</span>
            <span className="stat-value">{stats?.totalViews.toLocaleString()}</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <Users size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Visiteurs Uniques</span>
            <span className="stat-value">{stats?.uniqueVisitors.toLocaleString()}</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Commandes en attente</span>
            <div className="stat-value-row">
              <span className="stat-value">{stats?.pendingOrders}</span>
              {stats?.pendingOrders ? <span className="stat-badge badge-warning">Action requise</span> : null}
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>
            <Loader size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">En traitement</span>
            <span className="stat-value">{stats?.processingOrders}</span>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-tables">
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Dernières commandes</h3>
            <button className="admin-btn-link">Voir tout</button>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} className="cursor-pointer hover-bg">
                    <td className="font-medium">{order.orderNumber}</td>
                    <td>{order.customerName}</td>
                    <td className="text-muted">{formatDate(order.createdAt)}</td>
                    <td className="font-medium">{formatMAD(order.total)}</td>
                    <td>
                      <span className={`admin-badge status-${order.status}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Produits populaires</h3>
            <button className="admin-btn-link">Voir inventaire</button>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Ventes</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {popularProducts.map(product => {
                  const imageSrc = product.image.startsWith('http') ? product.image : publicAssetUrl(product.image);
                  const isLowStock = product.stock < 10;
                  
                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="admin-product-cell">
                          <img src={imageSrc} alt={product.name} className="admin-product-thumb" />
                          <div className="admin-product-info">
                            <span className="admin-product-name">{product.name}</span>
                            <span className="admin-product-brand">{product.brand}</span>
                          </div>
                        </div>
                      </td>
                      <td className="font-medium">{product.salesCount}</td>
                      <td>
                        <span className={`admin-badge ${isLowStock ? 'badge-error' : 'badge-neutral'}`}>
                          {product.stock}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
