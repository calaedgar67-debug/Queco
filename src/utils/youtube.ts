/**
 * Normaliza el nombre de la receta para construir una consulta limpia, legible
 * y compatible con el estándar de búsqueda de YouTube:
 * https://www.youtube.com/results?search_query=como+preparar+[nombre_de_la_receta]+paso+a+paso
 */
export function formatRecipeSearchSlug(recipeName: string): string {
  return recipeName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim()
    .replace(/\s+/g, '+');
}

/**
 * Construye la URL dinámica exacta solicitada:
 * https://www.youtube.com/results?search_query=como+preparar+[nombre_de_la_receta]+paso+a+paso
 */
export function buildYoutubeRecipeUrl(recipeName: string): string {
  const recipeSlug = formatRecipeSearchSlug(recipeName || 'receta casera');
  return `https://www.youtube.com/results?search_query=como+preparar+${recipeSlug}+paso+a+paso`;
}

/**
 * Construye una consulta enfocada para resolver dudas puntuales de cocción en YouTube / YouTube Ask
 * manteniendo la estructura de búsqueda dinámica.
 */
export function buildYoutubeAskUrl(recipeName: string, specificTopic?: string): string {
  const recipeSlug = formatRecipeSearchSlug(recipeName || 'receta casera');
  if (!specificTopic) {
    return `https://www.youtube.com/results?search_query=como+preparar+${recipeSlug}+paso+a+paso`;
  }
  const topicSlug = formatRecipeSearchSlug(specificTopic);
  return `https://www.youtube.com/results?search_query=como+preparar+${recipeSlug}+paso+a+paso+${topicSlug}`;
}
