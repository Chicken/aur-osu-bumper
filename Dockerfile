FROM node:22-alpine AS builder

ENV CI=true
ENV FORCE_COLOR=true
ENV NODE_ENV="development"

WORKDIR /osu
RUN chown -R node:node /osu
USER node

COPY --chown=node:node .yarn/ .yarn/
COPY --chown=node:node package.json yarn.lock .yarnrc.yml ./

RUN yarn --immutable

COPY --chown=node:node tsconfig.json ./
COPY --chown=node:node src/ src/

RUN yarn build



FROM archlinux:base-devel

ENV CI=true
ENV FORCE_COLOR=true
ENV NODE_ENV="production"

RUN pacman -Syu --noconfirm \
    && pacman -S --noconfirm \
        git \
        openssh \
        pacman-contrib \
        nodejs-lts-jod \
        yarn \
    && pacman -Scc --noconfirm \
    && rm -rf /var/cache/pacman/pkg/* \
    && rm -rf /var/lib/pacman/sync/* \
    && useradd -u 1000 -m osu \
    && mkdir /osu \
    && mkdir /osu/data \
    && chown -R osu:osu /osu

WORKDIR /osu

COPY --chown=osu:osu .yarn/ .yarn/
COPY --chown=osu:osu package.json yarn.lock .yarnrc.yml ./

RUN yarn workspaces focus --all --production

COPY --from=builder --chown=osu:osu /osu/dist/ dist/

USER osu

ENTRYPOINT [ "yarn", "start" ]
