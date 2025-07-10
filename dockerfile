# === DEPENDENCIES===
FROM node:alpine AS deps

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

# === BUILDER ===
FROM node:alpine AS builder

WORKDIR /usr/src/app

COPY --from=deps /usr/src/app/node_modules ./node_modules

COPY . .

RUN npm run build

RUN npm ci -f --only=production && npm cache clean --force

# === RUNNER ===
FROM node:alpine AS runner

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules

COPY --from=builder /usr/src/app/dist ./dist

ENV NODE_ENV=production

USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]