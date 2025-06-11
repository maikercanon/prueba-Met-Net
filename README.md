# 📋 Task Manager - Sistema de Gestión de Tareas

Sistema completo de gestión de tareas desarrollado con **Vue.js 3** y **Node.js**, implementando autenticación JWT, base de datos MongoDB, y sistema de email transaccional para recuperación de contraseñas.

**🌐 Demo Live**: [Frontend](https://prueba-met-net.vercel.app) | [Backend API](https://task-manager-backend-a7fs.onrender.com/api/health)

> ⚠️ **Nota importante**: Esta aplicación utiliza servicios de hosting gratuitos (Render y Vercel). La primera carga puede demorar **30-60 segundos** debido a que los servidores se "despiertan" tras períodos de inactividad. Esto es normal en planes gratuitos.

---

## 🚀 **Características Principales**

- ✅ **Autenticación completa** (registro, login, recuperación de contraseña)
- ✅ **Gestión de tareas** CRUD con persistencia en MongoDB
- ✅ **Sistema de email** universal para reset de contraseñas
- ✅ **Interfaz moderna** con Vue 3 + Tailwind CSS
- ✅ **API RESTful** segura con Node.js + Express
- ✅ **TypeScript** en frontend y backend
- ✅ **Responsive design** optimizado para móviles
- ✅ **Desplegado** en Render + Vercel
- 🐳 **Dockerizado** para desarrollo y producción

---

## 🏗 **Arquitectura del Proyecto**

```
prueba-Met-Net/
├── frontend/           # Vue.js 3 + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/ # Componentes reutilizables
│   │   ├── composables/# Lógica reutilizable (useAuth)
│   │   ├── services/   # API calls
│   │   ├── config/     # Configuración de API
│   │   └── router/     # Configuración de rutas
│   ├── Dockerfile      # Contenedor de producción
│   ├── nginx.conf      # Configuración de Nginx
│   ├── vercel.json     # Configuración de Vercel
│   └── package.json
│
├── backend/            # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/# Lógica de endpoints
│   │   ├── models/     # Esquemas de MongoDB
│   │   ├── middleware/ # Autenticación JWT
│   │   ├── services/   # Email service universal
│   │   └── routes/     # Definición de rutas
│   ├── Dockerfile      # Contenedor de producción
│   ├── render.yaml     # Configuración de Render
│   └── package.json
│
├── scripts/            # Scripts de inicialización
│   └── init-mongo.js   # Setup de MongoDB
├── docker-compose.yml  # Orquestación de contenedores
├── docker-compose.dev.yml # Entorno de desarrollo
├── Makefile           # Comandos Docker simplificados
├── .gitignore         # Archivos a ignorar
├── LICENSE            # Licencia MIT
└── README.md
```

---

## ⚡ **Inicio Rápido**

### **🐳 Opción 1: Docker (Recomendado)**

**Prerrequisitos**: Docker y Docker Compose instalados

```bash
# 1. Clonar el repositorio
git clone https://github.com/maikercanon/prueba-Met-Net.git
cd prueba-Met-Net

# 2. Iniciar con Docker (incluye MongoDB)
make quick-start

# O manualmente:
docker-compose up -d

# 3. Acceder a la aplicación
# Frontend: http://localhost:8080
# Backend: http://localhost:4000
# Usuario demo: demo@taskmanager.local / demo123
```

### **💻 Opción 2: Instalación Local**

**Prerrequisitos**: Node.js 18+, MongoDB 6+, NPM

```bash
# 1. Clonar el repositorio
git clone https://github.com/maikercanon/prueba-Met-Net.git
cd prueba-Met-Net

# 2. Instalar dependencias
cd frontend && npm install
cd ../backend && npm install

# 3. Configurar variables de entorno
# En backend/, crear archivo .env
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=tu_jwt_secret_super_seguro
PORT=4000
FRONTEND_URL=http://localhost:5173

# 4. Iniciar los servidores
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev

# 5. Acceder a la aplicación
# Frontend: http://localhost:5173
# Backend: http://localhost:4000
```

---

## 🐳 **Comandos Docker**

### **Comandos Básicos**
```bash
make help           # Ver todos los comandos disponibles
make quick-start    # Setup completo para primera vez
make up             # Iniciar todos los servicios
make down           # Detener todos los servicios
make logs           # Ver logs en tiempo real
make status         # Estado de contenedores
make health         # Verificar salud de servicios
```

### **Desarrollo**
```bash
make dev            # Entorno desarrollo con hot-reload
make dev-logs       # Logs del entorno de desarrollo
make dev-down       # Detener entorno de desarrollo
```

### **Base de Datos**
```bash
make db-shell       # Abrir shell de MongoDB
make db-backup      # Crear backup de la base de datos
make db-restore BACKUP_DIR=./backup/fecha  # Restaurar backup
```

### **Mantenimiento**
```bash
make clean          # Limpiar contenedores e imágenes
make restart        # Reiniciar todos los servicios
make update         # Actualizar imágenes y reiniciar
```

### **Docker Compose Manual**
```bash
# Producción
docker-compose up -d                    # Iniciar servicios
docker-compose down                     # Detener servicios
docker-compose logs -f                  # Ver logs
docker-compose ps                       # Estado de servicios

# Desarrollo
docker-compose -f docker-compose.dev.yml up -d    # Desarrollo
docker-compose -f docker-compose.dev.yml down     # Detener desarrollo
```

---

## 📝 **Scripts Disponibles**

### **Backend**
```bash
npm run dev        # Desarrollo con hot-reload
npm run build      # Compilar TypeScript a dist/
npm run start      # Producción (desde dist/)
```

### **Frontend**
```bash
npm run dev        # Desarrollo con Vite
npm run build      # Build para producción
npm run preview    # Preview del build
npm run lint       # Linter ESLint
npm run format     # Formatear código con Prettier
```

---

## 🛠 **Decisiones Técnicas**

### **Frontend (Vue.js 3)**
- **Vue 3 Composition API**: Mejor organización y reutilización de código
- **TypeScript**: Tipado estático para mayor robustez
- **Tailwind CSS**: Framework de utilidades para UI rápida y consistente
- **Provide/Inject**: Gestión de estado reactivo sin librerías externas
- **Axios**: Cliente HTTP para comunicación con API
- **Vue Router**: Navegación SPA con guards de autenticación
- **Vite**: Build tool rápido para desarrollo y producción

**Decisión clave**: Se utilizó `provide/inject` en lugar de Pinia/Vuex para cumplir con el requerimiento de no usar librerías de gestión de estado externas.

### **Backend (Node.js)**
- **Express.js**: Framework web minimalista y flexible
- **TypeScript**: Tipado para mayor seguridad y developer experience
- **MongoDB + Mongoose**: Base de datos NoSQL con ODM robusto
- **JWT**: Autenticación stateless y segura
- **bcryptjs**: Hash seguro de contraseñas
- **SendGrid/SMTP**: Sistema de email universal para producción

**Decisión clave**: Sistema de email híbrido que funciona en desarrollo (tokens visibles) y producción (emails reales).

### **Docker (Containerización)**
- **Multi-stage builds**: Optimización de tamaño de imágenes
- **Non-root users**: Mejores prácticas de seguridad
- **Health checks**: Monitoreo automático de servicios
- **Development volumes**: Hot-reload en contenedores
- **Network isolation**: Comunicación segura entre servicios

### **Arquitectura de Despliegue**
```typescript
// Configuración de API adaptativa
const getApiBaseUrl = (): string => {
  if (import.meta.env.DEV) {
    return 'http://localhost:4000/api' // Desarrollo
  }
  return 'https://task-manager-backend-a7fs.onrender.com/api' // Producción
}
```

---

## 📧 **Sistema de Email**

### **Desarrollo**
```bash
# Sin configuración de email
# Los tokens aparecen en la consola del servidor
⚠️ Email service not configured, providing token for development
```

### **Producción**
```bash
# Configurar SendGrid en variables de entorno:
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxx...
EMAIL_FROM=noreply@taskmanager.app
EMAIL_FROM_NAME=Task Manager
```

### **Docker**
```yaml
# En docker-compose.yml
environment:
  EMAIL_PROVIDER: sendgrid
  SENDGRID_API_KEY: SG.your_key_here
  EMAIL_FROM: noreply@taskmanager.local
```

---

## 🗂 **Endpoints de API**

### **Autenticación**
```
POST /api/auth/register      # Registro de usuario
POST /api/auth/login         # Inicio de sesión
GET  /api/auth/profile       # Perfil del usuario
POST /api/auth/forgot-password # Solicitar reset
POST /api/auth/reset-password/:token # Confirmar reset
```

### **Tareas**
```
GET    /api/tasks           # Listar tareas del usuario
POST   /api/tasks           # Crear nueva tarea
PUT    /api/tasks/:id       # Actualizar tarea
DELETE /api/tasks/:id       # Eliminar tarea
```

### **Sistema**
```
GET    /api/health          # Health check para monitoring
```

---

## 🔒 **Seguridad**

- ✅ **Contraseñas hasheadas** con bcrypt (salt rounds: 12)
- ✅ **JWT tokens** con expiración configurable
- ✅ **CORS** configurado para frontend específico
- ✅ **Validación** de datos en backend
- ✅ **Middleware de autenticación** en rutas protegidas
- ✅ **Rate limiting** implementado en reset de contraseñas
- ✅ **Headers de seguridad** en Vercel (XSS, CSRF protection)
- ✅ **Contenedores no-root** para mayor seguridad
- ✅ **Network isolation** en Docker

---

## 🧪 **Testing & Uso**

### **URLs de Producción**
- **Frontend**: https://prueba-met-net.vercel.app
- **Backend**: https://task-manager-backend-a7fs.onrender.com
- **API Health**: https://task-manager-backend-a7fs.onrender.com/api/health

### **URLs de Desarrollo (Docker)**
- **Frontend**: http://localhost:8080
- **Backend**: http://localhost:4000
- **MongoDB**: mongodb://localhost:27017

### **Flujo de Testing**
1. **Registro**: Crear nueva cuenta de usuario
2. **Login**: Iniciar sesión con credenciales
3. **Tareas**: Crear, editar, y eliminar tareas
4. **Reset Password**: Probar recuperación de contraseña
5. **Responsive**: Verificar en diferentes dispositivos

### **Credenciales de Prueba**
```javascript
// Producción - Registra tu propia cuenta
email: "tu-email@gmail.com"
password: "123456" // Mínimo 6 caracteres

// Docker/Desarrollo - Usuario demo incluido
email: "demo@taskmanager.local"
password: "demo123"
```

---

## 🌟 **Características Destacadas**

### **Gestión de Estado Sin Librerías**
```typescript
// useAuth.ts - Composable para autenticación
const authState = reactive({
  user: null as User | null,
  isAuthenticated: false,
  isLoading: false,
  error: null as string | null,
})

// Usando provide/inject en lugar de Pinia/Vuex
provide('auth', authState)
```

### **Sistema Email Universal**
```typescript
// Soporta múltiples proveedores
const emailProviders = {
  sendgrid: 'Producción - 100 emails gratis/día',
  gmail: 'Desarrollo - Gmail personal',
  smtp: 'Cualquier proveedor SMTP'
}
```

### **API Adaptativa**
```typescript
// Se adapta automáticamente entre desarrollo y producción
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:4000/api'
  : 'https://task-manager-backend-a7fs.onrender.com/api'
```

### **Containerización Completa**
```yaml
# docker-compose.yml - Stack completo
services:
  mongodb:    # Base de datos con datos de prueba
  backend:    # API con health checks
  frontend:   # SPA con Nginx optimizado
  nginx:      # Reverse proxy (opcional)
```

---

## 🤝 **Contribuir**

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abrir Pull Request

---

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

## 👨‍💻 **Autor**

**Maiker** - Desarrollador Full Stack
- 📧 Email: [maikersito200109@gmail.com](mailto:maikersito200109@gmail.com)
- 🔗 GitHub: [@maikercanon](https://github.com/maikercanon)
- 🌐 Proyecto: [prueba-Met-Net](https://github.com/maikercanon/prueba-Met-Net)

---

## 🔗 **Enlaces Útiles**

- [Vue.js 3 Documentation](https://vuejs.org/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

## ⭐ **Demo & Repository**

🌐 **Live Demo**: https://prueba-met-net.vercel.app  
📂 **Source Code**: https://github.com/maikercanon/prueba-Met-Net  
🔧 **API Health**: https://task-manager-backend-a7fs.onrender.com/api/health  
🐳 **Docker Hub**: [Próximamente]

---

*Desarrollado con ❤️ usando Vue.js 3 + Node.js + MongoDB + Docker*  
*Desplegado en �� Render + Vercel* 