export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return formatDateKey(a) === formatDateKey(b);
}

/**
 * Verifica si una fecha pertenece al mes actual
 */
export function isInCurrentMonth(date: Date, monthDate: Date): boolean {
  return date.getMonth() === monthDate.getMonth() && 
         date.getFullYear() === monthDate.getFullYear();
}

/**
 * Crea una grilla de calendario completa (42 días) con alineación correcta.
 * Incluye días del mes anterior y siguiente para llenar las semanas completas.
 */
export function createMonthGrid(monthDate: Date): Date[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  
  // Primer día del mes
  const firstDay = new Date(year, month, 1);
  // getDay() retorna 0=domingo, 1=lunes, ..., 6=sábado
  // Convertimos a semana ISO (0=lunes)
  const startDayOfWeek = (firstDay.getDay() + 6) % 7;
  
  // Calcular primer día de la grilla (puede ser del mes anterior)
  const gridStartDate = new Date(firstDay);
  gridStartDate.setDate(firstDay.getDate() - startDayOfWeek);
  
  // Generar 42 días (6 semanas completas)
  const grid: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStartDate);
    date.setDate(gridStartDate.getDate() + i);
    grid.push(date);
  }
  
  return grid;
}
