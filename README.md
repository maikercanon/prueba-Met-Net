# 📋 Task Manager - Sistema de Gestión de Tareas

Sistema completo de gestión de tareas desarrollado con **Vue.js 3** y **Node.js**, implementando autenticación JWT, base de datos MongoDB, y sistema de email transaccional para recuperación de contraseñas.

**🌐 Demo Live**: [Frontend](https://prueba-met-net.vercel.app) | [Backend API](https://task-manager-backend-a7fs.onrender.com/api/health)

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
git clone https://github.com/maikercanon/prueba-Met-Net.git
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

# Opcional - Para habilitar emails
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.tu_api_key
EMAIL_FROM=tu-email@gmail.com
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

---

## 🧪 **Testing & Uso**

### **URLs de Producción**
- **Frontend**: https://prueba-met-net.vercel.app
- **Backend**: https://task-manager-backend-a7fs.onrender.com
- **API Health**: https://task-manager-backend-a7fs.onrender.com/api/health

### **Flujo de Testing**
1. **Registro**: Crear nueva cuenta de usuario
2. **Login**: Iniciar sesión con credenciales
3. **Tareas**: Crear, editar, y eliminar tareas
4. **Reset Password**: Probar recuperación de contraseña
5. **Responsive**: Verificar en diferentes dispositivos

### **Credenciales de Prueba**
Puedes crear tu propia cuenta o usar:
```javascript
// Registra tu propia cuenta para testing
email: "tu-email@gmail.com"
password: "123456" // Mínimo 6 caracteres
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
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

## ⭐ **Demo & Repository**

🌐 **Live Demo**: https://prueba-met-net.vercel.app  
📂 **Source Code**: https://github.com/maikercanon/prueba-Met-Net  
🔧 **API Health**: https://task-manager-backend-a7fs.onrender.com/api/health  

---

*Desarrollado con ❤️ usando Vue.js 3 + Node.js + MongoDB*  
*Desplegado en �� Render + Vercel* 