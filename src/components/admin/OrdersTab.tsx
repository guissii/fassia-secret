import React, { useState, useEffect } from 'react';
import { Search, FileSpreadsheet, Eye, Check, Trash2 } from 'lucide-react';
import { api, Order, OrderStatus, getOrderStatusLabel, delay } from './mockData';
import { OrderDetailModal } from './OrderDetailModal';
import { Toast, ToastType, ConfirmModal } from './shared';

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // UI State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  
  // Modals & Toasts
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (e) {
      setToast({ message: "Erreur de chargement", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery);
      
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleChangeStatus = async (id: string, newStatus: OrderStatus) => {
    try {
      await api.fetchWithAuth(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === id) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
      setToast({ message: `Statut mis à jour`, type: 'success' });
    } catch {
      setToast({ message: `Erreur lors de la mise à jour du statut`, type: 'error' });
    }
  };

  const handleSync = async (id: string) => {
    setSyncingId(id);
    await delay(1000); // Simulate API call
    setOrders(prev => prev.map(o => o.id === id ? { ...o, syncedToSheets: true } : o));
    if (selectedOrder?.id === id) {
      setSelectedOrder(prev => prev ? { ...prev, syncedToSheets: true } : null);
    }
    setSyncingId(null);
    setToast({ message: "Synchronisé avec Google Sheets", type: 'success' });
  };

  const handleDelete = async (id: string) => {
    try {
      await api.fetchWithAuth(`/orders/${id}`, { method: 'DELETE' });
      setOrders(prev => prev.filter(o => o.id !== id));
      setToast({ message: "Commande supprimée", type: 'success' });
    } catch {
      setToast({ message: "Erreur lors de la suppression", type: 'error' });
    }
  };

  const handleExport = async () => {
    setToast({ message: "Export en cours de préparation...", type: 'info' });
    await delay(1500);
    setToast({ message: "Fichier commandes_youposh.xlsx téléchargé", type: 'success' });
  };

  const formatMAD = (amount: number) => {
    return amount.toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MAD';
  };

  return (
    <div className="admin-orders-tab">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <ConfirmModal 
        isOpen={!!confirmDeleteId}
        title="Supprimer la commande"
        message="Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible."
        confirmLabel="Supprimer"
        isDestructive={true}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />

      <OrderDetailModal 
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onChangeStatus={handleChangeStatus}
        onSync={handleSync}
        syncingId={syncingId}
      />

      <div className="admin-dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Gestion des Commandes</h2>
          <p className="admin-subtitle">Consultez et traitez vos commandes en cours</p>
        </div>
        <button className="admin-btn-outline" onClick={handleExport}>
          <FileSpreadsheet size={18} />
          Exporter Excel
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Rechercher (N°, client, téléphone)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="admin-filters">
            <select 
              className="admin-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="processing">En traitement</option>
              <option value="shipped">Expédié</option>
              <option value="delivered">Livré</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>N° Commande</th>
                <th>Date</th>
                <th>Client</th>
                <th>Ville</th>
                <th>Total</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-lg">Chargement...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-lg text-muted">Aucune commande trouvée.</td></tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover-bg cursor-pointer" onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}>
                    <td className="font-medium">{order.orderNumber}</td>
                    <td className="text-muted">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td>
                      <div style={{ lineHeight: 1.2 }}>
                        <div>{order.customerName}</div>
                        <div className="text-muted text-xs">{order.phone}</div>
                      </div>
                    </td>
                    <td>{order.city}</td>
                    <td className="font-medium">{formatMAD(order.total)}</td>
                    <td>
                      <span className={`admin-badge status-${order.status}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button 
                          className="action-btn" 
                          title="Voir"
                          onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setIsModalOpen(true); }}
                        >
                          <Eye size={18} />
                        </button>
                        {order.status === 'pending' && (
                          <button 
                            className="action-btn text-success" 
                            title="Approuver"
                            onClick={(e) => { e.stopPropagation(); handleChangeStatus(order.id, 'processing'); }}
                          >
                            <Check size={18} />
                          </button>
                        )}
                        <button 
                          className="action-btn text-danger" 
                          title="Supprimer"
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(order.id); }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          <div className="admin-table-footer">
            <span className="text-sm text-muted">
              Affichage de {filteredOrders.length} commande(s)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
