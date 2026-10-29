import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark, ExternalLink, Trash2 } from 'lucide-react';
import { ArchitectureBlueprintView } from './components/ArchitectureBlueprintView';
import { DishImage } from './components/DishImage';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PantryInputPanel } from './components/PantryInputPanel';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { RecipeSuggestionsList } from './components/RecipeSuggestionsList';
import { normalizeText } from './data/pantryCatalog';
import type { ActiveTab, SuggestedRecipe } from './types/queco';
import { generateDeterministicSuggestions } from './utils/recipeEngine';
import { buildYoutubeRecipeUrl } from './utils/youtube';

const INITIAL_INGREDIENTS = ['Carne de res', 'Papas', 'Arroz'];
const SAVED_STORAGE_KEY = 'queco_saved_recipes_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('cocinar');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(INITIAL_INGREDIENTS);
  const [preferenceFilter, setPreferenceFilter] = useState<'todos' | 'rapido' | 'una_olla'>('todos');
  const [recipes, setRecipes] = useState<SuggestedRecipe[]>(() =>
    generateDeterministicSuggestions(INITIAL_INGREDIENTS)
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeRecipeModal, setActiveRecipeModal] = useState<SuggestedRecipe | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<SuggestedRecipe[]>(() => {
    try {
      const raw = window.localStorage.getItem(SAVED_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SuggestedRecipe[]) : [];
    } catch {
      return [];
    }
  });

  const suggestionsAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedRecipes));
    } catch {
      // Ignore storage quota errors in restricted frames
    }
  }, [savedRecipes]);

  const savedIds = useMemo(() => new Set(savedRecipes.map((r) => r.id)), [savedRecipes]);

  const fetchIntelligentSuggestions = useCallback(
    async (ingredientsToUse: string[], filterToUse: 'todos' | 'rapido' | 'una_olla') => {
      if (ingredientsToUse.length === 0) {
        setRecipes([]);
        return;
      }

      setIsGenerating(true);
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 12000);

      try {
        const response = await fetch('/api/suggest-recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ingredients: ingredientsToUse,
            preference: filterToUse,
          }),
          signal: controller.signal,
        });

        if (response.ok) {
          const data = (await response.json()) as { recipes?: SuggestedRecipe[] };
          if (Array.isArray(data.recipes) && data.recipes.length > 0) {
            setRecipes(data.recipes);
            return;
          }
        }

        const fallback = generateDeterministicSuggestions(ingredientsToUse);
        const filteredFallback =
          filterToUse === 'rapido'
            ? fallback.filter((r) => r.prepTimeMinutes <= 30)
            : fallback;
        setRecipes(filteredFallback.length > 0 ? filteredFallback : fallback);
      } catch {
        const fallback = generateDeterministicSuggestions(ingredientsToUse);
        const filteredFallback =
          filterToUse === 'rapido'
            ? fallback.filter((r) => r.prepTimeMinutes <= 30)
            : fallback;
        setRecipes(filteredFallback.length > 0 ? filteredFallback : fallback);
      } finally {
        window.clearTimeout(timeoutId);
        setIsGenerating(false);
      }
    },
    []
  );

  const handleToggleIngredient = (name: string) => {
    setSelectedIngredients((prev) => {
      const norm = normalizeText(name);
      const exists = prev.some((item) => normalizeText(item) === norm);
      const updated = exists
        ? prev.filter((item) => normalizeText(item) !== norm)
        : [...prev, name];

      setRecipes(generateDeterministicSuggestions(updated));
      return updated;
    });
  };

  const handleAddMultipleIngredients = (names: string[]) => {
    setSelectedIngredients((prev) => {
      const existingNorms = new Set(prev.map((item) => normalizeText(item)));
      const additions = names.filter((n) => !existingNorms.has(normalizeText(n)));
      const updated = [...prev, ...additions];
      setRecipes(generateDeterministicSuggestions(updated));
      return updated;
    });
  };

  const handleReplaceAllIngredients = (names: string[]) => {
    setSelectedIngredients(names);
    setRecipes(generateDeterministicSuggestions(names));
    void fetchIntelligentSuggestions(names, preferenceFilter);
  };

  const handleClearIngredients = () => {
    setSelectedIngredients([]);
    setRecipes([]);
  };

  const handleGenerateAndFocus = () => {
    void fetchIntelligentSuggestions(selectedIngredients, preferenceFilter);
    if (window.innerWidth < 1024) {
      setActiveTab('sugerencias');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      suggestionsAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleChangePreference = (nextFilter: 'todos' | 'rapido' | 'una_olla') => {
    setPreferenceFilter(nextFilter);
    if (selectedIngredients.length > 0) {
      void fetchIntelligentSuggestions(selectedIngredients, nextFilter);
    }
  };

  const handleToggleSaveRecipe = (recipe: SuggestedRecipe) => {
    setSavedRecipes((prev) => {
      const exists = prev.some((r) => r.id === recipe.id);
      if (exists) {
        return prev.filter((r) => r.id !== recipe.id);
      }
      return [recipe, ...prev];
    });
  };

  const handleSelectNavTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-queco-canvas text-queco-ink pb-20 md:pb-12">
      <Header
        activeTab={activeTab}
        onSelectTab={handleSelectNavTab}
        savedCount={savedRecipes.length}
        onGenerateRecipes={handleGenerateAndFocus}
        isGenerating={isGenerating}
        canGenerate={selectedIngredients.length > 0}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Vista de Recetas Guardadas */}
        {activeTab === 'guardadas' && (
          <section className="space-y-6 max-w-5xl mx-auto">
            <div>
              <p className="text-xs font-semibold text-queco-sage">Tu recetario cotidiano</p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-queco-ink mt-1">
                Platos guardados ({savedRecipes.length})
              </h1>
            </div>

            {savedRecipes.length === 0 ? (
              <div className="bg-white rounded-3xl border border-queco-border shadow-[0_2px_18px_rgba(38,27,22,0.03)] p-8 text-center space-y-4">
                <Bookmark className="w-8 h-8 text-queco-terracotta/70 mx-auto" />
                <div className="space-y-1 max-w-md mx-auto">
                  <h2 className="font-display text-lg font-bold text-queco-ink">
                    Aún no tienes platos guardados
                  </h2>
                  <p className="text-sm text-queco-body">
                    Marca el ícono de marcador en cualquiera de las sugerencias para tener tus recetas favoritas siempre a mano.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectNavTab('cocinar')}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-queco-terracotta text-white text-sm font-semibold hover:bg-queco-terracotta-hover transition-colors cursor-pointer"
                >
                  Ir a mi despensa
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {savedRecipes.map((recipe) => (
                  <article
                    key={recipe.id}
                    className="bg-white rounded-3xl border border-queco-border shadow-[0_2px_18px_rgba(38,27,22,0.03)] overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <DishImage
                        recipe={recipe}
                        alt={recipe.title}
                        className="w-full h-48"
                      />
                      <div className="p-5">
                        <p className="text-xs text-queco-muted tabular-nums">
                          {recipe.prepTimeMinutes} min · {recipe.difficulty} · {recipe.servings} porciones
                        </p>
                        <h2 className="font-display text-xl font-bold text-queco-ink mt-1">
                          {recipe.title}
                        </h2>
                        <p className="text-sm text-queco-body mt-1">{recipe.subtitle}</p>
                      </div>
                    </div>
                    <div className="px-5 pb-5 pt-3 border-t border-queco-border/70 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveRecipeModal(recipe)}
                          className="min-h-[44px] px-4 py-2 rounded-xl bg-queco-ink text-white text-xs sm:text-sm font-semibold hover:bg-[#3A2A23] transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Ver pasos
                        </button>
                        <a
                          href={buildYoutubeRecipeUrl(recipe.title)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[44px] px-3.5 py-2 rounded-xl border border-queco-border-strong text-queco-ink hover:border-queco-terracotta hover:text-queco-terracotta text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                        >
                          <span>YouTube</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleSaveRecipe(recipe)}
                        aria-label="Eliminar de guardadas"
                        className="min-h-[44px] min-w-[44px] rounded-xl text-queco-muted hover:text-queco-terracotta hover:bg-queco-terracotta-soft flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Vista de Arquitectura UX/UI y Documentación Técnica */}
        {activeTab === 'arquitectura' && <ArchitectureBlueprintView />}

        {/* Vista Principal de Cocina: Multi-columna en Desktop, Pestañas dedicadas en Móvil */}
        {(activeTab === 'cocinar' || activeTab === 'sugerencias') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Columna Izquierda: Ingreso Ágil de Insumos */}
            <div
              className={`lg:col-span-5 lg:sticky lg:top-24 ${
                activeTab === 'sugerencias' ? 'hidden lg:block' : 'block'
              }`}
            >
              <PantryInputPanel
                selectedIngredients={selectedIngredients}
                onToggleIngredient={handleToggleIngredient}
                onAddMultipleIngredients={handleAddMultipleIngredients}
                onReplaceAllIngredients={handleReplaceAllIngredients}
                onClearIngredients={handleClearIngredients}
                onSubmitSearch={handleGenerateAndFocus}
                isGenerating={isGenerating}
              />
            </div>

            {/* Columna Derecha: Alternativas Inteligentes y Paso a Paso */}
            <div
              ref={suggestionsAnchorRef}
              className={`lg:col-span-7 ${
                activeTab === 'cocinar' ? 'mt-2 lg:mt-0' : 'block'
              }`}
            >
              <RecipeSuggestionsList
                recipes={recipes}
                selectedIngredients={selectedIngredients}
                isGenerating={isGenerating}
                preferenceFilter={preferenceFilter}
                onChangePreferenceFilter={handleChangePreference}
                onSelectRecipe={(recipe) => setActiveRecipeModal(recipe)}
                savedIds={savedIds}
                onToggleSave={handleToggleSaveRecipe}
                onRegenerate={() =>
                  void fetchIntelligentSuggestions(selectedIngredients, preferenceFilter)
                }
              />
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-14 pt-6 border-t border-queco-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-queco-muted">
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/Glossy_Terracotta_Q_Mascot_Logo_8e9e2a55.png"
            alt="Logo Queco"
            className="w-9 h-9 object-contain mix-blend-multiply shrink-0"
          />
          <p>Queco — ¿Qué Cocino? · Asistente minimalista para la cocina diaria.</p>
        </div>
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => handleSelectNavTab('cocinar')}
            className="hover:text-queco-terracotta transition-colors cursor-pointer"
          >
            Despensa
          </button>
          <button
            type="button"
            onClick={() => handleSelectNavTab('arquitectura')}
            className="hover:text-queco-terracotta transition-colors cursor-pointer"
          >
            Especificación UX y Algoritmo
          </button>
        </div>
      </footer>

      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={handleSelectNavTab}
        savedCount={savedRecipes.length}
      />

      <RecipeDetailModal
        recipe={activeRecipeModal}
        onClose={() => setActiveRecipeModal(null)}
      />
    </div>
  );
}
