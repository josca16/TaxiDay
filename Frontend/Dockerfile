# Etapa de build
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install && \
    npm install --save-dev eslint eslint-plugin-react eslint-plugin-react-hooks @babel/eslint-parser tailwindcss@npm:@tailwindcss/postcss7-compat postcss@^7 autoprefixer@^9 postcss-flexbugs-fixes@4.2.1 postcss-preset-env@6.7.0
COPY . .
RUN npx eslint src/**/*.{js,jsx} --fix || true
RUN npm run build

# Etapa de producción
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]