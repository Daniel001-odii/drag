import WebFont from 'webfontloader';

export interface GoogleFont {
  family: string;
  variants: string[];
  category: string;
}

// Cache for loaded fonts to avoid reloading
const loadedFonts = new Set<string>();

// Popular Google Fonts categories
export const fontCategories = [
  'sans-serif',
  'serif',
  'display',
  'handwriting',
  'monospace',
] as const;

// Initial set of curated fonts
export const popularFonts: GoogleFont[] = [
  // Sans-serif fonts
  { family: 'Roboto', variants: ['regular', '500', '700'], category: 'sans-serif' },
  { family: 'Open Sans', variants: ['regular', '600', '700'], category: 'sans-serif' },
  { family: 'Lato', variants: ['regular', '700', '900'], category: 'sans-serif' },
  { family: 'Montserrat', variants: ['regular', '500', '700'], category: 'sans-serif' },
  { family: 'Poppins', variants: ['regular', '500', '600'], category: 'sans-serif' },
  { family: 'Source Sans Pro', variants: ['regular', '600'], category: 'sans-serif' },
  { family: 'Ubuntu', variants: ['regular', '500', '700'], category: 'sans-serif' },
  { family: 'Inter', variants: ['regular', '500', '600', '700'], category: 'sans-serif' },
  { family: 'Nunito', variants: ['regular', '600', '700'], category: 'sans-serif' },
  { family: 'Work Sans', variants: ['regular', '500', '600'], category: 'sans-serif' },
  { family: 'Raleway', variants: ['regular', '500', '600', '700'], category: 'sans-serif' },
  { family: 'PT Sans', variants: ['regular', '700'], category: 'sans-serif' },
  { family: 'Noto Sans', variants: ['regular', '500', '700'], category: 'sans-serif' },
  { family: 'Quicksand', variants: ['regular', '500', '600', '700'], category: 'sans-serif' },
  { family: 'Josefin Sans', variants: ['regular', '600', '700'], category: 'sans-serif' },
  { family: 'Maven Pro', variants: ['regular', '500', '700'], category: 'sans-serif' },
  { family: 'Exo 2', variants: ['regular', '500', '600', '700'], category: 'sans-serif' },
  { family: 'Barlow', variants: ['regular', '500', '600', '700'], category: 'sans-serif' },
  { family: 'Archivo', variants: ['regular', '500', '600', '700'], category: 'sans-serif' },
  { family: 'Manrope', variants: ['regular', '500', '600', '700'], category: 'sans-serif' },
  { family: 'DM Sans', variants: ['regular', '500', '700'], category: 'sans-serif' },
  { family: 'Figtree', variants: ['regular', '500', '600', '700'], category: 'sans-serif' },
  { family: 'Plus Jakarta Sans', variants: ['regular', '500', '600', '700'], category: 'sans-serif' },
  { family: 'Albert Sans', variants: ['regular', '500', '600', '700'], category: 'sans-serif' },
  { family: 'Onest', variants: ['regular', '500', '600', '700'], category: 'sans-serif' },
  { family: 'Geist Sans', variants: ['regular', '500', '600', '700'], category: 'sans-serif' },
  
  // Serif fonts
  { family: 'Playfair Display', variants: ['regular', '700'], category: 'serif' },
  { family: 'Merriweather', variants: ['regular', '700'], category: 'serif' },
  { family: 'Lora', variants: ['regular', '500', '700'], category: 'serif' },
  { family: 'Source Serif Pro', variants: ['regular', '600', '700'], category: 'serif' },
  { family: 'Crimson Text', variants: ['regular', '600', '700'], category: 'serif' },
  { family: 'Libre Baskerville', variants: ['regular', '700'], category: 'serif' },
  { family: 'Noto Serif', variants: ['regular', '700'], category: 'serif' },
  { family: 'PT Serif', variants: ['regular', '700'], category: 'serif' },
  { family: 'Bitter', variants: ['regular', '700'], category: 'serif' },
  { family: 'Alegreya', variants: ['regular', '500', '700'], category: 'serif' },
  { family: 'Cormorant Garamond', variants: ['regular', '500', '600', '700'], category: 'serif' },
  { family: 'EB Garamond', variants: ['regular', '500', '600', '700'], category: 'serif' },
  { family: 'Fraunces', variants: ['regular', '500', '600', '700'], category: 'serif' },
  { family: 'Inter Tight', variants: ['regular', '500', '600', '700'], category: 'serif' },
  
  // Display fonts
  { family: 'Oswald', variants: ['regular', '500', '600', '700'], category: 'display' },
  { family: 'Bebas Neue', variants: ['regular'], category: 'display' },
  { family: 'Anton', variants: ['regular'], category: 'display' },
  { family: 'Righteous', variants: ['regular'], category: 'display' },
  { family: 'Bungee', variants: ['regular'], category: 'display' },
  { family: 'Bungee Shade', variants: ['regular'], category: 'display' },
  { family: 'Fredoka One', variants: ['regular'], category: 'display' },
  { family: 'Lobster', variants: ['regular'], category: 'display' },
  { family: 'Pacifico', variants: ['regular'], category: 'display' },
  { family: 'Permanent Marker', variants: ['regular'], category: 'display' },
  { family: 'Rock Salt', variants: ['regular'], category: 'display' },
  { family: 'Satisfy', variants: ['regular'], category: 'display' },
  { family: 'Shadows Into Light', variants: ['regular'], category: 'display' },
  { family: 'Special Elite', variants: ['regular'], category: 'display' },
  { family: 'Staatliches', variants: ['regular'], category: 'display' },
  { family: 'Titan One', variants: ['regular'], category: 'display' },
  { family: 'Vampiro One', variants: ['regular'], category: 'display' },
  
  // Handwriting fonts
  { family: 'Dancing Script', variants: ['regular', '700'], category: 'handwriting' },
  { family: 'Caveat', variants: ['regular', '500', '600', '700'], category: 'handwriting' },
  { family: 'Indie Flower', variants: ['regular'], category: 'handwriting' },
  { family: 'Kalam', variants: ['regular', '300', '700'], category: 'handwriting' },
  { family: 'Shadows Into Light Two', variants: ['regular'], category: 'handwriting' },
  { family: 'Architects Daughter', variants: ['regular'], category: 'handwriting' },
  { family: 'Gloria Hallelujah', variants: ['regular'], category: 'handwriting' },
  { family: 'Homemade Apple', variants: ['regular'], category: 'handwriting' },
  { family: 'Kaushan Script', variants: ['regular'], category: 'handwriting' },
  { family: 'Marck Script', variants: ['regular'], category: 'handwriting' },
  { family: 'Patrick Hand', variants: ['regular'], category: 'handwriting' },
  { family: 'Permanent Marker', variants: ['regular'], category: 'handwriting' },
  { family: 'Reenie Beanie', variants: ['regular'], category: 'handwriting' },
  { family: 'Satisfy', variants: ['regular'], category: 'handwriting' },
  { family: 'Yellowtail', variants: ['regular'], category: 'handwriting' },
  
  // Monospace fonts
  { family: 'Roboto Mono', variants: ['regular', '500', '700'], category: 'monospace' },
  { family: 'Source Code Pro', variants: ['regular', '500', '600', '700'], category: 'monospace' },
  { family: 'Fira Code', variants: ['regular', '500', '600', '700'], category: 'monospace' },
  { family: 'JetBrains Mono', variants: ['regular', '500', '600', '700'], category: 'monospace' },
  { family: 'Inconsolata', variants: ['regular', '500', '600', '700'], category: 'monospace' },
  { family: 'Space Mono', variants: ['regular', '700'], category: 'monospace' },
  { family: 'Cousine', variants: ['regular', '700'], category: 'monospace' },
  { family: 'IBM Plex Mono', variants: ['regular', '500', '600', '700'], category: 'monospace' },
  { family: 'Ubuntu Mono', variants: ['regular', '700'], category: 'monospace' },
  { family: 'Anonymous Pro', variants: ['regular', '700'], category: 'monospace' },
  { family: 'Cutive Mono', variants: ['regular'], category: 'monospace' },
  { family: 'Fira Mono', variants: ['regular', '500', '700'], category: 'monospace' },
  { family: 'Major Mono Display', variants: ['regular'], category: 'monospace' },
  { family: 'Nova Mono', variants: ['regular'], category: 'monospace' },
  { family: 'Overpass Mono', variants: ['regular', '500', '600', '700'], category: 'monospace' },
  { family: 'Share Tech Mono', variants: ['regular'], category: 'monospace' },
  { family: 'VT323', variants: ['regular'], category: 'monospace' },
];

// Load a specific font family
export const loadFont = (fontFamily: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (loadedFonts.has(fontFamily)) {
      resolve();
      return;
    }

    WebFont.load({
      google: {
        families: [fontFamily]
      },
      active: () => {
        loadedFonts.add(fontFamily);
        resolve();
      },
      inactive: () => {
        reject(new Error(`Failed to load font: ${fontFamily}`));
      }
    });
  });
};

// Load multiple fonts at once
export const loadFonts = async (fontFamilies: string[]): Promise<void> => {
  const unloadedFonts = fontFamilies.filter(font => !loadedFonts.has(font));
  if (unloadedFonts.length === 0) return;

  return new Promise((resolve, reject) => {
    WebFont.load({
      google: {
        families: unloadedFonts
      },
      active: () => {
        unloadedFonts.forEach(font => loadedFonts.add(font));
        resolve();
      },
      inactive: () => {
        reject(new Error('Failed to load fonts'));
      }
    });
  });
};

// Check if a font is loaded
export const isFontLoaded = (fontFamily: string): boolean => {
  return loadedFonts.has(fontFamily);
};

// Get all loaded fonts
export const getLoadedFonts = (): string[] => {
  return Array.from(loadedFonts);
};

// Preload popular fonts
export const preloadPopularFonts = async (): Promise<void> => {
  const fontFamilies = popularFonts.map(font => font.family);
  await loadFonts(fontFamilies);
};