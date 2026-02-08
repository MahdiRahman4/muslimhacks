import { useEffect, useState } from 'react';

export function useFontLoader() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Add loading class immediately
    document.documentElement.classList.add('fonts-loading');

    // Check if fonts are already loaded
    if (document.fonts.ready) {
      document.fonts.ready.then(() => {
        // Small delay to ensure fonts are rendered
        requestAnimationFrame(() => {
          document.documentElement.classList.remove('fonts-loading');
          setFontsLoaded(true);
        });
      });
    } else {
      // Fallback for browsers without font loading API
      const timeout = setTimeout(() => {
        document.documentElement.classList.remove('fonts-loading');
        setFontsLoaded(true);
      }, 300);
      
      return () => clearTimeout(timeout);
    }
  }, []);

  return fontsLoaded;
}
