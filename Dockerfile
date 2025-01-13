FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# Install dependencies and build
FROM base AS builder
RUN npm install
COPY . .
RUN npm run build

# Production image
FROM base AS runner
RUN npm install --production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
EXPOSE 3000
CMD ["npm", "start"] 