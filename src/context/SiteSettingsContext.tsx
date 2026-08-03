import React, { createContext, useContext, useState, useEffect } from 'react';

interface SiteSettingsContextType {
  logoUrl: string | null;
  refreshSiteSettings: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  logoUrl: '/logo.svg',
  refreshSiteSettings: async () => {},
});

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logoUrl] = useState<string | null>('/logo.svg');

  // Maintain favicon setting
  useEffect(() => {
    try {
      const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (link) {
        link.href = '/logo.svg';
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = '/logo.svg';
        document.head.appendChild(newLink);
      }
    } catch (e) {
      console.warn('Failed to update dynamic favicon:', e);
    }
  }, []);

  const refreshSiteSettings = async () => {};

  return (
    <SiteSettingsContext.Provider
      value={{
        logoUrl,
        refreshSiteSettings,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
