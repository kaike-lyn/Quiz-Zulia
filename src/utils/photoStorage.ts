import defaultFallbackPhoto from '../assets/images/julia_photo_real.jpg';
import defaultFallbackLogo from '../assets/images/julia_logo_real.jpg';
import {
  fetchIdentityFromFirestore,
  saveIdentityToFirestore
} from '../firebase/firestoreService';

export const DEFAULT_FALLBACK_PHOTO = defaultFallbackPhoto;
export const DEFAULT_FALLBACK_LOGO = defaultFallbackLogo;

// Photo Helpers
export async function fetchServerPhoto(): Promise<string | null> {
  // 1. Try Firebase Firestore
  try {
    const identity = await fetchIdentityFromFirestore();
    if (identity?.photoUrl) {
      localStorage.setItem('jb_nutricionista_custom_photo', identity.photoUrl);
      return identity.photoUrl;
    }
  } catch {}

  // 2. Try backend API
  try {
    const res = await fetch('/api/photo');
    if (res.ok) {
      const data = await res.json();
      return data.photoUrl || null;
    }
  } catch {}

  return null;
}

export async function uploadNutricionistaPhoto(dataUrl: string): Promise<boolean> {
  try {
    localStorage.setItem('jb_nutricionista_custom_photo', dataUrl);
    window.dispatchEvent(new Event('jb_photo_updated'));
    
    // Save to Firestore
    saveIdentityToFirestore(dataUrl, undefined).catch(() => {});

    // Save to backend API
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
  saveIdentityToFirestore('', undefined).catch(() => {});
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
  // 1. Try Firebase Firestore
  try {
    const identity = await fetchIdentityFromFirestore();
    if (identity?.logoUrl) {
      localStorage.setItem('jb_custom_logo', identity.logoUrl);
      return identity.logoUrl;
    }
  } catch {}

  // 2. Try backend API
  try {
    const res = await fetch('/api/logo');
    if (res.ok) {
      const data = await res.json();
      return data.logoUrl || null;
    }
  } catch {}

  return null;
}

export async function uploadNutricionistaLogo(dataUrl: string): Promise<boolean> {
  try {
    localStorage.setItem('jb_custom_logo', dataUrl);
    window.dispatchEvent(new Event('jb_logo_updated'));

    // Save to Firestore
    saveIdentityToFirestore(undefined, dataUrl).catch(() => {});

    // Save to backend API
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
  saveIdentityToFirestore(undefined, '').catch(() => {});
  try {
    await fetch('/api/upload-logo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logoData: '' }),
    });
  } catch {}
}
