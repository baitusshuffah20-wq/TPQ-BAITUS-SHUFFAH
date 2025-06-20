'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// Define types for settings
interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logo: string;
  favicon: string;
  timezone: string;
  language: string;
  maintenanceMode: boolean;
}

interface ContactSettings {
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  operationalHours: string;
}

interface AboutSettings {
  vision: string;
  mission: string;
  history: string;
  values: string;
  achievements: string;
}

interface Settings {
  system: SiteSettings;
  contact: ContactSettings;
  about: AboutSettings;
  [key: string]: any;
}

interface SettingsContextType {
  settings: Settings;
  isLoading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
}

// Create context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Default settings
const defaultSettings: Settings = {
  system: {
    siteName: 'TPQ Baitus Shuffah',
    siteDescription: 'Lembaga Pendidikan Tahfidz Al-Quran',
    logo: '/logo.png',
    favicon: '/favicon.ico',
    timezone: 'Asia/Jakarta',
    language: 'id',
    maintenanceMode: false,
  },
  contact: {
    address: '',
    phone: '',
    email: '',
    whatsapp: '',
    operationalHours: '',
  },
  about: {
    vision: '',
    mission: '',
    history: '',
    values: '',
    achievements: '',
  },
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching settings...');
      const response = await fetch('/api/settings?public=true');
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      console.log('Settings fetched successfully:', data);

      if (data.success && data.settings) {
        const newSettings = { ...defaultSettings };

        // System settings
        if (data.settings['site.name']) {
          newSettings.system.siteName = data.settings['site.name'].value;
        }
        
        if (data.settings['site.description']) {
          newSettings.system.siteDescription = data.settings['site.description'].value;
        }
        
        if (data.settings['site.logo']) {
          newSettings.system.logo = data.settings['site.logo'].value;
        }
        
        if (data.settings['site.favicon']) {
          newSettings.system.favicon = data.settings['site.favicon'].value;
        }
        
        if (data.settings['site.timezone']) {
          newSettings.system.timezone = data.settings['site.timezone'].value;
        }
        
        if (data.settings['site.language']) {
          newSettings.system.language = data.settings['site.language'].value;
        }
        
        if (data.settings['site.maintenanceMode']) {
          // Convert string 'true'/'false' to boolean
          newSettings.system.maintenanceMode = data.settings['site.maintenanceMode'].value === true || 
                                              data.settings['site.maintenanceMode'].value === 'true';
          console.log('Maintenance mode set to:', newSettings.system.maintenanceMode);
        }

        // Contact settings
        if (data.settings['contact.address']) {
          newSettings.contact.address = data.settings['contact.address'].value;
        }
        
        if (data.settings['contact.phone']) {
          newSettings.contact.phone = data.settings['contact.phone'].value;
        }
        
        if (data.settings['contact.email']) {
          newSettings.contact.email = data.settings['contact.email'].value;
        }
        
        if (data.settings['contact.whatsapp']) {
          newSettings.contact.whatsapp = data.settings['contact.whatsapp'].value;
        }
        
        if (data.settings['contact.operationalHours']) {
          newSettings.contact.operationalHours = data.settings['contact.operationalHours'].value;
        }

        // About settings
        if (data.settings['about.vision']) {
          newSettings.about.vision = data.settings['about.vision'].value;
        }
        
        if (data.settings['about.mission']) {
          newSettings.about.mission = data.settings['about.mission'].value;
        }
        
        if (data.settings['about.history']) {
          newSettings.about.history = data.settings['about.history'].value;
        }
        
        if (data.settings['about.values']) {
          newSettings.about.values = data.settings['about.values'].value;
        }
        
        if (data.settings['about.achievements']) {
          newSettings.about.achievements = data.settings['about.achievements'].value;
        }

        setSettings(newSettings);

        // Apply settings to document
        document.title = newSettings.system.siteName;
        console.log('Setting document title to:', newSettings.system.siteName);
        
        // Update favicon
        const faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (faviconLink) {
          faviconLink.href = newSettings.system.favicon;
          console.log('Updated favicon to:', newSettings.system.favicon);
        } else {
          const newFaviconLink = document.createElement('link');
          newFaviconLink.rel = 'icon';
          newFaviconLink.href = newSettings.system.favicon;
          document.head.appendChild(newFaviconLink);
          console.log('Created new favicon link with href:', newSettings.system.favicon);
        }
        
        // Update logo in meta tags
        let logoMetaTag = document.querySelector('meta[property="og:image"]') as HTMLMetaElement;
        if (logoMetaTag) {
          logoMetaTag.content = newSettings.system.logo;
          console.log('Updated og:image meta tag to:', newSettings.system.logo);
        } else {
          logoMetaTag = document.createElement('meta');
          logoMetaTag.setAttribute('property', 'og:image');
          logoMetaTag.content = newSettings.system.logo;
          document.head.appendChild(logoMetaTag);
          console.log('Created new og:image meta tag with content:', newSettings.system.logo);
        }
        
        // Update description in meta tags
        let descMetaTag = document.querySelector('meta[name="description"]') as HTMLMetaElement;
        if (descMetaTag) {
          descMetaTag.content = newSettings.system.siteDescription;
          console.log('Updated description meta tag to:', newSettings.system.siteDescription);
        } else {
          descMetaTag = document.createElement('meta');
          descMetaTag.setAttribute('name', 'description');
          descMetaTag.content = newSettings.system.siteDescription;
          document.head.appendChild(descMetaTag);
          console.log('Created new description meta tag with content:', newSettings.system.siteDescription);
        }
        
        // Set language attribute on html tag
        document.documentElement.lang = newSettings.system.language;
        console.log('Set document language to:', newSettings.system.language);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    
    // Add event listener for when settings are updated
    window.addEventListener('settings-updated', fetchSettings);
    
    return () => {
      window.removeEventListener('settings-updated', fetchSettings);
    };
  }, []);

  const value = {
    settings,
    isLoading,
    error,
    refreshSettings: fetchSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};