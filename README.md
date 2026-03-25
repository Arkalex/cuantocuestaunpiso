# Spain Housing Affordability — Accesibilidad a la vivienda en España

Dashboard interactivo que permite a cualquier ciudadano calcular si puede permitirse comprar una vivienda en su comunidad autónoma, basado en datos oficiales del INE.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)
![Recharts](https://img.shields.io/badge/Recharts-2-blue)
![Datos](https://img.shields.io/badge/Datos-INE.es-red)

---

## Qué hace

- Calcula la cuota mensual de hipoteca para 70 m² en cada comunidad autónoma
- Muestra qué porcentaje del salario neto representa esa cuota
- Clasifica la situación como accesible, difícil acceso o inaccesible
- Compara la evolución del Índice de Precios de Vivienda (IPV) desde 2022
- Lista todas las comunidades autónomas ordenadas por precio por m²

## Fuentes de datos

| Dataset                             | Fuente | Endpoint            |
| ----------------------------------- | ------ | ------------------- |
| Índice de Precios de Vivienda (IPV) | INE    | `DATOS_TABLA/59194` |
| Encuesta de Estructura Salarial     | INE    | `DATOS_TABLA/28196` |

Los datos se obtienen de la [API JSON del INE](https://www.ine.es/dyngs/DAB/index.htm?cid=1099), que es pública y no requiere API key. Se cachean durante 24 horas en el servidor (`revalidate: 86400`), ya que el INE actualiza sus datos trimestralmente.

## Stack tecnológico

- **[Next.js 15](https://nextjs.org/)** — framework React con App Router y Route Handlers para el fetch server-side
- **[Tailwind CSS 3](https://tailwindcss.com/)** — estilos utility-first
- **[Recharts](https://recharts.org/)** — gráfico de evolución del IPV
- **[Vercel](https://vercel.com/)** — despliegue y hosting

## Estructura del proyecto

```
vivienda-ine/
├── app/
│   ├── api/
│   │   └── ine/
│   │       └── route.js        # Route Handler — llama a la API del INE
│   ├── globals.css
│   ├── layout.js               # Layout global con Header
│   └── page.js                 # Página principal
├── components/
│   ├── Dashboard.js            # Componente principal — estado y cálculos
│   ├── Header.js               # Cabecera de la app
│   ├── MetricCard.js           # Tarjeta de métrica individual
│   ├── PriceChart.js           # Gráfico de evolución IPV (Recharts)
│   └── RegionTable.js          # Tabla comparativa de comunidades
├── tailwind.config.js
└── README.md
```

## Cómo ejecutar en local

### Requisitos

- Node.js v18 o superior
- npm

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/vivienda-ine.git
cd vivienda-ine

# Instalar dependencias
npm install

# Arrancar el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

### Build de producción

```bash
npm run build
npm start
```

## Cómo funciona el cálculo

La cuota mensual de hipoteca se calcula con la fórmula estándar de amortización francesa:

```
cuota = principal × (r × (1+r)^n) / ((1+r)^n - 1)
```

Donde:

- `principal` = precio total de la vivienda × 0,8 (80% financiado, 20% entrada)
- `r` = tipo de interés mensual (3,5% TAE / 12)
- `n` = número de pagos (360 meses = 30 años)

El porcentaje del salario se calcula sobre el **salario neto** (bruto × 0,72) y se compara con el umbral recomendado del 30%.

## Despliegue

El proyecto está configurado para desplegarse en Vercel con cero configuración. Cada `git push` a `main` genera un nuevo despliegue automático.

```bash
git add .
git commit -m "descripción del cambio"
git push
```

## Posibles mejoras

- Conectar el gráfico a los datos reales de la API del INE en tiempo real
- Añadir datos de alquiler además de compra
- Filtro por número de habitaciones o superficie personalizada
- Mapa coroplético de España con color por accesibilidad
- Comparador de dos comunidades en el mismo gráfico

## Licencia

MIT — puedes usar, modificar y distribuir este proyecto libremente.

---

Datos oficiales del [Instituto Nacional de Estadística](https://www.ine.es) · Licencia [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.es)
