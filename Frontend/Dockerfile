# Etapa de build
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install && \
    npm install --save-dev eslint eslint-plugin-react eslint-plugin-react-hooks @babel/eslint-parser
COPY . .
RUN npx eslint src/**/*.{js,jsx} --fix || true
RUN npm run build

# Etapa de producción
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]