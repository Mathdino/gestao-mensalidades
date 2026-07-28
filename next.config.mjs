/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Mantém pacotes de servidor (native/pg/prisma/better-auth) fora do bundle
  // do turbopack — evita falha de externalRequire no build da Vercel.
  serverExternalPackages: [
    'pg',
    '@prisma/client',
    '.prisma/client',
    '@prisma/adapter-pg',
    'better-auth',
  ],
}

export default nextConfig
