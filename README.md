# cuantocuestaunpiso.es — ¿Puedes permitirte vivir aquí?

Dashboard interactivo que permite a cualquier ciudadano calcular si puede permitirse comprar una vivienda en su comunidad autónoma, provincia o municipio, basado en datos oficiales del INE y el Ministerio de Vivienda.

🔗 **[cuantocuestaunpiso.es](https://www.cuantocuestaunpiso.es)**

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)
![Recharts](https://img.shields.io/badge/Recharts-3-blue)
![INE](https://img.shields.io/badge/Datos-INE.es-red)
![Ministerio](https://img.shields.io/badge/Datos-Ministerio%20Vivienda-orange)

---

## Qué hace

- Calcula la cuota mensual de hipoteca para 70 m² en cada comunidad autónoma, provincia y municipio
- Muestra qué porcentaje del salario neto representa esa cuota
- Clasifica la situación como accesible, difícil acceso o inaccesible
- Muestra la subida acumulada del precio de la vivienda desde el primer trimestre de 2022 con datos reales del INE
- Lista todas las comunidades autónomas ordenadas por precio por m² y años de salario necesarios
- Selector en cascada: comunidad → provincia → municipio

## Fuentes de datos

| Dataset                                  | Fuente                 | Endpoint / URL       |
| ---------------------------------------- | ---------------------- | -------------------- |
| IPV por CCAA — índices trimestrales      | INE                    | `DATOS_TABLA/25171`  |
| Valor tasado por provincia               | Ministerio de Vivienda | `sedal/35101000.XLS` |
| Valor tasado por municipios >25.000 hab. | Ministerio de Vivienda | `sedal/35103500.XLS` |

Los datos del INE se obtienen de la [API JSON del INE](https://www.ine.es/dyngs/DAB/index.htm?cid=1099), pública y sin API key, y se cachean 24 horas en el servidor.

Los datos del Ministerio de Vivienda se procesan con un script Python que descarga los ficheros Excel oficiales y genera ficheros JSON estáticos. La actualización se ejecuta automáticamente cada trimestre mediante GitHub Actions.

La línea **Nacional** del gráfico se calcula como la media aritmética de todas las comunidades autónomas, ya que la tabla 25171 del INE no incluye un agregado nacional directo.

## Stack tecnológico

- **[Next.js 16](https://nextjs.org/)** — App Router, Route Handlers para fetch server-side
- **[Tailwind CSS 4](https://tailwindcss.com/)** — estilos utility-first
- **[Recharts 3](https://recharts.org/)** — gráfico de evolución del IPV
- **[Python 3](https://www.python.org/)** + `xlrd` + `requests` — script de procesamiento de datos del Ministerio
- **[GitHub Actions](https://github.com/features/actions)** — actualización automática de datos cada trimestre
- **[Vercel](https://vercel.com/)** — despliegue y hosting

## Estructura del proyecto

```
cuantocuestaunpiso/
├── .github/
│   └── workflows/
│       └── update-data.yml       # Cron job trimestral de actualización de datos
├── app/
│   ├── api/
│   │   ├── ine/
│   │   │   └── route.js          # Llama al INE, calcula Nacional, rebasea a T1 2022
│   │   └── ministerio/
│   │       └── route.js          # Sirve los JSON de provincias y municipios
│   ├── globals.css               # Importa Tailwind v4
│   ├── layout.js                 # Layout global con Header y metadatos SEO
│   └── page.js                   # Página principal
├── components/
│   ├── Dashboard.js              # Componente principal — estado y cálculos
│   ├── Header.js                 # Cabecera de la app
│   ├── LocationSelector.js       # Selector en cascada CCAA → provincia → municipio
│   ├── MetricCard.js             # Tarjeta de métrica individual
│   ├── PriceChart.js             # Gráfico de evolución IPV (Recharts)
│   └── RegionTable.js            # Tabla comparativa de comunidades
├── public/
│   └── data/
│       ├── provincias.json       # Precios por provincia — generado por el script
│       └── municipios.json       # Precios por municipio — generado por el script
├── scripts/
│   └── process_ministerio.py    # Descarga y procesa los Excel del Ministerio
├── postcss.config.mjs            # Configura @tailwindcss/postcss
└── README.md
```

> **Nota:** Tailwind v4 no usa `tailwind.config.js`. La configuración se gestiona en CSS directamente.

## Cómo ejecutar en local

### Requisitos

- Node.js v18 o superior
- Python 3.9 o superior
- npm

### Instalación

```bash
git clone https://github.com/tu-usuario/cuantocuestaunpiso.git
cd cuantocuestaunpiso
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Build de producción

```bash
npm run build
npm start
```

## Configuración de Tailwind v4

**`app/globals.css`**

```css
@import "tailwindcss";
```

**`postcss.config.mjs`**

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

En v4 ya no existe `tailwind.config.js`. El contenido se detecta automáticamente.

## Actualización automática de datos

Los datos del Ministerio de Vivienda se actualizan automáticamente cada trimestre mediante un workflow de GitHub Actions definido en `.github/workflows/update-data.yml`.

### Cuándo se ejecuta

El Ministerio publica los datos con 6-8 semanas de retraso respecto al fin de cada trimestre. El cron está ajustado a esas fechas reales de publicación:

| Trimestre    | Datos publicados aprox. | Cron ejecuta       |
| ------------ | ----------------------- | ------------------ |
| T4 (oct-dic) | Febrero o marzo         | 1 de enero         |
| T1 (ene-mar) | Mayo o junio            | 1 de abril         |
| T2 (abr-jun) | Agosto o septiembre     | 1 de julio         |
| T3 (jul-sep) | Noviembre o diciembre   | 1 de octubre       |

El cron configurado es `0 8 1 1,4,7,10 *` — día 1 de enero, abril, julio y octubre a las 8:00 UTC.

### Qué hace el workflow

1. Descarga los ficheros Excel del Ministerio de Vivienda
2. Ejecuta `scripts/process_ministerio.py` para extraer el último trimestre disponible
3. Actualiza `public/data/provincias.json` y `public/data/municipios.json`
4. Hace commit y push automático al repositorio
5. Vercel detecta el push y redespliegue automáticamente con los datos nuevos

### Ejecutar manualmente

Si el Ministerio publica los datos antes de lo esperado, puedes lanzar el workflow manualmente desde GitHub → pestaña **Actions** → **Update housing data** → **Run workflow**.

También puedes ejecutarlo en local:

```bash
pip3 install xlrd requests
python3 scripts/process_ministerio.py
```

### Permisos necesarios en GitHub

Para que el workflow pueda hacer commit y push, ve a tu repositorio → **Settings → Actions → General → Workflow permissions** → selecciona **Read and write permissions**.

## Cómo funciona el cálculo de hipoteca

Fórmula estándar de amortización francesa:

```
cuota = principal × (r × (1+r)^n) / ((1+r)^n - 1)
```

- `principal` = precio total × 0,8 (80% financiado, 20% entrada)
- `r` = tipo de interés mensual (3,5% TAE / 12)
- `n` = 360 pagos (30 años)

El porcentaje del salario se calcula sobre el **salario neto** (bruto × 0,72) y se compara con el umbral recomendado del 30%.

## Cómo funciona el gráfico de evolución

Los índices del INE usan base 2015. Para hacer la comparación más intuitiva, se rebasean a T1 2022 = 100 en el servidor antes de enviarse al cliente. Un valor de 134 en T4 2025 significa que los precios han subido un 34% desde el primer trimestre de 2022.

## Cobertura geográfica

- **19 comunidades autónomas** — datos del INE (IPV trimestral)
- **52 provincias** — datos del Ministerio de Vivienda (valor tasado)
- **~120 municipios** de más de 25.000 habitantes — datos del Ministerio de Vivienda

## Despliegue

Cada `git push` a `main` genera un nuevo despliegue automático en Vercel. Esto incluye los pushes automáticos del workflow de GitHub Actions, por lo que los datos se actualizan en producción sin intervención manual.

```bash
git add .
git commit -m "descripción del cambio"
git push
```

## Posibles mejoras

- Datos de alquiler además de compra
- Filtro por superficie personalizada (no solo 70 m²)
- Mapa coroplético de España con color por accesibilidad
- Comparador de dos ubicaciones en el mismo gráfico
- Página individual por comunidad autónoma para SEO (`/madrid`, `/barcelona`...)

## Licencia

MIT — puedes usar, modificar y distribuir este proyecto libremente.

---

Datos del [Instituto Nacional de Estadística](https://www.ine.es) · Licencia [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.es)

Datos del [Ministerio de Vivienda y Agenda Urbana](https://www.mivau.gob.es)
