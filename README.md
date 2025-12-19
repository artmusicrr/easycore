# EasyFront

Frontend do sistema de gestão odontológica.

## 🚀 Quick Start

### Com Docker

```bash
# Copiar variáveis de ambiente
cp .env.example .env

# Subir o container
docker compose up -d

# Ver logs
docker compose logs -f

# Parar
docker compose down
```

O frontend estará disponível em: **http://localhost:3001**

### Desenvolvimento Local

```bash
npm install
npm run dev
```

## 📋 Variáveis de Ambiente

- `NEXT_PUBLIC_API_URL`: URL da API do backend (padrão: http://localhost:4003/api)
- `FRONTEND_PORT`: Porta do frontend (padrão: 3001)

## 🔧 Tecnologias

- Next.js 14
- TypeScript
- TailwindCSS
- React Query
- Axios
- React Hook Form
- Zod

## 📦 Build

```bash
# Build local
npm run build

# Build Docker
docker compose build
```
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
