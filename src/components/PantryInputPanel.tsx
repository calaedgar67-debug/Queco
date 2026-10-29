import React, { useMemo, useRef, useState } from 'react';
import { Check, Plus, Search, Trash2, X } from 'lucide-react';
import {
  CATEGORY_LABELS,
  PANTRY_CATALOG,
  QUICK_PRESETS,
  normalizeText,
  parseFreeTextIngredients,
} from '../data/pantryCatalog';
import type { IngredientCategory } from '../types/queco';

interface PantryInputPanelProps {
  selectedIngredients: string[];
  onToggleIngredient: (name: string) => void;
  onAddMultipleIngredients: (names: string[]) => void;
  onReplaceAllIngredients: (names: string[]) => void;
  onClearIngredients: () => void;
  onSubmitSearch: () => void;
  isGenerating: boolean;
}

const CATEGORIES: IngredientCategory[] = [
  'proteinas',
  'verduras',
  'carbohidratos',
  'lacteos_otros',
];

export function PantryInputPanel({
  selectedIngredients,
  onToggleIngredient,
  onAddMultipleIngredients,
  onReplaceAllIngredients,
  onClearIngredients,
  onSubmitSearch,
  isGenerating,
}: PantryInputPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [activeCategory, setActiveCategory] = useState<IngredientCategory>('proteinas');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizedSelectedSet = useMemo(
    () => new Set(selectedIngredients.map((item) => normalizeText(item))),
    [selectedIngredients]
  );

  const isSelected = (name: string) => normalizedSelectedSet.has(normalizeText(name));

  const currentFragment = useMemo(() => {
    const parts = inputValue.split(',');
    return (parts[parts.length - 1] || '').trim();
  }, [inputValue]);

  const autocompleteMatches = useMemo(() => {
    const normQuery = normalizeText(currentFragment);
    if (!normQuery || normQuery.length < 1) return [];

    return PANTRY_CATALOG.filter((item) => {
      if (isSelected(item.name)) return false;
      const matchesName = normalizeText(item.name).includes(normQuery);
      const matchesAlias = item.aliases.some((alias) => normalizeText(alias).includes(normQuery));
      return matchesName || matchesAlias;
    }).slice(0, 6);
  }, [currentFragment, normalizedSelectedSet]);

  const handleAddFromInput = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const parsed = parseFreeTextIngredients(inputValue);
    if (parsed.length > 0) {
      onAddMultipleIngredients(parsed);
      setInputValue('');
      inputRef.current?.focus();
    }
  };

  const handleSelectAutocomplete = (canonicalName: string) => {
    const parts = inputValue.split(',');
    if (parts.length > 1) {
      const earlier = parts.slice(0, -1).join(',');
      const parsedEarlier = parseFreeTextIngredients(earlier);
      onAddMultipleIngredients([...parsedEarlier, canonicalName]);
    } else {
      onAddMultipleIngredients([canonicalName]);
    }
    setInputValue('');
    inputRef.current?.focus();
  };

  const categoryItems = useMemo(
    () => PANTRY_CATALOG.filter((item) => item.category === activeCategory),
    [activeCategory]
  );

  return (
    <section
      aria-labelledby="pantry-heading"
      className="bg-white rounded-3xl border border-queco-border shadow-[0_2px_18px_rgba(38,27,22,0.035)] p-5 sm:p-7"
    >
      <div className="mb-6">
        <p className="text-xs font-semibold text-queco-sage mb-1.5">
          ¿Qué cocino? · Tu despensa al instante
        </p>
        <h1
          id="pantry-heading"
          className="font-display text-2xl sm:text-3xl font-bold text-queco-ink tracking-tight"
        >
          Ingresa lo que tienes a mano
        </h1>
        <p className="mt-1.5 text-sm sm:text-base text-queco-body leading-relaxed">
          Escribe varios ingredientes separados por coma o toca tus insumos por categoría con una sola mano.
        </p>
      </div>

      {/* a) Barra de texto libre con autocompletado inteligente */}
      <form onSubmit={handleAddFromInput} className="relative mb-6">
        <label htmlFor="ingredient-free-input" className="sr-only">
          Escribir ingredientes disponibles
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="w-5 h-5 text-queco-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              ref={inputRef}
              id="ingredient-free-input"
              type="text"
              value={inputValue}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => {
                window.setTimeout(() => setIsInputFocused(false), 160);
              }}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ej. carne de res, papas, arroz..."
              autoComplete="off"
              className="w-full min-h-[48px] pl-11 pr-10 py-2.5 text-base bg-queco-canvas border border-queco-border-strong rounded-2xl text-queco-ink placeholder:text-queco-muted focus:bg-white focus:border-queco-terracotta focus:outline-none transition-colors"
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => setInputValue('')}
                aria-label="Borrar texto escrito"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center absolute right-1 top-1/2 -translate-y-1/2 text-queco-muted hover:text-queco-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="min-h-[48px] px-4 sm:px-5 rounded-2xl bg-queco-ink text-white text-sm font-semibold hover:bg-[#3A2A23] disabled:opacity-35 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir</span>
          </button>
        </div>

        {/* Menú desplegable de autocompletado inteligente */}
        {isInputFocused && autocompleteMatches.length > 0 && (
          <div
            role="listbox"
            aria-label="Sugerencias de ingredientes"
            className="absolute left-0 right-0 top-full mt-2 z-20 bg-white border border-queco-border rounded-2xl shadow-lg shadow-queco-ink/8 py-1.5 overflow-hidden"
          >
            {autocompleteMatches.map((match) => (
              <button
                key={match.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelectAutocomplete(match.name)}
                className="w-full min-h-[44px] px-4 py-2 text-left flex items-center justify-between hover:bg-queco-terracotta-soft transition-colors cursor-pointer"
              >
                <span className="text-sm font-medium text-queco-ink">{match.name}</span>
                <span className="text-xs text-queco-muted">
                  {CATEGORY_LABELS[match.category]} · Tocar para añadir
                </span>
              </button>
            ))}
          </div>
        )}
      </form>

      {/* b) Botones de selección rápida por categorías */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-queco-ink">Selección rápida por categoría</h2>
          <span className="text-xs text-queco-muted">Un toque para marcar</span>
        </div>

        {/* Control segmentado interactivo de categorías */}
        <div
          role="tablist"
          aria-label="Categorías de insumos"
          className="flex items-center gap-1 p-1 bg-queco-subtle rounded-2xl overflow-x-auto mb-4"
        >
          {CATEGORIES.map((category) => {
            const active = activeCategory === category;
            const shortLabel =
              category === 'carbohidratos'
                ? 'Granos y Carbos'
                : category === 'lacteos_otros'
                  ? 'Lácteos y Otros'
                  : CATEGORY_LABELS[category];
            return (
              <button
                key={category}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setActiveCategory(category)}
                className={`min-h-[44px] flex-1 px-3 py-2 text-xs sm:text-sm font-medium rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white text-queco-ink shadow-xs font-semibold'
                    : 'text-queco-body hover:text-queco-ink'
                }`}
              >
                {shortLabel}
              </button>
            );
          })}
        </div>

        {/* Grilla táctil (>=44px hitbox) de insumos de la categoría activa */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categoryItems.map((ingredient) => {
            const active = isSelected(ingredient.name);
            return (
              <button
                key={ingredient.id}
                type="button"
                onClick={() => onToggleIngredient(ingredient.name)}
                aria-pressed={active}
                className={`min-h-[46px] px-3.5 py-2 rounded-xl border text-left text-sm font-medium flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                  active
                    ? 'bg-queco-terracotta border-queco-terracotta text-white'
                    : 'bg-queco-canvas/80 border-queco-border text-queco-ink hover:bg-queco-subtle hover:border-queco-border-strong'
                }`}
              >
                <span className="truncate">{ingredient.name}</span>
                {active ? (
                  <Check className="w-4 h-4 shrink-0 text-white" />
                ) : (
                  <Plus className="w-4 h-4 shrink-0 text-queco-muted" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Canasta activa de insumos seleccionados */}
      <div className="pt-5 border-t border-queco-border">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="text-sm font-semibold text-queco-ink tabular-nums">
            En tu cocina ({selectedIngredients.length})
          </div>
          {selectedIngredients.length > 0 && (
            <button
              type="button"
              onClick={onClearIngredients}
              className="min-h-[44px] px-2 text-xs font-medium text-queco-muted hover:text-queco-terracotta flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciar lista</span>
            </button>
          )}
        </div>

        {selectedIngredients.length === 0 ? (
          <div className="py-4 px-4 rounded-2xl bg-queco-canvas border border-dashed border-queco-border-strong text-sm text-queco-body">
            Aún no has marcado ingredientes. Elige algunos arriba o prueba una combinación frecuente:
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 mb-5">
            {selectedIngredients.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onToggleIngredient(item)}
                title={`Quitar ${item}`}
                className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-queco-terracotta-soft border border-queco-terracotta-border hover:bg-[#FAE6DC] text-queco-ink text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>{item}</span>
                <X className="w-3.5 h-3.5 text-queco-terracotta" />
              </button>
            ))}
          </div>
        )}

        {/* Combinaciones rápidas cotidianas */}
        <div className="mb-5">
          <p className="text-xs text-queco-muted mb-2">Combinaciones cotidianas de prueba rápida:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onReplaceAllIngredients(preset.items)}
                className="min-h-[40px] px-3 py-1.5 rounded-xl border border-queco-border bg-white text-xs font-medium text-queco-body hover:border-queco-terracotta hover:text-queco-terracotta transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Botón CTA Principal en zona natural del pulgar */}
        <button
          type="button"
          onClick={onSubmitSearch}
          disabled={selectedIngredients.length === 0 || isGenerating}
          className="w-full min-h-[52px] px-6 py-3 rounded-2xl bg-queco-terracotta hover:bg-queco-terracotta-hover shadow-sm shadow-queco-terracotta/20 disabled:opacity-45 disabled:cursor-not-allowed text-white font-semibold text-base transition-all active:scale-[0.99] cursor-pointer"
        >
          {isGenerating
            ? 'Analizando despensa y creando menú...'
            : `Descubrir qué cocinar (${selectedIngredients.length} ${selectedIngredients.length === 1 ? 'insumo' : 'insumos'})`}
        </button>
      </div>
    </section>
  );
}
