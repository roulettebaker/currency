import React from 'react';

interface CryptoIconProps {
  size?: number;
  className?: string;
}

export const BitcoinIcon: React.FC<CryptoIconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <circle cx="16" cy="16" r="16" fill="#F7931A"/>
    <path
      d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z"
      fill="white"
    />
  </svg>
);

export const EthereumIcon: React.FC<CryptoIconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <circle cx="16" cy="16" r="16" fill="#627EEA"/>
    <path
      d="M16.498 4v8.87l7.497 3.35L16.498 4z"
      fill="white"
      fillOpacity="0.602"
    />
    <path d="M16.498 4L9 16.22l7.498-3.35V4z" fill="white"/>
    <path
      d="M16.498 21.968v6.027L24 17.616l-7.502 4.352z"
      fill="white"
      fillOpacity="0.602"
    />
    <path d="M16.498 27.995v-6.028L9 17.616l7.498 10.38z" fill="white"/>
    <path
      d="M16.498 20.573l7.497-4.353-7.497-3.348v7.701z"
      fill="white"
      fillOpacity="0.2"
    />
    <path d="M9 16.22l7.498 4.353v-7.701L9 16.22z" fill="white" fillOpacity="0.602"/>
  </svg>
);

export const BNBIcon: React.FC<CryptoIconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <circle cx="16" cy="16" r="16" fill="#F3BA2F"/>
    <path
      d="M12.116 14.404L16 10.52l3.886 3.886 2.26-2.26L16 6l-6.144 6.144 2.26 2.26zM6 16l2.26-2.26L10.52 16l-2.26 2.26L6 16zm6.116 1.596L16 21.48l3.886-3.886 2.26 2.26L16 26l-6.144-6.144-2.26-2.26zm13.884-1.596L23.74 13.74 21.48 16l2.26 2.26L26 16zM16 13.741l2.26 2.26L16 18.259l-2.26-2.258L16 13.741z"
      fill="white"
    />
  </svg>
);

export const PolygonIcon: React.FC<CryptoIconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <circle cx="16" cy="16" r="16" fill="#8247E5"/>
    <path
      d="M21.092 12.693c-.369-.215-.848-.215-1.254 0l-2.879 1.654-1.955 1.078-2.879 1.654c-.369.215-.848.215-1.254 0l-2.288-1.078c-.369-.215-.627-.646-.627-1.108V12.23c0-.431.221-.862.627-1.108l2.25-1.293c.369-.215.848-.215 1.254 0l2.25 1.293c.369.215.627.646.627 1.108v1.654l1.955-1.078v-1.692c0-.431-.221-.862-.627-1.108L12.238 7.385c-.369-.215-.848-.215-1.254 0l-4.15 2.431c-.369.246-.627.677-.627 1.108v4.862c0 .431.221.862.627 1.108l4.15 2.4c.369.215.848.215 1.254 0l2.879-1.623 1.955-1.108 2.879-1.623c.369-.215.848-.215 1.254 0l2.25 1.293c.369.215.627.646.627 1.108v2.662c0 .431-.221.862-.627 1.108l-2.25 1.293c-.369.215-.848.215-1.254 0l-2.25-1.293c-.369-.215-.627-.646-.627-1.108v-1.654l-1.955 1.108v1.692c0 .431.221.862.627 1.108l4.15 2.4c.369.215.848.215 1.254 0l4.15-2.4c.369-.246.627-.677.627-1.108v-4.862c0-.431-.221-.862-.627-1.108l-4.212-2.431z"
      fill="white"
    />
  </svg>
);

export const TronIcon: React.FC<CryptoIconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <circle cx="16" cy="16" r="16" fill="#FF060A"/>
    <path
      d="M21.6 7.2L7.2 9.6l7.2 14.4 10.8-7.2-3.6-9.6zm-1.2 2.4l2.4 6L16.8 18l-4.8-9.6 8.4-.8z"
      fill="white"
    />
  </svg>
);

export const USDCIcon: React.FC<CryptoIconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <circle cx="16" cy="16" r="16" fill="#2775CA"/>
    <path
      d="M15.75 27.5c6.213 0 11.25-5.037 11.25-11.25S21.963 4.75 15.75 4.75 4.5 9.787 4.5 16s5.037 11.25 11.25 11.25z"
      fill="white"
    />
    <path
      d="M15.75 25.5c5.108 0 9.25-4.142 9.25-9.25S20.858 6.75 15.75 6.75 6.5 10.892 6.5 16s4.142 9.25 9.25 9.25z"
      fill="#2775CA"
    />
    <path
      d="M17.875 12.625v-1.5h-1.25v1.5h-.875c-1.036 0-1.875.839-1.875 1.875s.839 1.875 1.875 1.875h1.25c.345 0 .625.28.625.625s-.28.625-.625.625h-2.5v1.25h2.5c1.036 0 1.875-.839 1.875-1.875s-.839-1.875-1.875-1.875H15.5c-.345 0-.625-.28-.625-.625s.28-.625.625-.625h2.375v-1.25zm-1.25 8.75v1.5h1.25v-1.5h-1.25z"
      fill="white"
    />
  </svg>
);

export const USDTIcon: React.FC<CryptoIconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <circle cx="16" cy="16" r="16" fill="#26A17B"/>
    <path
      d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657zm0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117z"
      fill="white"
    />
  </svg>
);

// Utility function to get the appropriate icon component
export const getCryptoIcon = (cryptoId: string, size: number = 24, className: string = "") => {
  switch (cryptoId) {
    case 'btc':
      return <BitcoinIcon size={size} className={className} />;
    case 'eth':
      return <EthereumIcon size={size} className={className} />;
    case 'bnb':
      return <BNBIcon size={size} className={className} />;
    case 'pol':
      return <PolygonIcon size={size} className={className} />;
    case 'trx':
      return <TronIcon size={size} className={className} />;
    case 'usdc':
      return <USDCIcon size={size} className={className} />;
    case 'usdt':
      return <USDTIcon size={size} className={className} />;
    default:
      return <div className={`w-${size/4} h-${size/4} bg-gray-400 rounded-full`} />;
  }
};
