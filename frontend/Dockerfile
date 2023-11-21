FROM node:18 AS builder
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm cache clean -force
RUN npm install
RUN npm run build

FROM node:18-slim AS runner
ENV TZ Asia/Tokyo
ENV NODE_ENV=production
COPY --from=builder /usr/src/app/next.config.js ./
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/.next/static ./.next/static

COPY --from=builder /usr/src/app/.next/standalone ./
CMD ["node", "server.js"]