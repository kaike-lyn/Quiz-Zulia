import React, { useState, useEffect } from 'react';
import { DEFAULT_FALLBACK_LOGO, fetchServerLogo } from '../utils/photoStorage';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const [logoUrl, setLogoUrl] = useState<string>(() => {
    return localStorage.getItem('jb_custom_logo') || DEFAULT_FALLBACK_LOGO;
  });

  useEffect(() => {
    fetchServerLogo().then((serverLogo) => {
      if (serverLogo) {
        setLogoUrl(serverLogo);
        localStorage.setItem('jb_custom_logo', serverLogo);
      }
    });

    const handleLogoUpdated = () => {
      const stored = localStorage.getItem('jb_custom_logo');
      setLogoUrl(stored || DEFAULT_FALLBACK_LOGO);
    };

    window.addEventListener('jb_logo_updated', handleLogoUpdated);
    return () => window.removeEventListener('jb_logo_updated', handleLogoUpdated);
  }, []);

  const imageSizeClasses = {
    sm: 'h-10 sm:h-12',
    md: 'h-14 sm:h-18',
    lg: 'h-20 sm:h-24',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative overflow-hidden rounded-2xl bg-white p-1 shadow-sm border border-[#F0E0D0] flex items-center justify-center">
        <img
          src={logoUrl}
          alt="Julia Bucchianico Nutricionista CRN 3 - 38059"
          className={`${imageSizeClasses[size]} max-w-[120px] object-contain`}
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget;
            if (logoUrl !== DEFAULT_FALLBACK_LOGO) {
              target.src = DEFAULT_FALLBACK_LOGO;
            }
          }}
        />
      </div>

      <div className="text-left">
        <span className="font-serif-display text-lg sm:text-xl font-bold tracking-tight text-[#713000] block leading-tight">
          Julia Bucchianico
        </span>
        {showSubtitle && (
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#B66C3D] font-bold block font-mono">
            Nutricionista · CRN 3 - 38059
          </span>
        )}
      </div>
    </div>
  );
};
