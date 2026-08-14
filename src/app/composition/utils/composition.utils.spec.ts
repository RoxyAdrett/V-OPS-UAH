import { AGENTS_MOCK } from '../data/agents.mock';
import { MAPS_MOCK } from '../data/maps.mock';
import {
  addAgentToComposition,
  calculateCompliance,
  getComplianceStatusClass,
  getComplianceStatusLabel,
  MAX_AGENTS,
  removeAgentFromComposition,
} from './composition.utils';

describe('composition.utils', () => {
  it('debe agregar agentes sin duplicar', () => {
    const initial = [AGENTS_MOCK[0]];
    const withNew = addAgentToComposition(initial, AGENTS_MOCK[1]);
    expect(withNew.length).toBe(2);

    const withDuplicate = addAgentToComposition(withNew, AGENTS_MOCK[1]);
    expect(withDuplicate.length).toBe(2);
  });

  it('debe respetar el maximo de 5 agentes', () => {
    const selected = AGENTS_MOCK.slice(0, MAX_AGENTS);
    const result = addAgentToComposition(selected, AGENTS_MOCK[MAX_AGENTS]);

    expect(result.length).toBe(MAX_AGENTS);
    expect(result).toEqual(selected);
  });

  it('debe quitar un agente por id', () => {
    const selected = AGENTS_MOCK.slice(0, 3);
    const result = removeAgentFromComposition(selected, AGENTS_MOCK[1].id);

    expect(result.length).toBe(2);
    expect(result.some((agent) => agent.id === AGENTS_MOCK[1].id)).toBeFalse();
  });

  it('debe devolver 0% cuando no hay mapa seleccionado', () => {
    const result = calculateCompliance(null, AGENTS_MOCK.slice(0, 3));

    expect(result.overallCompliance).toBe(0);
    expect(result.featureCompliance.feature1).toBe(0);
    expect(result.featureCompliance.feature2).toBe(0);
    expect(result.featureCompliance.feature3).toBe(0);
    expect(result.featureCompliance.feature4).toBe(0);
    expect(result.featureCompliance.feature5).toBe(0);
  });

  it('debe devolver 0% cuando no hay agentes seleccionados', () => {
    const result = calculateCompliance(MAPS_MOCK[0], []);

    expect(result.overallCompliance).toBe(0);
    expect(result.strengths.length).toBe(0);
    expect(result.weaknesses.length).toBe(0);
  });

  it('debe limitar el cumplimiento de cada caracteristica al 100%', () => {
    const result = calculateCompliance(MAPS_MOCK[0], AGENTS_MOCK.slice(0, 5));

    expect(result.featureCompliance.feature1).toBeLessThanOrEqual(100);
    expect(result.featureCompliance.feature2).toBeLessThanOrEqual(100);
    expect(result.featureCompliance.feature3).toBeLessThanOrEqual(100);
    expect(result.featureCompliance.feature4).toBeLessThanOrEqual(100);
    expect(result.featureCompliance.feature5).toBeLessThanOrEqual(100);
    expect(result.overallCompliance).toBeLessThanOrEqual(100);
  });

  it('debe mapear correctamente el estado textual por porcentaje', () => {
    expect(getComplianceStatusLabel(0)).toBe('Muy bajo');
    expect(getComplianceStatusLabel(39)).toBe('Muy bajo');
    expect(getComplianceStatusLabel(40)).toBe('Bajo');
    expect(getComplianceStatusLabel(69)).toBe('Bajo');
    expect(getComplianceStatusLabel(70)).toBe('Bueno');
    expect(getComplianceStatusLabel(89)).toBe('Bueno');
    expect(getComplianceStatusLabel(90)).toBe('Excelente');
    expect(getComplianceStatusLabel(100)).toBe('Excelente');
  });

  it('debe mapear correctamente la clase visual por porcentaje', () => {
    expect(getComplianceStatusClass(15)).toBe('status-very-low');
    expect(getComplianceStatusClass(55)).toBe('status-low');
    expect(getComplianceStatusClass(80)).toBe('status-good');
    expect(getComplianceStatusClass(99)).toBe('status-excellent');
  });
});
