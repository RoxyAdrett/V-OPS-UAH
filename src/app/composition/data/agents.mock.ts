import { Agent } from '../models/composition.types';

export const AGENTS_MOCK: Agent[] = [
  // DUELISTAS
  { id: 'jett', name: 'Jett', role: 'duelistas', primaryRole: 'Duelista / entry', iconPath: 'assets/agents_icons/jetticonpng.png', subroles: ['Entry', 'Operadora', 'Dash retake'], description: 'Crea espacio y puede tomar ángulos agresivos sin comprometer el arma.', abilitySummary: ['Cloudburst: corta líneas para entrar o reposicionarse.', 'Updraft + Tailwind: entry vertical y salida tras conseguir el pick.', 'Blade Storm: economía y presión en rondas de bonus.'], technicalNotes: 'Excelente en mapas de líneas largas. Coordina el dash con flashes y no gastes la salida antes de confirmar espacio.', features: {} },
  { id: 'reyna', name: 'Reyna', role: 'duelistas', iconPath: 'assets/agents_icons/reynaiconpng.png', subroles: [], description: '', features: {} },
  { id: 'raze', name: 'Raze', role: 'duelistas', iconPath: 'assets/agents_icons/razeiconpng.png', subroles: [], description: '', features: {} },
  { id: 'yoru', name: 'Yoru', role: 'duelistas', iconPath: 'assets/agents_icons/yoruiconpng.png', subroles: [], description: '', features: {} },
  { id: 'phoenix', name: 'Phoenix', role: 'duelistas', iconPath: 'assets/agents_icons/phoenixiconpng.png', subroles: [], description: '', features: {} },
  { id: 'neon', name: 'Neon', role: 'duelistas', iconPath: 'assets/agents_icons/neoniconpng.png', subroles: [], description: '', features: {} },
  { id: 'iso', name: 'Iso', role: 'duelistas', iconPath: 'assets/agents_icons/isoiconpng.png', subroles: [], description: '', features: {} },
  { id: 'waylay', name: 'Waylay', role: 'duelistas', iconPath: 'assets/agents_icons/waylayiconpng.png', subroles: [], description: '', features: {} },

  // INICIADORES
  { id: 'sova', name: 'Sova', role: 'iniciadores', primaryRole: 'Iniciador / info', iconPath: 'assets/agents_icons/sovaiconpng.png', subroles: ['Recon', 'Lineups', 'Post-plant'], description: 'Genera información verificable y habilita ejecuciones con daño a distancia.', abilitySummary: ['Recon Bolt: revela posiciones y fuerza destrucción.', 'Owl Drone: limpia ángulos antes del entry.', 'Shock Bolt: daño de post-plant y anti-utilidad.', 'Hunter’s Fury: presión global sobre plant y rotaciones.'], technicalNotes: 'Guarda una carga de reconocimiento para el retake o la segunda fase de la ronda.', features: {} },
  { id: 'fade', name: 'Fade', role: 'iniciadores', iconPath: 'assets/agents_icons/fadeiconpng.png', subroles: [], description: '', features: {} },
  { id: 'breach', name: 'Breach', role: 'iniciadores', iconPath: 'assets/agents_icons/breachiconpng.png', subroles: [], description: '', features: {} },
  { id: 'skye', name: 'Skye', role: 'iniciadores', iconPath: 'assets/agents_icons/skyeiconpng.png', subroles: [], description: '', features: {} },
  { id: 'kayo', name: 'KAY/O', role: 'iniciadores', iconPath: 'assets/agents_icons/kayoiconpng.png', subroles: [], description: '', features: {} },
  { id: 'gekko', name: 'Gekko', role: 'iniciadores', iconPath: 'assets/agents_icons/gekkoiconpng.png', subroles: [], description: '', features: {} },
  { id: 'tejo', name: 'Tejo', role: 'iniciadores', iconPath: 'assets/agents_icons/tejoiconpng.png', subroles: [], description: '', features: {} }, 

  // HUMOS (Controladores)
  { id: 'omen', name: 'Omen', role: 'humos', iconPath: 'assets/agents_icons/omeniconpng.png', subroles: [], description: '', features: {} },
  { id: 'viper', name: 'Viper', role: 'humos', iconPath: 'assets/agents_icons/vipericonpng.png', subroles: [], description: '', features: {} },
  { id: 'brimstone', name: 'Brimstone', role: 'humos', iconPath: 'assets/agents_icons/brimstoneiconpng.png', subroles: [], description: '', features: {} },
  { id: 'astra', name: 'Astra', role: 'humos', iconPath: 'assets/agents_icons/astraiconpng.png', subroles: [], description: '', features: {} },
  { id: 'harbor', name: 'Harbor', role: 'humos', iconPath: 'assets/agents_icons/harboricon.png', subroles: [], description: '', features: {} },
  { id: 'clove', name: 'Clove', role: 'humos', iconPath: 'assets/agents_icons/cloveiconpng.png', subroles: [], description: '', features: {} },
  { id: 'miks', name: 'Miks', role: 'humos', iconPath: 'assets/agents_icons/miksiconpng.png', subroles: [], description: '', features: {} },

  // CENTINELAS
  { id: 'killjoy', name: 'Killjoy', role: 'centinelas', iconPath: 'assets/agents_icons/killjoyikonapng.png', subroles: [], description: '', features: {} },
  { id: 'cypher', name: 'Cypher', role: 'centinelas', iconPath: 'assets/agents_icons/cyphericonpng.png', subroles: [], description: '', features: {} },
  { id: 'chamber', name: 'Chamber', role: 'centinelas', iconPath: 'assets/agents_icons/chambericonpng.png', subroles: [], description: '', features: {} },
  { id: 'sage', name: 'Sage', role: 'centinelas', iconPath: 'assets/agents_icons/sageiconpng.png', subroles: [], description: '', features: {} },
  { id: 'deadlock', name: 'Deadlock', role: 'centinelas', iconPath: 'assets/agents_icons/deadlockicon.png', subroles: [], description: '', features: {} },
  { id: 'vyse', name: 'Vyse', role: 'centinelas', iconPath: 'assets/agents_icons/vyseiconpng.png', subroles: [], description: '', features: {} },
  { id: 'veto', name: 'Veto', role: 'centinelas', iconPath: 'assets/agents_icons/vetoiconpng.png', subroles: [], description: '', features: {} }
];