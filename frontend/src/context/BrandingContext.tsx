import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authFetch } from '../authClient';

interface BrandingData {
  platformName?: string;
  tagline?: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
}

interface BrandingContextType {
  branding: BrandingData | null;
  refreshBranding: () => Promise<void>;
  isLoading: boolean;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const BrandingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<BrandingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndApplyBranding = async () => {
    try {
      const data = await authFetch<BrandingData>("/admin/branding");
      if (data) {
        setBranding(data);
        
        // Apply platform name
        if (data.platformName) {
          document.title = data.platformName;
        }

        // Apply CSS variables globally
        if (data.primaryColor) {
          document.documentElement.style.setProperty('--color-primary', data.primaryColor);
        }
        if (data.secondaryColor) {
          document.documentElement.style.setProperty('--color-secondary', data.secondaryColor);
        }

        // Apply favicon
        if (data.faviconUrl) {
          let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            document.head.appendChild(link);
          }
          link.href = data.faviconUrl;
        }
      }
    } catch (error) {
      console.error("Failed to load branding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAndApplyBranding();
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, refreshBranding: fetchAndApplyBranding, isLoading }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};
