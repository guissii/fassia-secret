import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { OrderStatus } from './mockData';

export function getOrderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case 'pending': return 'En attente';
    case 'processing': return 'En traitement';
    case 'shipped': return 'Expédié';
    case 'delivered': return 'Livré';
    case 'cancelled': return 'Annulé';
    default: return status;
  }
}

export function getOrderStatusColor(status: OrderStatus): string {
  switch (status) {
    case 'pending': return '#f59e0b'; // Amber
    case 'processing': return '#3b82f6'; // Blue
    case 'shipped': return '#8b5cf6'; // Violet
    case 'delivered': return '#10b981'; // Green
    case 'cancelled': return '#ef4444'; // Red
    default: return '#6b7280'; // Gray
  }
}

// --- Confirm Modal ---
interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmLabel = 'Confirmer', 
  cancelLabel = 'Annuler',
  isDestructive = false,
  onConfirm, 
  onCancel 
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onCancel}>
      <div className="admin-modal-content confirm-modal" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="admin-modal-actions">
          <button className="admin-btn-outline" onClick={onCancel}>{cancelLabel}</button>
          <button 
            className={`admin-btn-primary ${isDestructive ? 'btn-destructive' : ''}`} 
            onClick={() => { onConfirm(); onCancel(); }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Toast ---
export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? AlertCircle : Info;

  return (
    <div className={`admin-toast toast-${type}`}>
      <Icon size={20} />
      <span>{message}</span>
      <button onClick={onClose} className="toast-close"><X size={16} /></button>
    </div>
  );
}

// --- Skeleton ---
export function Skeleton({ width, height, borderRadius = '4px', className = '' }: { width?: string | number, height?: string | number, borderRadius?: string, className?: string }) {
  return (
    <div 
      className={`admin-skeleton ${className}`} 
      style={{ width, height, borderRadius }}
    />
  );
}
