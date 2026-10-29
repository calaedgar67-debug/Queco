export type IngredientCategory =
  | 'proteinas'
  | 'verduras'
  | 'carbohidratos'
  | 'lacteos_otros';

export interface CatalogIngredient {
  id: string;
  name: string;
  category: IngredientCategory;
  aliases: string[];
  popular?: boolean;
}

export type DishArchetype = 'stew' | 'rice' | 'skillet';

export type DishPhotoKey =
  | 'estofado_res_papas'
  | 'salteado_res_papas_arroz'
  | 'arroz_res_papas'
  | 'pastel_papa_carne'
  | 'arroz_pollo_verduras'
  | 'pollo_sudado_arroz'
  | 'pasta_roja_atun'
  | 'pasta_cremosa_pollo'
  | 'tortilla_papas_huevos'
  | 'huevos_tomate_queso'
  | 'guiso_lentejas_papas'
  | 'custom_card';

export interface SuggestedRecipe {
  id: string;
  title: string;
  subtitle: string;
  prepTimeMinutes: number;
  difficulty: 'Fácil' | 'Media';
  servings: number;
  archetype: DishArchetype;
  photoKey?: DishPhotoKey;
  imageUrl?: string;
  matchedIngredients: string[];
  minimalMissingIngredients: {
    items: string[];
    culinaryReason: string;
  };
  steps: string[];
  chefTip: string;
  affinityScore: number;
}

export type ActiveTab = 'cocinar' | 'sugerencias' | 'guardadas' | 'arquitectura';
