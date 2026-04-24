FROM node:22-bookworm-slim AS deps
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
WORKDIR /app
COPY . .
ARG NEXT_PUBLIC_SERVER_URL
ARG DATABASE_URL
ARG PAYLOAD_SECRET
ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}
RUN pnpm payload generate:types && pnpm build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=8080 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
# Next.js writes the image optimization cache to .next/cache/images.
# Pre-create and chown so the non-root `node` user can persist entries
# across requests within a container's lifetime (x-nextjs-cache: HIT
# instead of MISS, which avoids re-running sharp on every request).
RUN mkdir -p ./.next/cache/images && chown -R node:node ./.next/cache
USER node
EXPOSE 8080
CMD ["node", "server.js"]
