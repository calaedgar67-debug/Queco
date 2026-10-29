import { AlertCircle, Bookmark, ChevronRight, ExternalLink, RefreshCw } from 'lucide-react';
import type { SuggestedRecipe } from '../types/queco';
import { buildYoutubeRecipeUrl } from '../utils/youtube';
import { DishImage } from './DishImage';

interface RecipeSuggestionsListProps {
  recipes: SuggestedRecipe[];
  selectedIngredients: string[];
  isGenerating: boolean;
  preferenceFilter: 'todos' | 'rapido' | 'una_olla';
  onChangePreferenceFilter: (filter: 'todos' | 'rapido' | 'una_olla') => void;
  onSelectRecipe: (recipe: SuggestedRecipe) => void;
  savedIds: Set<string>;
  onToggleSave: (recipe: SuggestedRecipe) => void;
  onRegenerate: () => void;
}

export function RecipeSuggestionsList({
  recipes,
  selectedIngredients,
  isGenerating,
  preferenceFilter,
  onChangePreferenceFilter,
  onSelectRecipe,
  savedIds,
  onToggleSave,
  onRegenerate,
}: RecipeSuggestionsListProps) {
  const filters: { id: 'todos' | 'rapido' | 'una_olla'; label: string }[] = [
    { id: 'todos', label: 'Todas las opciones' },
    { id: 'rapido', label: 'Rápidas (≤ 25 min)' },
    { id: 'una_olla', label: 'Una sola olla / sartén' },
  ];

  return (
    <section aria-labelledby="suggestions-heading" className="space-y-6">
      {/* Encabezado y barra de filtro funcional */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-queco-sage tabular-nums">
            Menú sugerido · {recipes.length} {recipes.length === 1 ? 'alternativa' : 'alternativas'} posibles
          </p>
          <h2
            id="suggestions-heading"
            className="font-display text-2xl sm:text-3xl font-bold text-queco-ink tracking-tight mt-0.5"
          >
            Platos ideales con tu despensa
          </h2>
        </div>

        <button
          type="button"
          onClick={onRegenerate}
          disabled={isGenerating || selectedIngredients.length === 0}
          className="self-start sm:self-auto min-h-[44px] px-3.5 py-2 rounded-xl border border-queco-border bg-white text-sm font-medium text-queco-body hover:text-queco-terracotta hover:border-queco-terracotta disabled:opacity-50 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin text-queco-terracotta' : ''}`} />
          <span>Nuevas ideas</span>
        </button>
      </div>

      {/* Control segmentado de preferencia de cocción */}
      <div className="flex items-center gap-1 p-1 bg-queco-subtle rounded-2xl w-full sm:w-fit overflow-x-auto">
        {filters.map((f) => {
          const active = preferenceFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onChangePreferenceFilter(f.id)}
              className={`min-h-[42px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-white text-queco-ink font-semibold shadow-xs'
                  : 'text-queco-body hover:text-queco-ink'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Estado vacío si borraron todos los ingredientes */}
      {selectedIngredients.length === 0 ? (
        <div className="bg-white rounded-3xl border border-queco-border shadow-[0_2px_18px_rgba(38,27,22,0.035)] overflow-hidden">
          <DishImage
            isHero
            alt="Mesa de cocina iluminada con ingredientes frescos"
            className="w-full h-52 sm:h-64"
          />
          <div className="p-6 sm:p-8">
            <h3 className="font-display text-xl font-bold text-queco-ink">
              Dinos qué tienes en la nevera o alacena
            </h3>
            <p className="mt-2 text-sm sm:text-base text-queco-body max-w-xl leading-relaxed">
              Selecciona al menos un ingrediente en el panel para que Queco arme de 3 a 4 opciones caseras, te avise si te falta algún condimento mínimo y te lleve directo al paso a paso en YouTube.
            </p>
          </div>
        </div>
      ) : isGenerating ? (
        <div className="space-y-4" aria-live="polite">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-white rounded-3xl border border-queco-border p-6 animate-pulse space-y-4"
            >
              <div className="h-4 w-44 bg-queco-subtle rounded" />
              <div className="h-6 w-3/4 bg-queco-subtle rounded" />
              <div className="h-16 w-full bg-queco-canvas rounded-2xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {recipes.map((recipe, index) => {
            const isSaved = savedIds.has(recipe.id);
            const youtubeUrl = buildYoutubeRecipeUrl(recipe.title);
            const hasMissing = recipe.minimalMissingIngredients.items.length > 0;

            return (
              <article
                key={recipe.id}
                className="bg-white rounded-3xl border border-queco-border shadow-[0_2px_18px_rgba(38,27,22,0.03)] overflow-hidden transition-colors hover:border-queco-border-strong"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 items-stretch">
                  {/* Imagen culinaria literal verificada */}
                  <div className="sm:col-span-4 relative min-h-[190px] sm:min-h-full bg-queco-subtle overflow-hidden">
                    <DishImage
                      recipe={recipe}
                      alt={recipe.title}
                      className="w-full h-52 sm:h-full"
                    />
                  </div>

                  {/* Contenido principal de la alternativa */}
                  <div className="sm:col-span-8 min-w-0 p-5 sm:p-6 flex flex-col justify-between">
                    <div>
                      {/* Metadatos limpios sin cajas tipo píldora (Zero-Pill Discipline) */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-queco-muted tabular-nums">
                          <span className="font-semibold text-queco-terracotta">Opción 0{index + 1}</span>
                          <span aria-hidden="true">·</span>
                          <span>{recipe.prepTimeMinutes} min</span>
                          <span aria-hidden="true">·</span>
                          <span>Dificultad {recipe.difficulty.toLowerCase()}</span>
                          <span aria-hidden="true">·</span>
                          <span>{recipe.servings} porciones</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onToggleSave(recipe)}
                          aria-label={isSaved ? 'Quitar de recetas guardadas' : 'Guardar receta'}
                          className={`min-h-[44px] min-w-[44px] -my-2 -mr-2 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                            isSaved
                              ? 'text-queco-terracotta bg-queco-terracotta-soft'
                              : 'text-queco-muted hover:text-queco-terracotta hover:bg-queco-subtle'
                          }`}
                        >
                          <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      <h3 className="font-display text-xl sm:text-2xl font-bold text-queco-ink mt-1">
                        {recipe.title}
                      </h3>
                      <p className="mt-1 text-sm text-queco-body leading-relaxed">
                        {recipe.subtitle}
                      </p>

                      {/* Ingredientes aprovechados */}
                      <p className="mt-3 text-xs sm:text-sm text-queco-body">
                        <span className="font-semibold text-queco-ink">Aprovechas de tu cocina: </span>
                        {recipe.matchedIngredients.join(', ')}
                      </p>

                      {/* Destacado claro de Insumos Adicionales Mínimos sintonizado con Miel Dorada / Salvia */}
                      <div
                        className={`mt-4 rounded-2xl border p-3.5 ${
                          hasMissing
                            ? 'border-queco-gold-border bg-queco-gold-soft'
                            : 'border-queco-sage-border bg-queco-sage-soft'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <AlertCircle
                            aria-hidden="true"
                            className={`w-4 h-4 mt-0.5 shrink-0 ${
                              hasMissing ? 'text-queco-gold' : 'text-queco-sage'
                            }`}
                          />
                          <div className="text-xs sm:text-sm leading-relaxed">
                            <span
                              className={`font-semibold ${
                                hasMissing ? 'text-queco-gold' : 'text-queco-sage'
                              }`}
                            >
                              {hasMissing
                                ? `Insumos adicionales mínimos (${recipe.minimalMissingIngredients.items.join(', ')}): `
                                : 'Despensa completa: '}
                            </span>
                            <span className="text-queco-ink/90">
                              {recipe.minimalMissingIngredients.culinaryReason}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Acciones táctiles (>=44px) */}
                    <div className="mt-5 pt-4 border-t border-queco-border/70 flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => onSelectRecipe(recipe)}
                        className="min-h-[44px] px-4 py-2 rounded-xl bg-queco-ink hover:bg-[#3A2A23] text-white text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <span>Ver pasos ({recipe.steps.length})</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <a
                        href={youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[44px] px-4 py-2 rounded-xl border border-queco-border-strong bg-white hover:border-queco-terracotta text-queco-ink hover:text-queco-terracotta text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
                      >
                        <span>Ver en YouTube</span>
                        <ExternalLink className="w-4 h-4 opacity-75" />
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
