import { MapData } from '../models/composition.types';

export const MAPS_MOCK: MapData[] = [
  {
    id: 'bind',
    name: 'Bind',
    mapName: 'Bind',
    description: 'Mapa de dos sitios sin mid, conocido por sus teletransportadores.',
    imagePlaceholder: 'BIND',
    imagePath: 'assets/maps/bind.png',
    features: { 'rotacion': 80, 'verticalidad': 30 },
    sites: ['A Short / Hookah', 'B Long / Garden'],
    callouts: ['TP corto', 'U-Hall', 'Lamps', 'Elbow'],
    attackPlan: 'Prioriza control de Hookah y Lamps; conserva utilidad para el retake de B.',
    defensePlan: 'Juega información temprana en A Short y usa el TP para acelerar la rotación.',
    roles: {
      duelistas: { obligado: ['Raze', 'Neon', 'Waylay'], bueno: ['Phoenix', 'Yoru', 'Jett'], jugable: ['Iso', 'Reyna'], secundario: ['Yoru', 'Neon'], trollpick: [] },
      iniciadores: { obligado: ['Skye', 'Fade', 'Gekko'], bueno: ['Tejo', 'KAY/O'], jugable: ['Breach', 'Sova'], secundario: ['Gekko', 'KAY/O'], trollpick: [] },
      humos: { obligado: ['Brimstone'], bueno: ['Astra', 'Harbor', 'Viper'], jugable: ['Omen', 'Miks', 'Clove'], secundario: ['Viper', 'Harbor'], trollpick: [] },
      centinelas: { obligado: ['Vyse', 'Deadlock', 'Chamber'], bueno: ['Cypher', 'Veto','Sage'], jugable: ['Killjoy'], secundario: ['Deadlock', 'Sage'], trollpick: [] }
    }
  },
  {
    id: 'ascent',
    name: 'Ascent',
    mapName: 'Ascent',
    description: 'Controlar Mid es crucial para abrir las puertas a los sitios.',
    imagePlaceholder: 'ASCENT',
    imagePath: 'assets/maps/ascent.png',
    features: { 'controlMid': 90, 'verticalidad': 40 },
    sites: ['A Main / Tree', 'B Main / Market'],
    callouts: ['Catwalk', 'Wine', 'Switch', 'Pizza'],
    attackPlan: 'La presión coordinada en Mid abre Tree o Market; evita regalar el primer pick sin trade.',
    defensePlan: 'Combina utilidad de Market y Tree para negar el split y guarda un recurso para el retake.',
    roles: {
      duelistas: { obligado: ['Jett', 'Yoru', 'Neon'], bueno: ['Phoenix', 'Reyna'], jugable: ['Iso', 'Raze'], secundario: [], trollpick: [] },
      iniciadores: { obligado: ['Sova', 'KAY/O'], bueno: ['Fade', 'Gekko'], jugable: ['Breach', 'Skye'], secundario: [], trollpick: [] },
      humos: { obligado: ['Omen'], bueno: ['Astra', 'Clove'], jugable: ['Brimstone', 'Viper', 'Harbor'], secundario: [], trollpick: [] },
      centinelas: { obligado: ['Killjoy', 'Cypher'], bueno: ['Chamber', 'Deadlock', 'Vyse'], jugable: ['Sage'], secundario: [], trollpick: [] }
    }
  },
  {
    id: 'haven',
    name: 'Haven',
    mapName: 'Haven',
    description: 'El único mapa con tres sitios de bomba.',
    imagePlaceholder: 'HAVEN',
    imagePath: 'assets/maps/haven.png',
    features: { 'rotacion': 70, 'verticalidad': 50 },
    sites: ['A Long / Short', 'B Site', 'C Long / Garage'],
    callouts: ['Window', 'C Grass', 'A Heaven', 'B Default'],
    attackPlan: 'Divide la defensa con presencia en C Long y prepara el split de A desde Short.',
    defensePlan: 'Juega por información: los tres sitios castigan las rotaciones prematuras.',
    roles: {
      duelistas: { obligado: ['Jett', 'Yoru', 'Neon'], bueno: ['Phoenix', 'Reyna', 'Raze'], jugable: ['Iso'], secundario: [], trollpick: [] },
      iniciadores: { obligado: ['Sova', 'Breach', 'Fade'], bueno: ['Skye', 'KAY/O'], jugable: ['Gekko'], secundario: [], trollpick: [] },
      humos: { obligado: ['Omen', 'Astra'], bueno: ['Clove', 'Harbor'], jugable: ['Viper', 'Brimstone'], secundario: [], trollpick: [] },
      centinelas: { obligado: ['Killjoy', 'Cypher'], bueno: ['Chamber', 'Deadlock', 'Vyse'], jugable: ['Sage'], secundario: [], trollpick: [] }
    }
  },
  {
    id: 'split',
    name: 'Split',
    mapName: 'Split',
    description: 'Mucha verticalidad y defensa sólida.',
    imagePlaceholder: 'SPLIT',
    imagePath: 'assets/maps/split.png',
    features: { 'verticalidad': 90, 'controlMid': 60 },
    sites: ['A Main / Ramps', 'B Main / Tower'],
    callouts: ['Vents', 'Mail', 'B Heaven', 'Screens'],
    attackPlan: 'Controla Mid antes de ejecutar; Ramps y B Main deben llegar con utilidad sincronizada.',
    defensePlan: 'La información de vents decide la rotación. Conserva un flash para frenar el rush.',
    roles: {
      duelistas: { obligado: ['Raze', 'Jett', 'Reyna'], bueno: ['Yoru', 'Neon'], jugable: ['Phoenix', 'Iso'], secundario: [], trollpick: [] },
      iniciadores: { obligado: ['Skye', 'Breach', 'Fade'], bueno: ['KAY/O', 'Gekko'], jugable: ['Sova'], secundario: [], trollpick: [] },
      humos: { obligado: ['Omen', 'Astra'], bueno: ['Viper', 'Clove'], jugable: ['Brimstone', 'Harbor'], secundario: [], trollpick: [] },
      centinelas: { obligado: ['Cypher', 'Killjoy', 'Sage'], bueno: ['Chamber', 'Deadlock', 'Vyse'], jugable: [], secundario: [], trollpick: [] }
    }
  },
  {
    id: 'icebox',
    name: 'Icebox',
    mapName: 'Icebox',
    description: 'Luchas complejas con mucha verticalidad en los sitios.',
    imagePlaceholder: 'ICEBOX',
    imagePath: 'assets/maps/icebox.png',
    features: { 'verticalidad': 100, 'largasDistancias': 80 },
    roles: {
      duelistas: { obligado: ['Jett', 'Reyna'], bueno: ['Yoru', 'Neon'], jugable: ['Raze', 'Phoenix', 'Iso'], secundario: [], trollpick: [] },
      iniciadores: { obligado: ['Sova', 'KAY/O'], bueno: ['Fade', 'Gekko'], jugable: ['Breach', 'Skye'], secundario: [], trollpick: [] },
      humos: { obligado: ['Viper'], bueno: ['Harbor', 'Omen'], jugable: ['Astra', 'Miks', 'Clove'], secundario: [], trollpick: ['Brimstone'] },
      centinelas: { obligado: ['Killjoy'], bueno: ['Sage', 'Chamber', 'Cypher'], jugable: ['Deadlock', 'Vyse'], secundario: [], trollpick: [] }
    }
  },
  {
    id: 'breeze',
    name: 'Breeze',
    mapName: 'Breeze',
    description: 'Mapa grande con líneas de visión muy largas.',
    imagePlaceholder: 'BREEZE',
    imagePath: 'assets/maps/breeze.png',
    features: { 'largasDistancias': 100, 'rotacion': 50 },
    roles: {
      duelistas: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] },
      iniciadores: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] },
      humos: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] },
      centinelas: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] }
    }
  },
  {
    id: 'fracture',
    name: 'Fracture',
    mapName: 'Fracture',
    description: 'Defensa en el centro, ataque desde dos lados opuestos.',
    imagePlaceholder: 'FRACTURE',
    imagePath: 'assets/maps/fracture.png',
    features: { 'flanqueo': 90, 'rotacion': 80 },
    roles: {
      duelistas: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] },
      iniciadores: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] },
      humos: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] },
      centinelas: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] }
    }
  },
  {
    id: 'pearl',
    name: 'Pearl',
    mapName: 'Pearl',
    description: 'Mapa submarino, tradicional sin mecánicas especiales.',
    imagePlaceholder: 'PEARL',
    imagePath: 'assets/maps/pearl.png',
    features: { 'controlMid': 80, 'rotacion': 60 },
    roles: {
      duelistas: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] },
      iniciadores: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] },
      humos: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] },
      centinelas: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] }
    }
  },
  {
    id: 'lotus',
    name: 'Lotus',
    mapName: 'Lotus',
    description: 'Tres sitios con puertas giratorias y paredes destruibles.',
    imagePlaceholder: 'LOTUS',
    imagePath: 'assets/maps/lotus.png',
    features: { 'rotacion': 90, 'controlPuertas': 70 },
    roles: {
      duelistas: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] },
      iniciadores: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] },
      humos: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] },
      centinelas: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] }
    }
  },
  {
    id: 'sunset',
    name: 'Sunset',
    mapName: 'Sunset',
    description: 'Mapa tradicional centrado en el control de Mid.',
    imagePlaceholder: 'SUNSET',
    imagePath: 'assets/maps/sunset.png',
    features: { 'controlMid': 100, 'flanqueo': 60 },
    roles: {
      duelistas: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] },
      iniciadores: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] },
      humos: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] },
      centinelas: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] }
    }
  },
  {
    id: 'abyss',
    name: 'Abyss',
    mapName: 'Abyss',
    description: 'Cuidado donde pisas, mapa con mecánicas de caída letal.',
    imagePlaceholder: 'ABYSS',
    imagePath: 'assets/maps/abyss.png',
    features: { 'peligroCaida': 100, 'verticalidad': 70 },
    roles: {
      duelistas: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] },
      iniciadores: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] },
      humos: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] },
      centinelas: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] }
    }
  },
  {
    id: 'corrode',
    name: 'Corrode',
    mapName: 'Corrode',
    description: 'Nuevas mecánicas.',
    imagePlaceholder: 'CORRODE',
    imagePath: 'assets/maps/corrode.png',
    features: { 'tecnico': 50 },
    roles: {
      duelistas: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] },
      iniciadores: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] },
      humos: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] },
      centinelas: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] }
    }
  },
  {
    id: 'summit',
    name: 'Summit',
    mapName: 'Summit',
    description: 'Nuevas mecánicas.',
    imagePlaceholder: 'SUMMIT',
    imagePath: 'assets/maps/summit.png',
    features: { 'tecnico': 50 },
    roles: {
      duelistas: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] },
      iniciadores: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] },
      humos: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] },
      centinelas: { obligado: [], bueno: [], jugable: [], secundario: [], trollpick: [] }
    }
  }
];