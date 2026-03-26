import requests
import xlrd
import json
import os

PROVINCIAS_URL = "https://apps.fomento.gob.es/boletinonline2/sedal/35101000.XLS"
MUNICIPIOS_URL = "https://apps.fomento.gob.es/boletinonline2/sedal/35103500.XLS"

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

def download_excel(url):
    print(f"Descargando {url}...")
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    return response.content

def process_provincias(content):
    wb = xlrd.open_workbook(file_contents=content)

    # Usar siempre la última hoja — contiene los datos más recientes
    ws = wb.sheet_by_index(wb.nsheets - 1)
    print(f"Hoja de provincias: {wb.sheet_names()[-1]}")

    # Encontrar la última columna con datos numéricos válidos en la fila TOTAL NACIONAL
    # TOTAL NACIONAL siempre está en fila 14
    last_col = 2
    for j in range(2, ws.ncols):
        val = ws.cell_value(14, j)
        if val and isinstance(val, (int, float)) and val > 100:
            last_col = j

    print(f"Última columna con datos: {last_col}")
    print(f"Cabecera trimestre: año={ws.cell_value(11, last_col)} trim={ws.cell_value(13, last_col)}")
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

    return provincias

def process_municipios(content):
    wb = xlrd.open_workbook(file_contents=content)
    municipios = {}

    ws = wb.sheet_by_index(wb.nsheets - 1)
    print(f"\nHoja de municipios: {wb.sheet_names()[-1]}")

    header_row_idx = None
    for i in range(ws.nrows):
        row = [str(ws.cell_value(i, j)).strip() for j in range(ws.ncols)]
        if 'Municipio' in row:
            header_row_idx = i
            break

    if header_row_idx is None:
        print("No se encontró cabecera")
        return municipios

    header = [str(ws.cell_value(header_row_idx, j)).strip() for j in range(ws.ncols)]
    prov_col = next((j for j, h in enumerate(header) if h == 'Provincia'), None)
    mun_col = next((j for j, h in enumerate(header) if h == 'Municipio'), None)
    val_col = next((j for j, h in enumerate(header) if 'Valor' in h or 'Total' in h), None)

    if None in (prov_col, mun_col, val_col):
        print(f"Columnas no encontradas: prov={prov_col} mun={mun_col} val={val_col}")
        return municipios

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

        ccaa = PROVINCIAS_A_CCAA.get(current_provincia)
        if not ccaa:
            continue

        municipios[mun] = {
            'pricePerSqm': round(val),
            'provincia': current_provincia,
            'ccaa': ccaa
        }

    return municipios

if __name__ == "__main__":
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'data')
    os.makedirs(output_dir, exist_ok=True)

    prov_content = download_excel(PROVINCIAS_URL)
    provincias = process_provincias(prov_content)
    print(f"\nProvincias encontradas: {len(provincias)}")
    for k, v in list(provincias.items())[:5]:
        print(f"  {k}: {v}")

    with open(os.path.join(output_dir, 'provincias.json'), 'w', encoding='utf-8') as f:
        json.dump(provincias, f, ensure_ascii=False, indent=2)
    print(f"Guardado en public/data/provincias.json")

    mun_content = download_excel(MUNICIPIOS_URL)
    municipios = process_municipios(mun_content)
    print(f"\nMunicipios encontrados: {len(municipios)}")
    for k, v in list(municipios.items())[:5]:
        print(f"  {k}: {v}")

    with open(os.path.join(output_dir, 'municipios.json'), 'w', encoding='utf-8') as f:
        json.dump(municipios, f, ensure_ascii=False, indent=2)
    print(f"Guardado en public/data/municipios.json")

    print("\nHecho.")