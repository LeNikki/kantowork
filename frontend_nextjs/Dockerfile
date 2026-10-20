FROM node:24-alpine
WORKDIR /app

# pnpm version comes from the "packageManager" field in package.json
RUN corepack enable

# Install deps first so code edits on the host don't invalidate this layer
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install

COPY . .

# next dev defaults to listening on 0.0.0.0
EXPOSE 3000
CMD ["pnpm", "dev"]
