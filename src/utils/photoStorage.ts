import defaultFallbackPhoto from '../assets/images/julia_photo_1791137403430.jpg';
import defaultFallbackLogo from '../assets/images/julia_logo_1791137415088.jpg';

export const DEFAULT_FALLBACK_PHOTO = defaultFallbackPhoto;
export const DEFAULT_FALLBACK_LOGO = defaultFallbackLogo;

// Photo Helpers
export async function fetchServerPhoto(): Promise<string | null> {
  try {
    const res = await fetch('/api/photo');
    if (!res.ok) return null;
    const data = await res.json();
    return data.photoUrl || null;
  } catch {
    return null;
  }
}

export async function uploadNutricionistaPhoto(dataUrl: string): Promise<boolean> {
  try {
    localStorage.setItem('jb_nutricionista_custom_photo', dataUrl);
    window.dispatchEvent(new Event('jb_photo_updated'));
    
    await fetch('/api/upload-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoData: dataUrl }),
    });
    return true;
  } catch (err) {
    console.error('Error saving photo:', err);
    return false;
  }
}

export async function resetPhotoToDefault(): Promise<void> {
  localStorage.removeItem('jb_nutricionista_custom_photo');
  window.dispatchEvent(new Event('jb_photo_updated'));
  try {
    await fetch('/api/upload-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoData: '' }),
    });
  } catch {}
}

// Logo Helpers
export async function fetchServerLogo(): Promise<string | null> {
  try {
    const res = await fetch('/api/logo');
    if (!res.ok) return null;
    const data = await res.json();
    return data.logoUrl || null;
  } catch {
    return null;
  }
}

export async function uploadNutricionistaLogo(dataUrl: string): Promise<boolean> {
  try {
    localStorage.setItem('jb_custom_logo', dataUrl);
    window.dispatchEvent(new Event('jb_logo_updated'));
    
    await fetch('/api/upload-logo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logoData: dataUrl }),
    });
    return true;
  } catch (err) {
    console.error('Error saving logo:', err);
    return false;
  }
}

export async function resetLogoToDefault(): Promise<void> {
  localStorage.removeItem('jb_custom_logo');
  window.dispatchEvent(new Event('jb_logo_updated'));
  try {
    await fetch('/api/upload-logo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logoData: '' }),
    });
  } catch {}
}
