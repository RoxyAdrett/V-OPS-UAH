# Valoplant_NOVY_S

## Prototipo actual

Esta version implementa un flujo base para:

- Seleccionar un mapa generico.
- Seleccionar hasta 5 agentes genericos sin duplicados.
- Calcular un porcentaje de cumplimiento de composicion segun caracteristicas.

## Estructura recomendada

El prototipo esta separado por capas dentro de `src/app/composition`:

- `models/composition.types.ts`: tipos de `Features`, `MapData`, `Agent`, `CompositionResult`.
- `data/maps.mock.ts`: datos mock de mapas.
- `data/agents.mock.ts`: datos mock de agentes.
- `utils/composition.utils.ts`: logica reutilizable (agregar, quitar, calcular cumplimiento, estado textual y visual).
- `components/*`: componentes standalone reutilizables de UI.

La pantalla principal integra todo desde `src/app/home/home.page.ts`.

## Ejecutar proyecto

1. `npm install`
2. `npm start`
3. Para validar compilacion: `npm run build`

## Reemplazo futuro de datos genericos

Cuando quieras pasar a datos reales, actualiza:

- `src/app/composition/data/maps.mock.ts`
- `src/app/composition/data/agents.mock.ts`

Si cambian las caracteristicas, ajusta tambien:

- `src/app/composition/models/composition.types.ts`
- `src/app/composition/utils/composition.utils.ts`