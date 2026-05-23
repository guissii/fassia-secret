import React from 'react';
import '@/components/admin/AdminPage.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-isolated-layout">
      {children}
    </div>
  );
}
