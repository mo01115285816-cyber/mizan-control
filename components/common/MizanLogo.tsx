'use client';

import React from 'react';
import Image from 'next/image';

interface MizanLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export default function MizanLogo({ size = 'md', showSubtitle = true }: MizanLogoProps) {
  const imgSizes = {
    sm: { w: 32, h: 32, text: 'text-lg', badge: 'text-[9px]' },
    md: { w: 44, h: 44, text: 'text-2xl', badge: 'text-[10px]' },
    lg: { w: 56, h: 56, text: 'text-3xl', badge: 'text-xs' },
    xl: { w: 72, h: 72, text: 'text-4xl', badge: 'text-xs' },
  };

  const config = imgSizes[size];

  return (
    <div className="flex items-center gap-3 select-none" id="mizan-brand-logo">
      {/* Official Mizan Logo - completely transparent without inner box or circle borders */}
      <div className="relative shrink-0 flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="MIZAN Logo"
          width={config.w}
          height={config.h}
          priority
          className="object-contain"
        />
      </div>

      <div className="flex flex-col text-right">
        <div className="flex items-center gap-2">
          <span className={`font-black tracking-tight text-[#151515] font-sans ${config.text}`}>
            MIZAN
          </span>
          <span className={`font-mono font-black tracking-widest text-[#151515] uppercase bg-[#C8F24A] px-2.5 py-0.5 rounded-full ${config.badge}`}>
            CONTROL
          </span>
        </div>
        {showSubtitle && (
          <span className="text-xs text-[#777A72] font-semibold leading-none mt-1">
            Home Internet & Bandwidth Management
          </span>
        )}
      </div>
    </div>
  );
}
