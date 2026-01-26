import type { NextConfig } from 'next';

const config: NextConfig = {
  // Adicione ou mescle esta configuração de 'images' com as suas configurações existentes
  images: {
    qualities: [75, 85],
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
        pathname: '/SimulaVest-organization/SimulaVest-Docs/**',
      },
      {
        protocol: 'https',
        hostname: 'mir-s3-cdn.behance.net',
        port: '',
        pathname: '/**',
      },
      // Você pode adicionar outros domínios aqui no futuro se precisar
    ],
  },
  // ... outras configurações que você já possa ter no seu arquivo
};

export default config;