import { MapData } from '../models/composition.types';

export const MAPS_MOCK: MapData[] = [
  {
    id: 'mapa-1',
    name: 'Mapa 1',
    description: 'Mapa genérico con zonas equilibradas para demostrar el flujo principal.',
    imagePlaceholder: 'M1',
    features: {
      feature1: 80,
      feature2: 60,
      feature3: 75,
      feature4: 50,
      feature5: 65,
    },
  },
  {
    id: 'mapa-2',
    name: 'Mapa 2',
    description: 'Mapa genérico enfocado en rotación rápida y presión en múltiples áreas.',
    imagePlaceholder: 'M2',
    features: {
      feature1: 45,
      feature2: 85,
      feature3: 55,
      feature4: 70,
      feature5: 90,
    },
  },
  {
    id: 'mapa-3',
    name: 'Mapa 3',
    description: 'Mapa genérico con control progresivo y prioridades defensivas variadas.',
    imagePlaceholder: 'M3',
    features: {
      feature1: 65,
      feature2: 50,
      feature3: 90,
      feature4: 80,
      feature5: 40,
    },
  },
];
