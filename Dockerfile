FROM node:22.23.2-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY angular.json tsconfig.json tsconfig.app.json .postcssrc.json ./
COPY public ./public
COPY src ./src

RUN npm run build

FROM nginx:1.30.4-alpine AS runtime

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/localnook-ai/browser /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
