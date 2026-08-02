import React from 'react';

const DEFAULT_BOARDLY_SVG_PATHS = `
  <rect x="10" y="10" width="80" height="80" rx="18" fill="#0A0A0C" stroke="#D4A94A" stroke-width="1.5" opacity="0.15"/>
  <rect x="25" y="25" width="50" height="50" rx="12" fill="#D4A94A" opacity="0.18"/>
  <text x="50" y="60" font-family="'Space Grotesk', system-ui, sans-serif" font-size="36" font-weight="900" fill="#0A0A0A" text-anchor="middle" opacity="0.9">B</text>
`;

/**
 * Generates an encoded SVG Data URI containing a diagonal repeating watermark tile of the site logo.
 * Supports custom logo URL from site_settings / localStorage or falls back to default Boardly emblem.
 */
export function getWatermarkSvgDataUrl(customLogoUrl?: string | null): string {
  const activeLogo =
    (customLogoUrl !== undefined && customLogoUrl !== null ? customLogoUrl : null) ||
    (typeof window !== 'undefined' ? localStorage.getItem('boardly_logo_url') : null) ||
    '/logo.png';

  const logoTrimmed = activeLogo ? activeLogo.trim() : '/logo.png';

  const logoContent = `<image href="${logoTrimmed}" x="15" y="15" width="70" height="70" preserveAspectRatio="xMidYMid meet" opacity="0.12" />`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <g transform="translate(100, 100) rotate(-32) translate(-50, -50)">
      ${logoContent}
      <text x="50" y="104" text-anchor="middle" fill="#0f172a" font-size="9" font-family="'Inter', -apple-system, sans-serif" font-weight="900" letter-spacing="1.2" opacity="0.12">BOARDLY</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Returns an HTML string representing an absolute background watermark layer.
 * Positioned behind all text content (z-index: 0) and tiled continuously across full document height.
 */
export function getWatermarkHtmlOverlay(customLogoUrl?: string | null): string {
  const dataUrl = getWatermarkSvgDataUrl(customLogoUrl);
  return `
    <div class="boardly-pdf-watermark-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; min-height: 100%; pointer-events: none; z-index: 0; overflow: hidden; background-image: url('${dataUrl}'); background-repeat: repeat; background-size: 180px 180px; background-position: 0 0; opacity: 1;">
    </div>
  `;
}

/**
 * React Component for rendering the repeating diagonal watermark behind printable components.
 */
export const PdfWatermarkOverlay: React.FC<{ customLogoUrl?: string | null }> = ({ customLogoUrl }) => {
  const dataUrl = getWatermarkSvgDataUrl(customLogoUrl);

  return (
    <div
      className="boardly-pdf-watermark-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        minHeight: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        backgroundImage: `url('${dataUrl}')`,
        backgroundRepeat: 'repeat',
        backgroundSize: '180px 180px',
        backgroundPosition: '0 0',
        opacity: 1,
      }}
    />
  );
};
