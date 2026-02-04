import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// 8 Pre-defined Premium Themes
export const THEMES = {
  midnight: {
    name: 'Midnight Pro',
    description: 'Dark professional theme with cyan accents',
    icon: '🌙',
    preview: 'from-slate-900 to-slate-800',
    colors: {
      primary: '#06b6d4',       // cyan-500
      secondary: '#8b5cf6',     // violet-500
      background: '#0f172a',    // slate-900
      surface: '#1e293b',       // slate-800
      accent: '#22d3ee',        // cyan-400
      text: '#f8fafc',          // slate-50
      textMuted: '#94a3b8',     // slate-400
    }
  },
  carbon: {
    name: 'Carbon Black',
    description: 'Pure black with electric blue highlights',
    icon: '⚫',
    preview: 'from-black to-zinc-900',
    colors: {
      primary: '#3b82f6',       // blue-500
      secondary: '#06b6d4',     // cyan-500
      background: '#000000',    // pure black
      surface: '#18181b',       // zinc-900
      accent: '#60a5fa',        // blue-400
      text: '#ffffff',          // white
      textMuted: '#a1a1aa',     // zinc-400
    }
  },
  minimal: {
    name: 'Clean White',
    description: 'Minimal light theme, clean & bright',
    icon: '☀️',
    preview: 'from-gray-50 to-white',
    colors: {
      primary: '#0ea5e9',       // sky-500
      secondary: '#6366f1',     // indigo-500
      background: '#ffffff',    // white
      surface: '#f8fafc',       // slate-50
      accent: '#0284c7',        // sky-600
      text: '#0f172a',          // slate-900
      textMuted: '#64748b',     // slate-500
    }
  },
  forest: {
    name: 'Forest Night',
    description: 'Natural dark green, calming vibes',
    icon: '🌲',
    preview: 'from-emerald-950 to-teal-900',
    colors: {
      primary: '#10b981',       // emerald-500
      secondary: '#14b8a6',     // teal-500
      background: '#022c22',    // emerald-950
      surface: '#064e3b',       // emerald-900
      accent: '#34d399',        // emerald-400
      text: '#ecfdf5',          // emerald-50
      textMuted: '#6ee7b7',     // emerald-300
    }
  },
  sunset: {
    name: 'Sunset Glow',
    description: 'Warm orange and red tones',
    icon: '🌅',
    preview: 'from-orange-950 to-red-900',
    colors: {
      primary: '#f97316',       // orange-500
      secondary: '#ef4444',     // red-500
      background: '#431407',    // orange-950
      surface: '#7c2d12',       // orange-900
      accent: '#fb923c',        // orange-400
      text: '#fff7ed',          // orange-50
      textMuted: '#fdba74',     // orange-300
    }
  },
  ocean: {
    name: 'Deep Ocean',
    description: 'Cool blue depths with wave accents',
    icon: '🌊',
    preview: 'from-blue-950 to-indigo-900',
    colors: {
      primary: '#3b82f6',       // blue-500
      secondary: '#6366f1',     // indigo-500
      background: '#0c1929',    // custom dark blue
      surface: '#1e3a5f',       // custom blue
      accent: '#60a5fa',        // blue-400
      text: '#e0f2fe',          // sky-100
      textMuted: '#7dd3fc',     // sky-300
    }
  },
  royal: {
    name: 'Royal Purple',
    description: 'Elegant purple with gold accents',
    icon: '👑',
    preview: 'from-purple-950 to-fuchsia-900',
    colors: {
      primary: '#a855f7',       // purple-500
      secondary: '#d946ef',     // fuchsia-500
      background: '#1a0533',    // custom deep purple
      surface: '#2e1065',       // purple-950
      accent: '#e879f9',        // fuchsia-400
      text: '#faf5ff',          // purple-50
      textMuted: '#d8b4fe',     // purple-300
    }
  },
  rose: {
    name: 'Rose Gold',
    description: 'Soft pink with rose gold elegance',
    icon: '🌸',
    preview: 'from-rose-950 to-pink-900',
    colors: {
      primary: '#f43f5e',       // rose-500
      secondary: '#ec4899',     // pink-500
      background: '#1c0a14',    // custom dark rose
      surface: '#3d1529',       // custom rose
      accent: '#fb7185',        // rose-400
      text: '#fff1f2',          // rose-50
      textMuted: '#fda4af',     // rose-300
    }
  }
};

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [selectedTheme, setSelectedTheme] = useState('midnight');
  const [customColors, setCustomColors] = useState(THEMES.midnight.colors);
  const [useCustomColors, setUseCustomColors] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPublicThemeLoaded, setIsPublicThemeLoaded] = useState(false);

  // Get current colors based on selection
  const currentColors = useCustomColors ? customColors : THEMES[selectedTheme]?.colors || THEMES.midnight.colors;

  // Load theme settings
  const loadThemeSettings = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/theme`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const { selectedTheme, customColors, useCustomColors } = response.data.data;
        setSelectedTheme(selectedTheme || 'midnight');
        setCustomColors(customColors || THEMES.midnight.colors);
        setUseCustomColors(useCustomColors || false);
      }
    } catch (error) {
      console.error('Failed to load theme settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save theme settings
  const saveThemeSettings = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const response = await axios.post(`${API_URL}/theme`, {
        selectedTheme,
        customColors,
        useCustomColors
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data.success;
    } catch (error) {
      console.error('Failed to save theme settings:', error);
      return false;
    }
  }, [selectedTheme, customColors, useCustomColors]);

  // Load public theme (for interview room)
  const loadPublicTheme = useCallback(async (adminId) => {
    try {
      console.log('🎨 [ThemeContext] Loading public theme for:', adminId);
      setIsPublicThemeLoaded(true); // Mark that we're using public theme
      const response = await axios.get(`${API_URL}/theme/public/${adminId}`);
      console.log('🎨 [ThemeContext] Response:', response.data);
      if (response.data.success) {
        const { selectedTheme, customColors, useCustomColors } = response.data.data;
        console.log('🎨 [ThemeContext] Applying theme:', selectedTheme, 'useCustom:', useCustomColors);
        setSelectedTheme(selectedTheme || 'midnight');
        setCustomColors(customColors || THEMES.midnight.colors);
        setUseCustomColors(useCustomColors || false);
      }
    } catch (error) {
      console.error('🎨 [ThemeContext] Failed to load public theme:', error);
      setIsPublicThemeLoaded(false);
    }
  }, []);

  useEffect(() => {
    loadThemeSettings();
  }, [loadThemeSettings]);

  // Apply CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', currentColors.primary);
    root.style.setProperty('--color-secondary', currentColors.secondary);
    root.style.setProperty('--color-background', currentColors.background);
    root.style.setProperty('--color-surface', currentColors.surface);
    root.style.setProperty('--color-accent', currentColors.accent);
    root.style.setProperty('--color-text', currentColors.text);
    root.style.setProperty('--color-text-muted', currentColors.textMuted);
  }, [currentColors]);

  const value = {
    selectedTheme,
    setSelectedTheme,
    customColors,
    setCustomColors,
    useCustomColors,
    setUseCustomColors,
    currentColors,
    saveThemeSettings,
    loadThemeSettings,
    loadPublicTheme,
    loading,
    themes: THEMES
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
