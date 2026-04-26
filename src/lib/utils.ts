import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const safeFormatDate = (dateStr: any, formatStr: string = 'dd MMM yyyy') => {
  if (!dateStr) return 'Date inconnue';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
    return format(date, formatStr, { locale: fr });
  } catch (e) {
    console.error("Format date error:", e, dateStr);
    return 'Format invalide';
  }
};

export function optimizeImage(url: string | undefined, width: number = 800, fit: 'crop' | 'contain' | 'max' = 'crop') {
  if (!url) return '';
  if (url.includes('unsplash.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('q', '75');
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('fit', fit);
      if (fit === 'crop') {
        urlObj.searchParams.set('crop', 'faces,focalpoint');
      } else {
        urlObj.searchParams.delete('crop');
      }
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  }
  return url;
}

export function getYoutubeId(url: string | undefined) {
  if (!url) return null;
  // Robust regex for various YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  
  const id = (match && match[2].length === 11) ? match[2] : null;
  
  // If not matched by regex, try to see if it's just the ID
  if (!id && url.length === 11 && !url.includes('/') && !url.includes('.')) {
    return url;
  }
  
  return id;
}
