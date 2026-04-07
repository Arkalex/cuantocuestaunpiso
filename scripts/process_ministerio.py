import requests
import xlrd
import json
import os

PROVINCIAS_URL = "https://apps.fomento.gob.es/boletinonline2/sedal/35101000.XLS"
MUNICIPIOS_URL = "https://apps.fomento.gob.es/boletinonline2/sedal/35103500.XLS"

# API del INE — Encuesta Anual de Estructura Salarial, tabla 28191
# Medias y percentiles por sexo y CCAA
INE_SALARIOS_URL = (
    "https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/28191"
    "?tip=AM&date=20150101:20301231"
)

CCAA_NAMES = {
    'Andalucía', 'Aragón', 'Canarias', 'Cantabria',
    'Castilla y León', 'Castilla-La Mancha', 'Cataluña',
    'Comunidad Valenciana', 'Extremadura', 'Galicia', 'País Vasco',
    'Ceuta y Melilla',
}

SINGLE_PROV_CCAA = {
    'Asturias (Principado de )': ('Asturias', 'Asturias'),
    'Balears (Illes)': ('Baleares', 'Baleares'),
    'Cantabria': ('Cantabria', 'Cantabria'),
    'Madrid (Comunidad de)': ('Madrid', 'Madrid'),
    'Murcia (Región de)': ('Murcia', 'Murcia'),
    'Navarra (Comunidad Foral de)': ('Navarra', 'Navarra'),
    'Rioja (La)': ('La Rioja', 'La Rioja'),
    'Ceuta': ('Ceuta', 'Ceuta'),
    'Melilla': ('Melilla', 'Melilla'),
}

PROVINCIAS_A_CCAA = {
    'Almería': 'Andalucía', 'Cádiz': 'Andalucía', 'Córdoba': 'Andalucía',
    'Granada': 'Andalucía', 'Huelva': 'Andalucía', 'Jaén': 'Andalucía',
    'Málaga': 'Andalucía', 'Sevilla': 'Andalucía',
    'Huesca': 'Aragón', 'Teruel': 'Aragón', 'Zaragoza': 'Aragón',
    'Asturias': 'Asturias',
    'Baleares': 'Baleares',
    'Palmas (Las)': 'Canarias', 'Santa Cruz de Tenerife': 'Canarias',
    'Cantabria': 'Cantabria',
    'Ávila': 'Castilla y León', 'Burgos': 'Castilla y León',
    'León': 'Castilla y León', 'Palencia': 'Castilla y León',
    'Salamanca': 'Castilla y León', 'Segovia': 'Castilla y León',
    'Soria': 'Castilla y León', 'Valladolid': 'Castilla y León',
    'Zamora': 'Castilla y León',
    'Albacete': 'Castilla-La Mancha', 'Ciudad Real': 'Castilla-La Mancha',
    'Cuenca': 'Castilla-La Mancha', 'Guadalajara': 'Castilla-La Mancha',
    'Toledo': 'Castilla-La Mancha',
    'Barcelona': 'Cataluña', 'Girona': 'Cataluña',
    'Lleida': 'Cataluña', 'Tarragona': 'Cataluña',
    'Alicante/Alacant': 'C. Valenciana', 'Castellón/Castelló': 'C. Valenciana',
    'Valencia/València': 'C. Valenciana',
    'Badajoz': 'Extremadura', 'Cáceres': 'Extremadura',
    'Coruña (A)': 'Galicia', 'Lugo': 'Galicia',
    'Ourense': 'Galicia', 'Pontevedra': 'Galicia',
    'Madrid': 'Madrid',
    'Murcia': 'Murcia',
    'Navarra': 'Navarra',
    'Araba/Alava': 'País Vasco', 'Gipuzkoa': 'País Vasco', 'Bizkaia': 'País Vasco',
    'La Rioja': 'La Rioja',
    'Ceuta': 'Ceuta', 'Melilla': 'Melilla',
}

# Municipios mal agrupados en el Excel del Ministerio — corrección manual
# El Excel a veces deja la celda de provincia vacía y el parser hereda
# la provincia anterior incorrectamente
MUNICIPIOS_PROVINCIA_OVERRIDE = {
    'Azuqueca de Henares': 'Guadalajara',  # aparece bajo Cuenca en el Excel
    'Illescas': 'Toledo',                  # aparece bajo Guadalajara en el Excel
}

# Mapa de nombres del INE → nombres normalizados usados en el proyecto
# La EAES no incluye Ceuta ni Melilla por separado
INE_CCAA_MAP = {
    'Andalucía': 'Andalucía',
    'Aragón': 'Aragón',
    'Asturias, Principado de': 'Asturias',
    'Balears, Illes': 'Baleares',
    'Canarias': 'Canarias',
    'Cantabria': 'Cantabria',
    'Castilla y León': 'Castilla y León',
    'Castilla - La Mancha': 'Castilla-La Mancha',
    'Cataluña': 'Cataluña',
    'Comunitat Valenciana': 'C. Valenciana',
    'Extremadura': 'Extremadura',
    'Galicia': 'Galicia',
    'Madrid, Comunidad de': 'Madrid',
    'Murcia, Región de': 'Murcia',
    'Navarra, Comunidad Foral de': 'Navarra',
    'País Vasco': 'País Vasco',
    'Rioja, La': 'La Rioja',
}

# Salario medio nacional de la EAES — usado como fallback para Ceuta y Melilla
CCAA_SIN_DATOS_EAES = {'Ceuta', 'Melilla'}

def download_excel(url):
    print(f"Descargando {url}...")
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    return response.content

def parse_quarter_label(sheet_name):
    """
    Convierte el nombre de hoja del Ministerio al formato 'T4 2025'.
    Ejemplos de entrada: 'T4A2025', '4T 2024', 'T4 2025', '4T2025'.
    Devuelve el string original si no se reconoce el formato.
    """
    import re
    # Formatos conocidos: T4A2025, T4 2025, 4T 2024, 4T2025
    m = re.match(r'[Tt]([1-4])[Aa\s]?(\d{4})', sheet_name.strip())
    if m:
        return f"T{m.group(1)} {m.group(2)}"
    m = re.match(r'([1-4])[Tt]\s?(\d{4})', sheet_name.strip())
    if m:
        return f"T{m.group(1)} {m.group(2)}"
    return sheet_name.strip()


def process_provincias(content):
    wb = xlrd.open_workbook(file_contents=content)
    ws = wb.sheet_by_index(wb.nsheets - 1)
    sheet_name = wb.sheet_names()[-1]
    print(f"Hoja de provincias: {sheet_name}")

    last_col = 2
    for j in range(2, ws.ncols):
        val = ws.cell_value(14, j)
        if val and isinstance(val, (int, float)) and val > 100:
            last_col = j

    print(f"Última columna con datos: {last_col}")
    print(f"TOTAL NACIONAL: {ws.cell_value(14, last_col)} €/m²")

    provincias = {}

    for i in range(14, ws.nrows):
        nombre = ws.cell_value(i, 1)
        if not nombre or not isinstance(nombre, str):
            continue
        nombre_clean = nombre.strip()
        if not nombre_clean:
            continue

        valor = ws.cell_value(i, last_col)
        if not valor or not isinstance(valor, (int, float)) or valor <= 100:
            continue

        if nombre_clean in SINGLE_PROV_CCAA:
            prov_name, ccaa = SINGLE_PROV_CCAA[nombre_clean]
            provincias[prov_name] = {
                'pricePerSqm': round(valor),
                'ccaa': ccaa
            }
        elif nombre_clean not in CCAA_NAMES and nombre_clean != 'TOTAL NACIONAL':
            ccaa = PROVINCIAS_A_CCAA.get(nombre_clean)
            if ccaa:
                provincias[nombre_clean] = {
                    'pricePerSqm': round(valor),
                    'ccaa': ccaa
                }

    # Extraer el trimestre de referencia del nombre de la hoja
    # El Ministerio nombra las hojas como "4T 2024", "1T 2025", etc.
    data_quarter = sheet_name.strip()

    return provincias, data_quarter

def process_municipios(content):
    wb = xlrd.open_workbook(file_contents=content)
    municipios = {}

    ws = wb.sheet_by_index(wb.nsheets - 1)
    sheet_name = wb.sheet_names()[-1]
    # El nombre de la hoja del Excel de municipios indica el trimestre exacto
    # (ej. "T4A2025"). Lo parseamos a formato legible "T4 2025".
    data_quarter = parse_quarter_label(sheet_name)
    print(f"\nHoja de municipios: {sheet_name} → trimestre: {data_quarter}")

    header_row_idx = None
    for i in range(ws.nrows):
        row = [str(ws.cell_value(i, j)).strip() for j in range(ws.ncols)]
        if 'Municipio' in row:
            header_row_idx = i
            break

    if header_row_idx is None:
        print("No se encontró cabecera")
        return municipios, data_quarter

    header = [str(ws.cell_value(header_row_idx, j)).strip() for j in range(ws.ncols)]
    prov_col = next((j for j, h in enumerate(header) if h == 'Provincia'), None)
    mun_col = next((j for j, h in enumerate(header) if h == 'Municipio'), None)
    val_col = next((j for j, h in enumerate(header) if 'Valor' in h or 'Total' in h), None)

    if None in (prov_col, mun_col, val_col):
        print(f"Columnas no encontradas: prov={prov_col} mun={mun_col} val={val_col}")
        return municipios, data_quarter

    current_provincia = None
    for i in range(header_row_idx + 2, ws.nrows):
        prov = str(ws.cell_value(i, prov_col)).strip()
        mun = str(ws.cell_value(i, mun_col)).strip()
        val = ws.cell_value(i, val_col)

        if prov and prov not in ('None', ''):
            current_provincia = prov

        if not mun or mun in ('None', ''):
            continue
        if not val or not isinstance(val, (int, float)) or val <= 0:
            continue

        # Aplicar corrección si el municipio está mal agrupado en el Excel
        provincia_final = MUNICIPIOS_PROVINCIA_OVERRIDE.get(mun, current_provincia)

        ccaa = PROVINCIAS_A_CCAA.get(provincia_final)
        if not ccaa:
            continue

        municipios[mun] = {
            'pricePerSqm': round(val),
            'provincia': provincia_final,
            'ccaa': ccaa
        }

    return municipios, data_quarter

def fetch_salarios_ine():
    """
    Descarga salarios medios brutos anuales por CCAA desde la API del INE.
    Tabla 28191 — EAES: Medias y percentiles por sexo y CCAA.
    Filtra las series de ambos sexos, tipo de dato base y media.
    Devuelve un dict { ccaa_normalizada: salario_medio_euros }.
    """
    print(f"\nDescargando salarios del INE: {INE_SALARIOS_URL}")
    response = requests.get(INE_SALARIOS_URL, timeout=30)
    response.raise_for_status()
    data = response.json()

    salarios = {}
    salario_nacional = None

    for serie in data:
        meta = serie.get('MetaData', [])

        # Filtrar: ambos sexos + tipo dato base + medida media
        es_ambos_sexos = any(m['T3_Variable'] == 'Sexo' and m['Nombre'] == 'Ambos sexos' for m in meta)
        es_dato_base = any(m['T3_Variable'] == 'Tipo de dato' and m['Nombre'] == 'Dato base' for m in meta)
        es_media = any(m['T3_Variable'] == 'Medidas estadísticas' and m['Nombre'] == 'Media' for m in meta)

        if not (es_ambos_sexos and es_dato_base and es_media):
            continue

        # Obtener el nombre de la CCAA o Nacional
        ccaa_meta = next(
            (m for m in meta if m['T3_Variable'] == 'Comunidades y Ciudades Autónomas'),
            None
        )
        nacional_meta = next(
            (m for m in meta if m['T3_Variable'] == 'Total Nacional'),
            None
        )

        # Obtener el valor más reciente (mayor año)
        datos = [d for d in serie.get('Data', []) if d.get('Valor') is not None]
        if not datos:
            continue
        dato_reciente = max(datos, key=lambda d: d['Anyo'])
        valor = round(dato_reciente['Valor'])
        anyo = dato_reciente['Anyo']

        if nacional_meta:
            salario_nacional = valor
            print(f"  Nacional ({anyo}): {valor} €")
            continue

        if ccaa_meta:
            nombre_ine = ccaa_meta['Nombre']
            nombre_norm = INE_CCAA_MAP.get(nombre_ine)
            if nombre_norm:
                salarios[nombre_norm] = valor
                print(f"  {nombre_norm} ({anyo}): {valor} €")

    # Ceuta y Melilla no tienen datos en la EAES: usar el salario nacional como fallback
    if salario_nacional:
        for ccaa in CCAA_SIN_DATOS_EAES:
            salarios[ccaa] = salario_nacional
            print(f"  {ccaa} (fallback nacional): {salario_nacional} €")

    return salarios


if __name__ == "__main__":
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'data')
    os.makedirs(output_dir, exist_ok=True)

    prov_content = download_excel(PROVINCIAS_URL)
    provincias, _ = process_provincias(prov_content)
    print(f"\nProvincias encontradas: {len(provincias)}")

    with open(os.path.join(output_dir, 'provincias.json'), 'w', encoding='utf-8') as f:
        json.dump(provincias, f, ensure_ascii=False, indent=2)
    print(f"Guardado en public/data/provincias.json")

    mun_content = download_excel(MUNICIPIOS_URL)
    municipios, data_quarter = process_municipios(mun_content)
    print(f"\nMunicipios encontrados: {len(municipios)}")
    print(f"Trimestre de referencia: {data_quarter}")

    # Verificar correcciones aplicadas
    print("\nVerificando correcciones:")
    for mun_name in MUNICIPIOS_PROVINCIA_OVERRIDE:
        if mun_name in municipios:
            print(f"  {mun_name} → provincia: {municipios[mun_name]['provincia']} ✓")

    with open(os.path.join(output_dir, 'municipios.json'), 'w', encoding='utf-8') as f:
        json.dump(municipios, f, ensure_ascii=False, indent=2)
    print(f"Guardado en public/data/municipios.json")

    # Salarios del INE
    salarios = fetch_salarios_ine()
    print(f"\nCCAA con salario encontradas: {len(salarios)}")

    salarios_output = {
        'salarios': salarios,
        'dataQuarter': data_quarter,
    }

    with open(os.path.join(output_dir, 'salarios.json'), 'w', encoding='utf-8') as f:
        json.dump(salarios_output, f, ensure_ascii=False, indent=2)
    print(f"Guardado en public/data/salarios.json")

    print("\nHecho.")
