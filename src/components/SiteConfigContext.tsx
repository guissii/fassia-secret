"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface SiteConfig {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  instagram: string;
  facebook: string;
}

const DEFAULT_CONFIG: SiteConfig = {
  storeName: 'Fassia Secret',
  storeEmail: 'contact@fassiasecret.com',
  storePhone: '+212 6 00 00 00 00',
  deliveryFee: 35,
  freeDeliveryThreshold: 800,
  instagram: 'https://instagram.com/fassiasecret',
  facebook: 'https://facebook.com/fassiasecret',
};

const SiteConfigContext = createContext<SiteConfig>(DEFAULT_CONFIG);

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    const stored = localStorage.getItem('siteConfig');
    if (stored) {
      try {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(stored) });
      } catch { /* ignore */ }
    }

    fetch('/api/site-config')
      .then(r => r.json())
      .then(data => {
        if (data.config) {
          const merged = { ...DEFAULT_CONFIG, ...data.config };
          setConfig(merged);
          localStorage.setItem('siteConfig', JSON.stringify(merged));
        }
      })
      .catch(() => { /* fallback already set */ });
  }, []);

  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig(): SiteConfig {
  return useContext(SiteConfigContext);
}
