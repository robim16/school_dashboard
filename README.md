# EduStream AI - Dashboard Escolar del Futuro

![EduStream Logo](https://img.shields.io/badge/EduStream-Smart%20Learning-cyan)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue)

**EduStream AI** es una plataforma de gestión educativa de próxima generación diseñada para escuelas modernas. Ofrece una experiencia fluida potenciada por IA con análisis en tiempo real, seguimiento de asistencia y un sistema de calificación interactivo.

## 🚀 Características Principales

-   **Dashboard de Análisis**: Visualiza el progreso de los estudiantes con gráficos dinámicos (Recharts).
-   **Seguridad de Grado Empresarial**: Control de acceso basado en roles (RBAC) con Supabase Auth y RLS.
-   **Gestión de Calificaciones**: Sistema interactivo para profesores y visualización de progreso para estudiantes.
-   **Actualizaciones en Tiempo Real**: Información siempre al día sin recargas de página.
-   **Interfaz Futurista**: Diseño moderno con efectos de brillo (neon), glassmorphism y animaciones suaves (Framer Motion).

## 🛠️ Stack Tecnológico

-   **Frontend**: [Next.js 14](https://nextjs.org/) (App Router)
-   **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
-   **Base de Datos y Auth**: [Supabase](https://supabase.com/)
-   **Animaciones**: [Framer Motion](https://www.framer.com/motion/)
-   **Componentes de UI**: [Lucide React](https://lucide.dev/), [Sonner](https://sonner.stevenly.me/)
-   **Gráficos**: [Recharts](https://recharts.org/)
-   **Documentación**: [Swagger / OpenAPI](https://swagger.io/)
-   **Testing**: [Vitest](https://vitest.dev/)

## 📥 Instalación y Configuración

Sigue estos pasos para ejecutar el proyecto localmente:

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/tu-usuario/school_dashboard.git
    cd school_dashboard
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**:
    Crea un archivo `.env.local` en el directorio raíz y añade tus credenciales de Supabase:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
    ```

4.  **Ejecutar en Desarrollo**:
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:3000`.

## 🧪 Testing

Para ejecutar los tests unitarios y de integración:
```bash
npm run test
```

## 📖 Documentación de la API

La documentación interactiva de la API (Swagger) está disponible directamente en la aplicación en la ruta:
[http://localhost:3000/docs](http://localhost:3000/docs)

---

Desarrollado con ❤️ para el futuro de la educación.
