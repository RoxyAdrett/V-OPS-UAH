import { createMonthGrid, formatDateKey, isSameDay } from './schedule.utils';

describe('schedule.utils', () => {
  it('debe devolver 42 celdas para una vista mensual completa', () => {
    const month = new Date(2026, 7, 1);
    const grid = createMonthGrid(month);

    expect(grid.length).toBe(42);
    expect(grid[0].getDate()).toBe(27);
    expect(grid[grid.length - 1].getDate()).toBe(13);
  });

  it('debe formatear una fecha local en clave yyyy-mm-dd', () => {
    const value = new Date(2026, 7, 15, 10, 30);
    expect(formatDateKey(value)).toBe('2026-08-15');
  });

  it('debe comparar fechas sin importar la hora', () => {
    const a = new Date(2026, 7, 15, 9, 0);
    const b = new Date(2026, 7, 15, 18, 30);

    expect(isSameDay(a, b)).toBeTrue();
  });
});
