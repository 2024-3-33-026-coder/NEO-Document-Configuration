import React, { useState } from 'react';

interface NeoTransportNavbarLogoProps {
  className?: string;
  showSubtitle?: boolean;
}

export const NeoTransportNavbarLogo: React.FC<NeoTransportNavbarLogoProps> = ({
  className = '',
  showSubtitle = true,
}) => {
  const [imgError, setImgError] = useState(false);
  const logoUrl = "https://admin.neotransport.co.uk/brand/logos/neo-transport-full-blue-white.svg";

  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {/* Official Neo Transport SVG Logo requested by user */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-3">
          <img
            src={imgError ? "/neo-transport-full-blue-white.svg" : logoUrl}
            alt="Neo Transport"
            className="h-8 sm:h-9 w-auto max-w-[240px] sm:max-w-[280px] object-contain filter drop-shadow-[0_2px_8px_rgba(56,152,236,0.3)] transition-transform duration-200 hover:scale-[1.01]"
            onError={() => {
              if (!imgError) setImgError(true);
            }}
          />
          <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 uppercase tracking-wider">
            FLEET OPS
          </span>
        </div>
        {showSubtitle && (
          <p className="text-[11px] text-slate-400 font-medium tracking-normal mt-0.5 hidden md:block">
            Collection Note Editor &amp; Automated Dispatch Document Processor
          </p>
        )}
      </div>
    </div>
  );
};
