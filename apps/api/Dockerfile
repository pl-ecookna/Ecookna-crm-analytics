FROM node:22-alpine AS base
WORKDIR /repo

RUN apk add --no-cache ca-certificates
RUN corepack enable

COPY package.json pnpm-workspace.yaml turbo.json .npmrc ./
COPY apps/api/package.json apps/api/package.json
COPY apps/api/src ./apps/api/src
COPY apps/api/sql ./apps/api/sql
COPY apps/api/certs ./apps/api/certs
COPY apps/api/README.md ./apps/api/README.md
COPY apps/api/tests ./apps/api/tests

RUN pnpm install --frozen-lockfile=false

RUN cp ./apps/api/certs/russiantrustedca.pem /usr/local/share/ca-certificates/russiantrustedca.crt \
  && update-ca-certificates

ENV NODE_ENV=production
ENV PORT=3000
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/russiantrustedca.crt
EXPOSE 3000

CMD ["pnpm", "--filter", "@ecookna/api", "start"]
