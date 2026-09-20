# 🔧 TurnoFlex Autobox - Sistema Inteligente de Gestión de Turnos para Talleres

Plataforma web desarrollada en **React, TypeScript y Tailwind CSS** para la automatización, cálculo de disponibilidad y asignación dinámica de turnos en centros de servicio automotriz y talleres mecánicos.

---

## 📌 Características Principales

- **Motor de Reglas y Disponibilidad (`engine.ts`):** Algoritmo de cálculo de slots de tiempo que valida superposición de turnos, capacidad de bahías de trabajo y duración estimada según el servicio solicitado.
- **Arquitectura Multirrol:**
  - **Portal Cliente (`/cliente`):** Reserva autónoma de turnos, selección de servicios automotrices y confirmación inmediata.
  - **Panel de Staff / Operadores (`/staff`):** Gestión de bahías en tiempo real, cambio de estados (En Espera, En Servicio, Finalizado) y asignación de mecánicos.
  - **Turnero Público (`/turnero`):** Pantalla en tiempo real tipo monitor de sala de espera con el estado de los vehículos en proceso.
- **Tipado Estricto con TypeScript:** Modelos de datos robustos para citas, clientes, vehículos, servicios y estados operativos.
- **Persistencia Reactiva:** Manejo global del estado mediante React Context API y almacenamiento sincronizado con seeds de prueba.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 18, TypeScript, Vite.
- **Estilos:** Tailwind CSS (diseño responsivo y adaptado para pantallas de taller y móviles).
- **Iconografía & UI:** Lucide React.
- **Lógica de Dominio:** TypeScript puro sin librerías pesadas para el motor de asignación horaria.

---

## 🚀 Estructura del Código
```text
TurnoFlex-Autobox/
├── src/
│   ├── lib/
│   │   ├── engine.ts     # Motor de cálculo y validación de turnos y solapamientos
│   │   ├── seed.ts       # Datos iniciales y catálogo de servicios de taller
│   │   ├── store.tsx     # Context Store con reducers/handlers de estado
│   │   └── types.ts      # Definición de interfaces y tipos TypeScript
│   ├── pages/
│   │   ├── Cliente.tsx   # Flujo de reserva para el usuario final
│   │   ├── Public.tsx    # Monitor de turnos en tiempo real
│   │   └── Staff.tsx     # Tablero Kanban / control de bahías de trabajo
│   ├── App.tsx           # Enrutador y control de vistas
│   └── Layout.tsx        # Shell de navegación

---

## 💻 Instalación y Ejecución Local

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm

### Pasos

1. Clonar el repositorio:
git clone [https://github.com/TinchoHub/TurnoFlex-Autobox.git](https://github.com/TinchoHub/TurnoFlex-Autobox.git)
cd TurnoFlex-Autobox

2. Instalar dependencias:
npm install

3. Iniciar el servidor de desarrollo:
npm run dev

Accede a `http://localhost:5173` en tu navegador.

4. Compilar para producción:
npm run build

---

## 👨‍💻 Autor
Desarrollado por **Martín Roige**  
- GitHub: [@TinchoHub](https://github.com/TinchoHub)