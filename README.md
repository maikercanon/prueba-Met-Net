# 📋 Task Manager - Sistema de Gestión de Tareas

Sistema completo de gestión de tareas desarrollado con **Vue.js 3** y **Node.js**, implementando autenticación JWT, base de datos MongoDB, y sistema de email transaccional para recuperación de contraseñas.

**🌐 Demo Live**: [Frontend](https://your-app.vercel.app) | [Backend API](https://your-backend.onrender.com/api/health)

---

## 🚀 **Características Principales**

- ✅ **Autenticación completa** (registro, login, recuperación de contraseña)
- ✅ **Gestión de tareas** CRUD con persistencia en MongoDB
- ✅ **Sistema de email** universal para reset de contraseñas
- ✅ **Interfaz moderna** con Vue 3 + Tailwind CSS
- ✅ **API RESTful** segura con Node.js + Express
- ✅ **TypeScript** en frontend y backend
- ✅ **Responsive design** optimizado para móviles
- ✅ **Deploy automático** en Render + Vercel

---

## 🏗 **Arquitectura del Proyecto**

```
prueba-Met-Net/
├── frontend/           # Vue.js 3 + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/ # Componentes reutilizables
│   │   ├── views/      # Páginas principales
│   │   ├── composables/# Lógica reutilizable (useAuth)
│   │   ├── services/   # API calls
│   │   ├── config/     # Configuración de API
│   │   └── router/     # Configuración de rutas
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
│   ├── render.yaml     # Configuración de Render
│   └── package.json
│
├── .gitignore          # Archivos a ignorar
├── LICENSE             # Licencia MIT
└── README.md
```

---

## ⚡ **Inicio Rápido**

### **Prerrequisitos**
- Node.js 18+ instalado
- MongoDB 6+ ejecutándose localmente
- NPM o Yarn

### **1. Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/prueba-Met-Net.git
cd prueba-Met-Net
```

### **2. Instalar dependencias**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### **3. Configurar variables de entorno**
```bash
# En backend/, crear archivo .env
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=tu_jwt_secret_super_seguro
PORT=4000
FRONTEND_URL=http://localhost:5173
```

### **4. Iniciar los servidores**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### **5. Acceder a la aplicación**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/api/health

---

## 🌐 **Despliegue en Producción**

### **🔧 Backend en Render**

1. **Preparar el repositorio**:
   ```bash
   git add .
   git commit -m "Deploy: Prepare for production"
   git push origin main
   ```

2. **Crear servicio en Render**:
   - Ve a [render.com](https://render.com)
   - Crea nuevo **Web Service**
   - Conecta tu repositorio de GitHub
   - Selecciona la carpeta `backend`

3. **Configurar variables de entorno**:
   ```env
   NODE_ENV=production
   PORT=4000
   MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/taskmanager
   JWT_SECRET=jwt_super_seguro_para_produccion
   FRONTEND_URL=https://tu-app.vercel.app
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.tu_api_key_real
   EMAIL_FROM=noreply@tudominio.com
   ```

4. **Deploy automático**:
   - Render detecta `render.yaml` automáticamente
   - Build: `npm install && npm run build`
   - Start: `npm start`

### **⚡ Frontend en Vercel**

1. **Conectar repositorio**:
   - Ve a [vercel.com](https://vercel.com)
   - **Import Project** desde GitHub
   - Selecciona la carpeta `frontend`

2. **Configurar variables de entorno**:
   ```env
   VITE_API_URL=https://tu-backend.onrender.com/api
   ```

3. **Deploy automático**:
   - Vercel detecta `vercel.json` automáticamente
   - Build: `npm run build`
   - Output: `dist/`

### **🔗 Conectar Frontend y Backend**

1. **Obtener URL del backend** (Render):
   ```
   https://task-manager-backend-abcd.onrender.com
   ```

2. **Configurar en Vercel**:
   ```env
   VITE_API_URL=https://task-manager-backend-abcd.onrender.com/api
   ```

3. **Actualizar CORS en backend**:
   ```env
   FRONTEND_URL=https://task-manager-frontend-xyz.vercel.app
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

### **Arquitectura de Despliegue**
```typescript
// Configuración de API adaptativa
const getApiBaseUrl = (): string => {
  if (import.meta.env.DEV) {
    return 'http://localhost:4000/api' // Desarrollo
  }
  return import.meta.env.VITE_API_URL || 'production-url' // Producción
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
# Configurar SendGrid
node setup-sendgrid.js

# O manualmente en .env:
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxx...
EMAIL_FROM=noreply@tudominio.com
```

---

## 🗂 **Endpoints de API**

### **Autenticación**
```
POST /api/auth/register      # Registro de usuario
POST /api/auth/login         # Inicio de sesión
GET  /api/auth/profile       # Perfil del usuario
POST /api/auth/forgot-password # Solicitar reset
POST /api/auth/reset-password  # Confirmar reset
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

---

## 🧪 **Testing**

### **Credenciales de Prueba**
```javascript
// Usuario de prueba
email: "test@example.com"
password: "123456"
```

### **Flujo de Testing**
1. Registrar nuevo usuario
2. Iniciar sesión
3. Crear/editar/eliminar tareas
4. Probar "Olvidé mi contraseña"
5. Usar token de desarrollo para reset

### **Health Checks**
- **Backend**: `GET /api/health`
- **Frontend**: Acceder a la URL principal

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

---

## 🔗 **Enlaces Útiles**

- [Vue.js 3 Documentation](https://vuejs.org/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

*Desarrollado con ❤️ usando Vue.js 3 + Node.js + MongoDB*
*Desplegado en �� Render + Vercel* 