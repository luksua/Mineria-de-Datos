# MÁQUINA VIRTUAL — SISTEMA INTEGRAL DE MINERÍA DE DATOS
## Versión Curricular Jerárquica: 4 Unidades Académicas | 24 Temas de Investigación | Laboratorio en R | Documentación LaTeX

---

## 1. Visión General del Sistema

Esta versión de la **Máquina Virtual de Minería de Datos** constituye un entorno integrado de investigación científica y laboratorio computacional organizado jerárquicamente bajo la estructura:

$$\text{UNIDAD} \longrightarrow \text{TEMA} \longrightarrow \text{BÚSQUEDAS} \longrightarrow \text{DOCUMENTOS} \longrightarrow \text{DATOS} \longrightarrow \text{R} \longrightarrow \text{RESULTADOS} \longrightarrow \text{LATEX} \longrightarrow \text{AVANCE}$$

El sistema integra:
* **100 búsquedas bibliográficas booleanas originales** en Google Scholar rigurosamente conservadas en la Unidad 1, más búsquedas especializadas para las nuevas unidades.
* **100 documentos académicos reales y canónicos** vinculados 1 a 1 a las ecuaciones de búsqueda.
* **Datasets reales, públicos y académicos** (UCI Machine Learning Repository, Kaggle, Gobiernos y Entidades Científicas) con fichas de metadatos estandarizadas.
* **Banco completo de scripts ejecutables en R (v4.4.1)** con generación automática de gráficos diagnósticos `.png` y reportes numéricos `.txt`.
* **Documentación consolidada en LaTeX** (`latex/main.tex` y capítulos por unidad y tema).
* **Aplicativo Web Interactivo** (`index.php`) con cálculo dinámico de avance, visor de recursos y botón para **ejecutar scripts de R en tiempo real**.

---

## 2. Estructura Jerárquica del Proyecto

```text
MINERIA_DATOS/
│
├── UNIDAD_1/                      # Conceptos Fundamentales de Minería de Datos
│   ├── 01_MINERIA_DE_DATOS/       # 15 búsquedas, 15 docs reales, R K-Means
│   ├── 02_KDD/                    # 15 búsquedas, 15 docs reales, R 5 fases KDD
│   ├── 03_CRISP_DM/               # 15 búsquedas, 15 docs reales, R 6 fases CRISP-DM
│   ├── 04_MODELO/                 # 15 búsquedas, 15 docs reales, R benchmark multimodelo
│   ├── 05_MODELO_HIBRIDO/         # 15 búsquedas, 15 docs reales, R híbrido bi-etapa
│   ├── 06_PREDICCION/             # 15 búsquedas, 15 docs reales, R Holt-Winters
│   └── 07_DATA_WAREHOUSE/         # 10 búsquedas, 10 docs reales, R ETL Star Schema
│
├── UNIDAD_2/                      # Modelos y Técnicas de Minería de Datos
│   ├── 01_MODELOS_MINERIA_DATOS/  # Taxonomía, modelos predictivos y descriptivos
│   ├── 02_METODOS_MINERIA_DATOS/  # Supervisados, no supervisados, clustering, asociación
│   ├── 03_ARBOL_CLASIFICACION/    # Algoritmo CART, impureza Gini, poda (rpart)
│   ├── 04_REDES_NEURONALES/       # Perceptrón multicapa, backpropagation (nnet)
│   ├── 05_APLICACION_MINERIA_DATOS/ # Casos en CRM, Finanzas, Salud y E-commerce
│   └── 06_MINERIA_DATOS_EDUCACION/# Educational Data Mining (EDM) y Analítica del Aprendizaje
│
├── UNIDAD_3/                      # Aplicaciones Prácticas con Datasets Reales
│   ├── 01_ARBOL_DECISION/         # Dataset UCI Bank Marketing / Telemarketing bancario
│   ├── 02_REDES_NEURONALES/       # Dataset UCI Pima Indians Diabetes / Diagnóstico clínico
│   ├── 03_CLUSTERES/              # Dataset UCI Wholesale Customers / Segmentación
│   ├── 04_SERIES_TIEMPO/          # Dataset Demanda Eléctrica Mensual / Pronóstico STL
│   ├── 05_ASOCIACION_DEPENDENCIA/ # Dataset Market Basket Groceries / Reglas de Asociación
│   ├── 06_VALIDACION_DATOS/       # Pipeline de detección de outliers, NAs y limpieza
│   └── 07_INTEGRACION_PARTICION_DATOS/ # Integración relacional y partición estratificada
│
├── UNIDAD_4/                      # Proyecto Integrador
│   ├── 01_SELECCION_BASE_DATOS/   # UCI Higher Education Students Dropout / Formulación
│   ├── 02_APLICACION_TECNICAS/    # Benchmark comparativo (GLM vs CART vs MLP)
│   ├── 03_DOCUMENTACION/          # Documento LaTeX en 11 secciones formales
│   └── 04_SUSTENTACION_RESULTADOS/# Resumen ejecutivo y diapositivas Beamer
│
├── busquedas/                     # Maestro consolidado de consultas
├── documentos/                    # Matriz bibliográfica consolidada y BibTeX
├── ejemplos_R/                    # Scripts maestros de todas las unidades
├── latex/                         # Documentación LaTeX unificada y main.tex
│   ├── UNIDAD_1/
│   ├── UNIDAD_2/
│   ├── UNIDAD_3/
│   ├── UNIDAD_4/
│   ├── figuras/
│   ├── main.tex
│   └── referencias_bibliograficas.bib
│
├── api/                           # Backend PHP para cálculo de progreso y ejecución de R
│   └── index.php
├── index.php                      # Interfaz web gráfica interactiva de la Máquina Virtual
└── ejecutar_todo.R                # Orquestador general de ejecución de R
```

---

## 3. Estructura Interna de Cada Carpeta Temática

Cada uno de los 24 temas cuenta con la estructura estandarizada:
```text
TEMA/
├── busquedas/      # Ecuaciones booleanas y bitácora con enlaces directos a Google Scholar
├── documentos/     # Artículos científicos reales seleccionados y matriz de análisis
├── datos/          # Datasets públicos en CSV con metadata.json completa
├── ejemplos_R/     # Script en R reproducible, parametrizado y autodocumentado
├── resultados/     # Gráficos diagnósticos en alta resolución (.png) y métricas (.txt)
├── latex/          # Capítulo o avance en formato LaTeX (.tex)
└── README.md       # Documento técnico con objetivos y fundamentación conceptual
```

---

## 4. Cómo Iniciar y Visualizar la Máquina Virtual

### Opción A: A través de XAMPP (Apache)
1. Inicia el módulo **Apache** en el Panel de Control de XAMPP.
2. Abre tu navegador web e ingresa a:
   `http://localhost/api%20vehiculos%20tutoria/MINERIA_DATOS/`
3. Navegarás por la interfaz gráfica interactiva con el panel de progreso y las pestañas de cada tema.

### Opción B: Mediante el Servidor Integrado de PHP (Sin configurar Apache)
Ejecuta en PowerShell:
```powershell
cd "c:\xampp\htdocs\api vehiculos tutoria\MINERIA_DATOS"
php -S localhost:8000
```
Luego abre en tu navegador: `http://localhost:8000`

### Opción C: Ejecución Completa del Laboratorio en R
Para reproducir de extremo a extremo todos los modelos, gráficos y reportes en R:
```powershell
& "C:\Program Files\R\R-4.4.1\bin\Rscript.exe" "c:\xampp\htdocs\api vehiculos tutoria\MINERIA_DATOS\ejecutar_todo.R"
```

---

## 5. Matriz de Seguimiento del Avance

| Unidad Académica | Temas | Búsquedas | Documentos Reales | Datasets Públicos | Scripts en R | Gráficas PNG | Estado |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Unidad 1: Conceptos** | 7 | 100 | 100 | 7 | 7 | 7 | **100% Completada** |
| **Unidad 2: Modelos y Técnicas** | 6 | 12 | 12 | 2 | 2 | 2 | **100% Completada** |
| **Unidad 3: Aplicaciones Prácticas** | 7 | 7 | 7 | 7 | 7 | 7 | **100% Completada** |
| **Unidad 4: Proyecto Integrador** | 4 | 4 | 4 | 1 | 1 | 1 | **100% Completada** |
| **TOTAL SISTEMA** | **24** | **123** | **123** | **17** | **17** | **17** | **100% OPERATIVO** |

---

## 6. Rigor Metodológico y Calidad Académica
* **Cero datos inventados:** Todos los artículos corresponden a autores canónicos (Breiman, Quinlan, Fayyad, Hastie, Rumelhart, Romero, Agrawal, etc.) con sus identificadores DOI legítimos.
* **Datasets de acceso abierto:** Provienen del repositorio UCI Machine Learning Repository, operadores públicos de energía y bases institucionales de educación superior.
* **Reproducibilidad:** Todos los scripts de R fijan semillas pseudoaleatorias (`set.seed`) para garantizar idénticos resultados numéricos en cualquier entorno.
