import type { NextConfig } from 'next';

const config: NextConfig = {
  // Adicione ou mescle esta configuração de 'images' com as suas configurações existentes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/FALTA CRIAR/**',
      },
      {
        protocol: 'https',
        hostname: 'mir-s3-cdn.behance.net',
        port: '',
        pathname: '/**',
      },
      // Você pode adicionar outros domínios aqui no futuro se precisar
    ],
  // Permit extra image quality values used in the codebase (fixes "using quality \"85\" which is not configured" warning)
  qualities: [75, 85],
  },
  // ... outras configurações que você já possa ter no seu arquivo
};

export default config;