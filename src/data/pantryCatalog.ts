import type { CatalogIngredient, IngredientCategory } from '../types/queco';

export const CATEGORY_LABELS: Record<IngredientCategory, string> = {
  proteinas: 'Proteínas',
  verduras: 'Verduras',
  carbohidratos: 'Carbohidratos / Granos',
  lacteos_otros: 'Lácteos / Otros',
};

export const PANTRY_CATALOG: CatalogIngredient[] = [
  // Proteínas
  { id: 'carne-res', name: 'Carne de res', category: 'proteinas', aliases: ['res', 'carne', 'bistec', 'posta'], popular: true },
  { id: 'pollo', name: 'Pollo', category: 'proteinas', aliases: ['pechuga', 'muslos de pollo', 'pollo desmechado'], popular: true },
  { id: 'huevos', name: 'Huevos', category: 'proteinas', aliases: ['huevo'], popular: true },
  { id: 'carne-molida', name: 'Carne molida', category: 'proteinas', aliases: ['molida', 'picada'], popular: true },
  { id: 'atun', name: 'Atún en lata', category: 'proteinas', aliases: ['atun', 'atún'], popular: true },
  { id: 'cerdo', name: 'Cerdo', category: 'proteinas', aliases: ['lomo de cerdo', 'chuleta'], popular: false },
  { id: 'salchichas', name: 'Salchichas', category: 'proteinas', aliases: ['chorizo', 'embutido'], popular: false },
  { id: 'lentejas', name: 'Lentejas', category: 'proteinas', aliases: ['lenteja'], popular: true },
  { id: 'frijoles', name: 'Frijoles', category: 'proteinas', aliases: ['porotos', 'habichuelas', 'caraotas'], popular: false },

  // Verduras
  { id: 'papas', name: 'Papas', category: 'verduras', aliases: ['papa', 'patatas', 'patata'], popular: true },
  { id: 'tomate', name: 'Tomate', category: 'verduras', aliases: ['tomates', 'jitomate'], popular: true },
  { id: 'cebolla', name: 'Cebolla', category: 'verduras', aliases: ['cebolla cabezona', 'cebolla larga', 'cebollin'], popular: true },
  { id: 'ajo', name: 'Ajo', category: 'verduras', aliases: ['dientes de ajo', 'ajos'], popular: true },
  { id: 'zanahoria', name: 'Zanahoria', category: 'verduras', aliases: ['zanahorias'], popular: true },
  { id: 'pimenton', name: 'Pimentón', category: 'verduras', aliases: ['pimiento', 'morron', 'pimenton rojo'], popular: true },
  { id: 'platano-maduro', name: 'Plátano maduro', category: 'verduras', aliases: ['platano', 'maduro'], popular: true },
  { id: 'aguacate', name: 'Aguacate', category: 'verduras', aliases: ['palta'], popular: false },
  { id: 'espinaca', name: 'Espinaca', category: 'verduras', aliases: ['espinacas', 'acelga'], popular: false },
  { id: 'cilantro', name: 'Cilantro', category: 'verduras', aliases: ['perejil', 'hierbas'], popular: false },

  // Carbohidratos / Granos
  { id: 'arroz', name: 'Arroz', category: 'carbohidratos', aliases: ['arroz blanco', 'arroz cocido'], popular: true },
  { id: 'pasta', name: 'Pasta', category: 'carbohidratos', aliases: ['espagueti', 'fideos', 'macarrones', 'tallarines'], popular: true },
  { id: 'pan', name: 'Pan', category: 'carbohidratos', aliases: ['pan tajado', 'migas'], popular: false },
  { id: 'tortillas', name: 'Tortillas', category: 'carbohidratos', aliases: ['tortilla de trigo', 'tortilla de maiz'], popular: true },
  { id: 'arepas', name: 'Harina de maíz', category: 'carbohidratos', aliases: ['arepa', 'arepas', 'masa de maiz'], popular: false },
  { id: 'yuca', name: 'Yuca', category: 'carbohidratos', aliases: ['mandioca'], popular: false },
  { id: 'avena', name: 'Avena', category: 'carbohidratos', aliases: ['hojuelas de avena'], popular: false },

  // Lácteos / Otros
  { id: 'queso', name: 'Queso', category: 'lacteos_otros', aliases: ['queso rallado', 'mozzarella', 'queso fresco', 'quesito'], popular: true },
  { id: 'leche', name: 'Leche', category: 'lacteos_otros', aliases: ['leche entera'], popular: true },
  { id: 'mantequilla', name: 'Mantequilla', category: 'lacteos_otros', aliases: ['margarina'], popular: true },
  { id: 'crema-leche', name: 'Crema de leche', category: 'lacteos_otros', aliases: ['nata', 'crema'], popular: true },
  { id: 'maiz-dulce', name: 'Maíz dulce', category: 'lacteos_otros', aliases: ['mazorca', 'choclo', 'maicitos'], popular: true },
  { id: 'salsa-soya', name: 'Salsa de soya', category: 'lacteos_otros', aliases: ['soya', 'soja'], popular: false },
];

export interface QuickPreset {
  id: string;
  label: string;
  items: string[];
}

export const QUICK_PRESETS: QuickPreset[] = [
  {
    id: 'almuerzo-res',
    label: 'Res, papas y arroz',
    items: ['Carne de res', 'Papas', 'Arroz'],
  },
  {
    id: 'pollo-casero',
    label: 'Pollo, arroz y zanahoria',
    items: ['Pollo', 'Arroz', 'Zanahoria', 'Pimentón'],
  },
  {
    id: 'cena-rapida',
    label: 'Huevos, papas y queso',
    items: ['Huevos', 'Papas', 'Queso', 'Tomate'],
  },
  {
    id: 'despensa-atun',
    label: 'Atún, pasta y tomate',
    items: ['Atún en lata', 'Pasta', 'Tomate'],
  },
];

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Resuelve texto libre (incluyendo listas separadas por comas como "carne de res, papas, arroz")
 * a nombres canónicos limpios.
 */
export function parseFreeTextIngredients(rawInput: string): string[] {
  const segments = rawInput
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const resolved: string[] = [];

  for (const segment of segments) {
    const norm = normalizeText(segment);
    if (!norm) continue;

    const exactOrAlias = PANTRY_CATALOG.find(
      (item) =>
        normalizeText(item.name) === norm ||
        item.aliases.some((alias) => normalizeText(alias) === norm)
    );

    if (exactOrAlias) {
      resolved.push(exactOrAlias.name);
    } else {
      const formatted = segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
      resolved.push(formatted);
    }
  }

  return Array.from(new Set(resolved));
}
