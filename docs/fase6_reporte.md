# Reporte de Fase 6 — Entrega 6A: Núcleo Funcional de La Máquina de Minería

**Proyecto:** Ruta del Conocimiento: La Máquina de Minería  
**Referencia:** `AGENTS.md` (§1, §7, §8, §9, §11), Hoja de ruta Fase 6 (Entrega 6A)  
**Fecha:** Octubre 2026  
**Estado:** Entrega 6A Completada — En espera de aprobación para `npm run build` y Entrega 6B.

---

## 1. Resumen de la Entrega 6A

Se implementó el **núcleo funcional interactivo de La Máquina de Minería** (reemplazando el marcador previo `MachinePlaceholder` en el modo interactivo), permitiendo operar la línea de producción sobre los datos y scripts reales del repositorio sin alterar la API PHP ni recurrir a datos simulados:

1. **Selector de Pedido (Tema):**
   - Selector reactivo que permite cargar cualquiera de los 24 temas distribuidos en las 4 unidades curriculares.
   - Sincronización inmediata de metadatos, artefactos de entrada/salida y estado de validación.

2. **Línea de Producción (5 Estaciones Conectadas):**
   - Vía de atlas visual con las 5 estaciones canónicas: `Terminal -> Biblioteca -> Laboratorio -> Escritorio -> Pizarra`.
   - Indicador de estado por estación (completada, activa, pendiente).
   - Conexiones dinámicas con flujo animado cuando hay procesos en ejecución.

3. **Avatar Operador con Viaje Rápido:**
   - Marcador visual tipo atlas (`Operador`) posicionado dinámicamente sobre la pista con transición suave (`cubic-bezier(0.16, 1, 0.3, 1)`).
   - Movimiento reactivo por clic en cualquier estación para viaje rápido sin movimiento libre.

4. **Laboratorio Completo con Ejecución R Real:**
   - Admite arrastrar y soltar la pieza de datos/script, así como el botón alternativo accesible (*"Acoplar y Ejecutar en Laboratorio"*).
   - Invoca `runService.runScript(unit, topic)` contra la API PHP real de Apache (`api/index.php?action=run_r`).
   - Consola de ejecución en vivo con `exit_code` y salida textual completa (`stdout`/`stderr`).
   - Revelado animado escalonado de las figuras generadas (`.png`).
   - Visualización de métricas estructuradas vía `metricsService.ts` (`metricas.json` o fallback a `metricas_*.txt`).

5. **Validación Estricta de Acople:**
   - Valida en frontend la existencia real de los archivos de dataset y script R reportados por `topic_data`.
   - Si falta algún artefacto o la verificación falla, el acople se rechaza mostrando *"Sin datos registrados"*. Nunca simula ejecuciones exitosas.

6. **Recorrido del Usuario Desacoplado:**
   - Registro de estaciones operadas persistido en `localStorage` bajo el servicio `recorridoService.ts`, sin llamadas directas desde componentes.
   - Marcador visual *"Estaciones operadas: X de 5"* en el tema seleccionado.
   - Botón para reiniciar el recorrido del tema.

---

## 2. Archivos Creados y Modificados

### Archivos Creados
- `frontend/src/services/recorridoService.ts`: Servicio que abstrae la persistencia del recorrido del usuario (`mineria_recorrido_maquina_v1` en `localStorage`), cálculo de estaciones operadas y reinicio por tema.
- `frontend/src/services/metricsService.ts`: Servicio para la carga desacoplada y con prevención de caché de `metricas.json` y extractores de texto `.txt`.
- `frontend/src/components/Machine/MachineView.tsx`: Vista principal de La Máquina de Minería (selector de temas, vía de atlas, avatar deslizante, piezas móviles, estación de laboratorio completa con consola, gráficos y métricas).
- `docs/fase6_reporte.md`: Este documento de registro.

### Archivos Modificados
- `frontend/src/App.tsx`: Sustitución de `MachinePlaceholder` por `MachineView` en el modo mapa (`mode === 'map'`), preservando intacto el archivo `MachinePlaceholder.tsx`.

---

## 3. Verificaciones Realizadas

1. **Compilación TypeScript:**
   - Comando ejecutado: `cmd.exe /c "cd frontend && npx tsc --noEmit"`.
   - Resultado: Salida limpia, 0 errores de tipado.
2. **Servidor y API:**
   - Servidor Vite activo en `http://localhost:5174/`.
   - Proxy funcional con Apache XAMPP en el endpoint `api/index.php`.
   - Acceso a `topic_data`, `run_r` y archivos estáticos verificado.

---

## 4. Estado para Siguiente Etapa

- **Entrega 6A:** Finalizada y lista para commit.
- **Entrega 6B (Pendiente de aprobación):**
  - Implementación detallada de estaciones Terminal, Biblioteca, Escritorio y Pizarra con sus acciones reales.
  - Pulido fino de animaciones de arrastre y acople.
