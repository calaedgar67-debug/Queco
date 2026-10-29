import { normalizeText } from '../data/pantryCatalog';
import type { DishPhotoKey, SuggestedRecipe } from '../types/queco';

interface PhotoRule {
  key: Exclude<DishPhotoKey, 'custom_card'>;
  matches: (titleNorm: string, fullTextNorm: string) => boolean;
}

function hasAny(text: string, terms: string[]): boolean {
  return terms.some((t) => text.includes(t));
}

function hasNone(text: string, forbidden: string[]): boolean {
  return !forbidden.some((f) => text.includes(f));
}

const DISQUALIFYING_SHAPES = [
  'arepa',
  'empanada',
  'taco',
  'burrito',
  'quesadilla',
  'sandwich',
  'sanduche',
  'croqueta',
  'hamburguesa',
  'tortita de avena',
  'panqueque',
  'crema de ',
  'sopa de ',
];

/**
 * Reglas estrictas de respaldo offline: una fotografía estática SOLO se autoriza si TODOS
 * los elementos visibles en esa foto (incluyendo acompañamientos como arroz o pasta) están
 * literalmente presentes en el plato y no se trata de otro formato (como arepas, sopas o croquetas).
 */
const STRICT_PHOTO_RULES: PhotoRule[] = [
  {
    key: 'pastel_papa_carne',
    matches: (title, full) =>
      hasNone(title, DISQUALIFYING_SHAPES) &&
      hasAny(title, ['pastel', 'pure', 'gratin']) &&
      hasAny(full, ['papa', 'patata']) &&
      hasAny(full, ['carne', 'res', 'molida']) &&
      hasNone(title, ['pollo', 'atun', 'pescado', 'lenteja', 'pasta', 'arroz']),
  },
  {
    key: 'arroz_res_papas',
    matches: (title, full) =>
      hasNone(title, DISQUALIFYING_SHAPES) &&
      title.startsWith('arroz') &&
      hasAny(full, ['carne', 'res', 'molida']) &&
      hasAny(full, ['papa']) &&
      hasNone(title, ['pollo', 'atun', 'pescado', 'pasta', 'lenteja']),
  },
  {
    key: 'salteado_res_papas_arroz',
    matches: (title, full) =>
      hasNone(title, DISQUALIFYING_SHAPES) &&
      hasAny(title, ['saltead', 'saltad']) &&
      hasAny(full, ['carne', 'res']) &&
      hasAny(full, ['papa']) &&
      hasAny(full, ['arroz']) &&
      hasNone(title, ['pollo', 'atun', 'pescado', 'lenteja', 'pasta']),
  },
  {
    key: 'estofado_res_papas',
    matches: (title, full) =>
      hasNone(title, DISQUALIFYING_SHAPES) &&
      hasAny(title, ['estofad', 'sudad', 'guis']) &&
      hasAny(full, ['carne', 'res']) &&
      hasAny(full, ['papa']) &&
      hasNone(title, ['pollo', 'atun', 'pescado', 'lenteja', 'pasta']),
  },
  {
    key: 'arroz_pollo_verduras',
    matches: (title, full) =>
      hasNone(title, DISQUALIFYING_SHAPES) &&
      title.startsWith('arroz') &&
      hasAny(full, ['pollo', 'pechuga']) &&
      hasNone(title, ['res', 'carne', 'atun', 'pasta', 'lenteja']),
  },
  {
    key: 'pollo_sudado_arroz',
    matches: (title, full) =>
      hasNone(title, DISQUALIFYING_SHAPES) &&
      hasAny(title, ['sudad', 'guis']) &&
      hasAny(full, ['pollo']) &&
      hasAny(full, ['papa']) &&
      hasAny(full, ['arroz']) &&
      hasNone(title, ['res', 'carne', 'atun', 'pasta', 'lenteja']),
  },
  {
    key: 'pasta_cremosa_pollo',
    matches: (title, full) =>
      hasNone(title, DISQUALIFYING_SHAPES) &&
      hasAny(title, ['pasta', 'espagueti', 'fideo', 'macarron', 'penne']) &&
      hasAny(full, ['pollo', 'pechuga']) &&
      hasAny(full, ['crema', 'leche', 'queso', 'blanca']) &&
      hasNone(title, ['atun', 'carne', 'res', 'lenteja', 'arroz']),
  },
  {
    key: 'pasta_roja_atun',
    matches: (title, full) =>
      hasNone(title, DISQUALIFYING_SHAPES) &&
      hasAny(title, ['pasta', 'espagueti', 'fideo']) &&
      hasAny(full, ['atun']) &&
      hasAny(full, ['tomate', 'roja']) &&
      hasNone(title, ['pollo', 'res', 'lenteja', 'arroz']),
  },
  {
    key: 'tortilla_papas_huevos',
    matches: (title, full) =>
      hasAny(title, ['tortilla']) &&
      hasAny(full, ['huevo']) &&
      hasAny(full, ['papa']) &&
      hasNone(title, ['harina', 'maiz', 'trigo', 'taco', 'carne', 'res', 'pollo', 'atun', 'pasta']),
  },
  {
    key: 'huevos_tomate_queso',
    matches: (title, full) =>
      hasNone(title, DISQUALIFYING_SHAPES) &&
      title.startsWith('huevo') &&
      hasAny(full, ['tomate']) &&
      hasAny(full, ['queso']) &&
      hasNone(title, ['carne', 'res', 'pollo', 'atun', 'pasta', 'lenteja']),
  },
  {
    key: 'guiso_lentejas_papas',
    matches: (title, full) =>
      hasNone(title, DISQUALIFYING_SHAPES) &&
      hasAny(title, ['lenteja']) &&
      hasAny(full, ['papa']) &&
      hasNone(title, ['pasta', 'pollo', 'atun', 'res']),
  },
];

export function resolveLiteralPhotoKey(
  recipe: Pick<SuggestedRecipe, 'title' | 'subtitle' | 'matchedIngredients' | 'photoKey'>
): DishPhotoKey {
  const titleNorm = normalizeText(recipe.title);
  const fullNorm = normalizeText(
    `${recipe.title} ${recipe.subtitle} ${recipe.matchedIngredients.join(' ')}`
  );

  for (const rule of STRICT_PHOTO_RULES) {
    if (rule.matches(titleNorm, fullNorm)) {
      return rule.key;
    }
  }

  return 'custom_card';
}
