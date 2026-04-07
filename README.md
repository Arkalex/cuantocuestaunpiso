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
- Muestra qué porcentaje del salario neto representa esa cuota, usando el salario medio real de cada CCAA (INE, EAES)
- Clasifica la situación como accesible, difícil acceso o inaccesible
- Muestra la subida acumulada del precio de la vivienda desde el primer trimestre de 2022 con datos reales del INE
- Lista todas las comunidades autónomas ordenadas por precio por m² y años de salario necesarios
- Selector en cascada: comunidad → provincia → municipio
- Sincroniza el estado con la URL (`?ccaa=Madrid&provincia=Madrid&salary=35000&type=resale`) para compartir o enlazar directamente
- Control de salario con slider (12.000–150.000 €) e input numérico sincronizados
- Badge con el trimestre de los datos activos (p. ej. `T4 2025`)
- Páginas individuales por comunidad autónoma (`/madrid`, `/castilla-la-mancha`…) para SEO

## Fuentes de datos

| Dataset | Fuente | Endpoint / referencia |
| ---------------------------------------- | ---------------------- | -------------------------- |
| IPV por CCAA — índices trimestrales | INE | `DATOS_TABLA/25171` |
| Salario medio por CCAA (EAES 2023) | INE | `DATOS_TABLA/28191` |
| Valor tasado por provincia | Ministerio de Vivienda | `sedal/35101000.XLS` |
| Valor tasado por municipios >25.000 hab. | Ministerio de Vivienda | `sedal/35103500.XLS` |

Los datos del INE se obtienen de la [API JSON del INE](https://www.ine.es/dyngs/DAB/index.htm?cid=1099), pública y sin API key.

- Los datos de IPV se cachean 24 horas en el servidor (Route Handler).
- Los salarios medios por CCAA (tabla 28191, EAES) se descargan en el script trimestral y se guardan como JSON estático. Ceuta y Melilla no están en la EAES; usan la media nacional como fallback.

Los datos del Ministerio de Vivienda se procesan con un script Python que descarga los ficheros Excel oficiales y genera ficheros JSON estáticos. La actualización se ejecuta automáticamente cada trimestre mediante GitHub Actions.

La línea **Nacional** del gráfico IPV se calcula como la media aritmética de todas las comunidades autónomas, ya que la tabla 25171 no incluye un agregado nacional directo.

## Stack tecnológico

- **[Next.js 16](https://nextjs.org/)** — App Router, Route Handlers para fetch server-side, `next/og` para imagen OpenGraph dinámica
- **[Tailwind CSS 4](https://tailwindcss.com/)** — estilos utility-first
- **[Recharts 3](https://recharts.org/)** — gráfico de evolución del IPV
- **[Python 3](https://www.python.org/)** + `xlrd` + `requests` — script de procesamiento de datos del Ministerio e INE
- **[GitHub Actions](https://github.com/features/actions)** — actualización automática de datos cada trimestre
- **[Vercel](https://vercel.com/)** — despliegue y hosting

## Estructura del proyecto

```
cuantocuestaunpiso/
├── .github/
│   └── workflows/
│       └── update-data.yml       # Cron job trimestral de actualización de datos
├── app/
│   ├── [ccaa]/
│   │   └── page.js               # 19 páginas SSG por CCAA — redirigen a /?ccaa=X
│   ├── api/
│   │   ├── ine/
│   │   │   └── route.js          # Llama al INE, calcula Nacional, rebasea a T1 2022
│   │   └── ministerio/
│   │       └── route.js          # Sirve provincias, municipios, salarios y dataQuarter
│   ├── globals.css               # Importa Tailwind v4
│   ├── layout.js                 # Layout global con Header, metadatos SEO y metadataBase
│   ├── opengraph-image.js        # Imagen OG dinámica (next/og, 1200×630, edge runtime)
│   ├── page.js                   # Página principal
│   └── sitemap.js                # Sitemap con homepage + 19 URLs de CCAA
├── components/
│   ├── Dashboard.js              # Componente principal — estado, cálculos, URL params
│   ├── Header.js                 # Cabecera de la app
│   ├── LocationSelector.js       # Selector en cascada CCAA → provincia → municipio
│   ├── MetricCard.js             # Tarjeta de métrica individual
│   ├── PriceChart.js             # Gráfico de evolución IPV (Recharts)
│   └── RegionTable.js            # Tabla comparativa de comunidades
├── lib/
│   └── calculateMetrics.js       # Lógica de cálculo de hipoteca y constantes compartidas
├── public/
│   └── data/
│       ├── municipios.json       # Precios por municipio — generado por el script
│       ├── provincias.json       # Precios por provincia — generado por el script
│       └── salarios.json         # Salario medio por CCAA + dataQuarter — generado por el script
├── scripts/
│   └── process_ministerio.py    # Descarga Excel del Ministerio y salarios INE, genera JSON
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
git clone https://github.com/Arkalex/cuantocuestaunpiso.git
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

Los datos se actualizan automáticamente cada trimestre mediante un workflow de GitHub Actions definido en `.github/workflows/update-data.yml`.

### Cuándo se ejecuta

El Ministerio publica los datos con 6-8 semanas de retraso respecto al fin de cada trimestre. El cron está ajustado a esas fechas reales de publicación:

| Trimestre    | Datos publicados aprox. | Cron ejecuta   |
| ------------ | ----------------------- | -------------- |
| T4 (oct-dic) | Febrero o marzo         | 1 de enero     |
| T1 (ene-mar) | Mayo o junio            | 1 de abril     |
| T2 (abr-jun) | Agosto o septiembre     | 1 de julio     |
| T3 (jul-sep) | Noviembre o diciembre   | 1 de octubre   |

El cron configurado es `0 8 1 1,4,7,10 *` — día 1 de enero, abril, julio y octubre a las 8:00 UTC.

### Qué hace el workflow

1. Configura Node.js y ejecuta `npm ci`, tests y lint para verificar que el código está sano
2. Descarga los ficheros Excel del Ministerio de Vivienda
3. Descarga los salarios medios por CCAA desde la API del INE (tabla 28191, EAES)
4. Ejecuta `scripts/process_ministerio.py` para extraer el último trimestre disponible
5. Actualiza `public/data/provincias.json`, `public/data/municipios.json` y `public/data/salarios.json`
6. Hace commit y push automático al repositorio
7. Vercel detecta el push y redespliegue automáticamente con los datos nuevos

### Ejecutar manualmente

Si el Ministerio publica los datos antes de lo esperado, puedes lanzar el workflow manualmente desde GitHub → pestaña **Actions** → **Update housing data** → **Run workflow**.

También puedes ejecutarlo en local:

```bash
pip3 install xlrd requests
python3 scripts/process_ministerio.py
```

Esto regenera los tres ficheros JSON en `public/data/`.

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

El porcentaje del salario se calcula sobre el **salario neto** (bruto × 0,72). El salario bruto por defecto en cada CCAA es el salario medio real de esa comunidad según la Encuesta Anual de Estructura Salarial (EAES) del INE. El usuario puede ajustarlo libremente con el slider o el input numérico.

## Cómo funciona el gráfico de evolución

Los índices del INE usan base 2015. Para hacer la comparación más intuitiva, se rebasean a T1 2022 = 100 en el servidor antes de enviarse al cliente. Un valor de 134 en T4 2025 significa que los precios han subido un 34% desde el primer trimestre de 2022.

## Páginas por comunidad autónoma

Cada comunidad autónoma tiene una URL limpia que redirige al dashboard pre-filtrado:

| URL | Redirige a |
| --- | --- |
| `/madrid` | `/?ccaa=Madrid` |
| `/castilla-la-mancha` | `/?ccaa=Castilla-La+Mancha` |
| `/comunitat-valenciana` | `/?ccaa=C.+Valenciana` |
| … | … |

Las 19 páginas se generan estáticamente en el build (`generateStaticParams`) y están incluidas en el sitemap.

## Cobertura geográfica

- **19 comunidades autónomas** — datos del INE (IPV trimestral + salarios EAES)
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

## Licencia

MIT — puedes usar, modificar y distribuir este proyecto libremente.

---

Datos del [Instituto Nacional de Estadística](https://www.ine.es) · Licencia [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.es)

Datos del [Ministerio de Vivienda y Agenda Urbana](https://www.mivau.gob.es)
