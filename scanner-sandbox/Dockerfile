FROM node:22-alpine
WORKDIR /workspace
# Build TypeScript on the host/CI first. This image has no app dependencies or secrets.
COPY --chown=node:node dist/ ./dist/
COPY --chown=node:node package.json ./package.json
COPY --chown=node:node scripts/verify-isolation.mjs ./scripts/verify-isolation.mjs
USER node
CMD ["node", "scripts/verify-isolation.mjs"]
