# Etapa de construcción
FROM node:16-alpine AS build-stage

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código fuente
COPY . .

# Construye la aplicación para producción
RUN npm run build

# Etapa de producción
FROM nginx:stable-alpine AS production-stage

# Copia los archivos compilados al directorio de Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expone el puerto 80
EXPOSE 80

# Comando para ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]
