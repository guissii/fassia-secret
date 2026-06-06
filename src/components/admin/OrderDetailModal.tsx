import React from 'react';
import { X, MapPin, Phone, User, FileSpreadsheet } from 'lucide-react';
import { Order, OrderStatus, getOrderStatusLabel, getOrderStatusColor } from './mockData';
import { publicAssetUrl } from '../../lib/publicUrl';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onChangeStatus: (id: string, newStatus: OrderStatus) => void;
  onSync: (id: string) => void;
  syncingId: string | null;
}

export function OrderDetailModal({ order, isOpen, onClose, onChangeStatus, onSync, syncingId }: OrderDetailModalProps) {
  if (!isOpen || !order) return null;

  const formatMAD = (amount: number) => {
    return amount.toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MAD';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', { 
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  const isSyncing = syncingId === order.id;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content order-detail-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <div>
            <h3>Commande {order.orderNumber}</h3>
            <span className="text-muted text-sm">{formatDate(order.createdAt)}</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span className={`admin-badge status-${order.status}`}>
              {getOrderStatusLabel(order.status)}
            </span>
            <button className="admin-mobile-close" onClick={onClose} style={{ display: 'block' }}>
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="order-details-grid">
          <div className="order-customer-info">
            <h4>Informations Client</h4>
            <div className="info-row">
              <User size={16} />
              <span>{order.customerName}</span>
            </div>
            <div className="info-row">
              <Phone size={16} />
              <span>{order.phone}</span>
            </div>
            <div className="info-row align-start">
              <MapPin size={16} style={{ marginTop: '2px' }} />
              <div>
                <span>{order.address}</span>
                <span className="text-muted" style={{ display: 'block', fontSize: '0.85rem' }}>{order.city}</span>
              </div>
            </div>
          </div>

          <div className="order-timeline">
            <h4>Suivi</h4>
            <div className="timeline-step active">
              <div className="timeline-dot"></div>
              <span>Créée</span>
            </div>
            <div className={`timeline-step ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'active' : ''}`}>
              <div className="timeline-dot"></div>
              <span>En traitement</span>
            </div>
            <div className={`timeline-step ${['shipped', 'delivered'].includes(order.status) ? 'active' : ''}`}>
              <div className="timeline-dot"></div>
              <span>Expédiée</span>
            </div>
            <div className={`timeline-step ${['delivered'].includes(order.status) ? 'active' : ''}`}>
              <div className="timeline-dot"></div>
              <span>Livrée</span>
            </div>
          </div>
        </div>

        <div className="order-items-list">
          <h4>Articles commandés</h4>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Prix unitaire</th>
                <th>Qté</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => {
                const imageSrc = item.image.startsWith('data:') || item.image.startsWith('http') || item.image.startsWith('blob:') ? item.image : publicAssetUrl(item.image);
                return (
                  <tr key={index}>
                    <td>
                      <div className="admin-product-cell">
                        <img src={imageSrc} alt={item.name} className="admin-product-thumb" />
                        <span className="admin-product-name">{item.name}</span>
                      </div>
                    </td>
                    <td>{formatMAD(item.price)}</td>
                    <td>{item.quantity}</td>
                    <td className="font-medium">{formatMAD(item.price * item.quantity)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="order-totals">
            <div className="total-row">
              <span>Sous-total</span>
              <span>{formatMAD(order.total)}</span>
            </div>
            <div className="total-row">
              <span>Livraison</span>
              <span>Gratuite</span>
            </div>
            <div className="total-row grand-total">
              <span>Total</span>
              <span>{formatMAD(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="admin-modal-actions">
          <button className="admin-btn-outline" onClick={onClose}>Fermer</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>Statut :</label>
            <select
              className="admin-select"
              value={order.status}
              onChange={(e) => onChangeStatus(order.id, e.target.value as OrderStatus)}
              style={{ minWidth: '160px' }}
            >
              <option value="pending">En attente</option>
              <option value="processing">En traitement</option>
              <option value="shipped">Expédié</option>
              <option value="delivered">Livré</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>

          <button 
            className="admin-btn-outline" 
            onClick={() => onSync(order.id)}
            disabled={isSyncing}
            style={{ 
              borderColor: order.syncedToSheets ? '#10b981' : undefined,
              color: order.syncedToSheets ? '#10b981' : undefined
            }}
          >
            <FileSpreadsheet size={16} />
            {isSyncing ? 'Synchronisation...' : order.syncedToSheets ? 'Synchronisé Sheets' : 'Sync Sheets'}
          </button>
        </div>
      </div>
    </div>
  );
}
