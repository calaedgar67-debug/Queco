import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  HelpCircle,
  Play,
  X,
} from 'lucide-react';
import type { SuggestedRecipe } from '../types/queco';
import { buildYoutubeAskUrl, buildYoutubeRecipeUrl } from '../utils/youtube';
import { DishImage } from './DishImage';

interface RecipeDetailModalProps {
  recipe: SuggestedRecipe | null;
  onClose: () => void;
}

const YOUTUBE_ASK_TOPICS = [
  { id: 'general', label: 'Receta completa', query: '' },
  { id: 'punto', label: 'Punto exacto de cocción', query: 'trucos tiempo de coccion' },
  { id: 'salsa', label: 'Cómo espesar o dar sabor', query: 'como dar mas sabor casero' },
];

export function RecipeDetailModal({ recipe, onClose }: RecipeDetailModalProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [selectedAskTopic, setSelectedAskTopic] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    setCompletedSteps(new Set());
    setSelectedAskTopic('');
    setCopiedUrl(false);
  }, [recipe?.id]);

  useEffect(() => {
    if (!recipe) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [recipe, onClose]);

  if (!recipe) return null;

  const primaryYoutubeUrl = buildYoutubeRecipeUrl(recipe.title);
  const askYoutubeUrl = buildYoutubeAskUrl(recipe.title, selectedAskTopic);
  const hasMissing = recipe.minimalMissingIngredients.items.length > 0;

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(primaryYoutubeUrl);
      setCopiedUrl(true);
      window.setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      setCopiedUrl(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-recipe-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#261B16]/55 backdrop-blur-xs p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl max-h-[92vh] bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-queco-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Indicador de arrastre móvil + barra superior */}
        <div className="pt-2.5 pb-2 px-5 border-b border-queco-border flex items-center justify-between bg-white shrink-0">
          <div className="sm:hidden w-10 h-1.5 bg-queco-border-strong rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
          <div className="text-xs text-queco-muted tabular-nums pt-2 sm:pt-0">
            {recipe.prepTimeMinutes} min · Dificultad {recipe.difficulty.toLowerCase()} · {recipe.servings} porciones
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar receta"
            className="min-h-[44px] min-w-[44px] -mr-2 rounded-xl flex items-center justify-center text-queco-muted hover:text-queco-ink hover:bg-queco-subtle transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo desplazable */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
            <div className="sm:col-span-5 rounded-2xl overflow-hidden bg-queco-subtle">
              <DishImage recipe={recipe} alt={recipe.title} className="w-full h-44" />
            </div>
            <div className="sm:col-span-7">
              <h2
                id="modal-recipe-title"
                className="font-display text-2xl font-bold text-queco-ink leading-tight"
              >
                {recipe.title}
              </h2>
              <p className="mt-2 text-sm text-queco-body leading-relaxed">{recipe.subtitle}</p>
              <p className="mt-3 text-xs sm:text-sm text-queco-body">
                <span className="font-semibold text-queco-ink">Insumos principales: </span>
                {recipe.matchedIngredients.join(', ')}
              </p>
            </div>
          </div>

          {/* Bloque de insumos adicionales mínimos */}
          <div
            className={`rounded-2xl border p-4 ${
              hasMissing
                ? 'border-queco-gold-border bg-queco-gold-soft'
                : 'border-queco-sage-border bg-queco-sage-soft'
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className={`w-5 h-5 mt-0.5 shrink-0 ${
                  hasMissing ? 'text-queco-gold' : 'text-queco-sage'
                }`}
              />
              <div className="text-sm leading-relaxed">
                <p className={`font-semibold ${hasMissing ? 'text-queco-gold' : 'text-queco-sage'}`}>
                  {hasMissing
                    ? `Insumos adicionales mínimos sugeridos: ${recipe.minimalMissingIngredients.items.join(', ')}`
                    : 'No necesitas comprar nada adicional'}
                </p>
                <p className="mt-0.5 text-queco-ink/90">
                  {recipe.minimalMissingIngredients.culinaryReason}
                </p>
              </div>
            </div>
          </div>

          {/* Resumen de pasos clave (interactivos para marcar mientras cocinas) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg font-bold text-queco-ink">
                Resumen paso a paso
              </h3>
              <span className="text-xs text-queco-muted tabular-nums">
                {completedSteps.size} de {recipe.steps.length} completados
              </span>
            </div>

            <ol className="divide-y divide-queco-border border border-queco-border rounded-2xl overflow-hidden">
              {recipe.steps.map((step, index) => {
                const done = completedSteps.has(index);
                return (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() => toggleStep(index)}
                      className={`w-full min-h-[56px] p-4 text-left flex items-start gap-3.5 transition-colors cursor-pointer ${
                        done
                          ? 'bg-queco-canvas text-queco-muted'
                          : 'bg-white hover:bg-queco-canvas/70 text-queco-ink'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 mt-0.5 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 tabular-nums border ${
                          done
                            ? 'bg-queco-sage border-queco-sage text-white'
                            : 'border-queco-border-strong text-queco-ink bg-queco-canvas'
                        }`}
                      >
                        {done ? <Check className="w-3.5 h-3.5" /> : index + 1}
                      </span>
                      <span className={`text-sm leading-relaxed ${done ? 'line-through' : ''}`}>
                        {step}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Consejo casero */}
          <div className="rounded-2xl bg-queco-canvas border border-queco-border p-4 text-sm text-queco-body">
            <span className="font-semibold text-queco-ink">Secreto de cocina casera: </span>
            {recipe.chefTip}
          </div>

          {/* Integración directa YouTube & YouTube Ask con URL dinámica */}
          <div className="rounded-2xl border border-queco-border p-4 sm:p-5 space-y-4 bg-white">
            <div>
              <h3 className="font-display text-base font-bold text-queco-ink">
                Guía en video · YouTube & YouTube Ask
              </h3>
              <p className="text-xs sm:text-sm text-queco-body mt-0.5">
                Abre directamente los mejores videos paso a paso o filtra una duda puntual sobre esta receta.
              </p>
            </div>

            {/* Botón Principal solicitado: Ver cómo preparar en YouTube */}
            <a
              href={primaryYoutubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-queco-terracotta hover:bg-queco-terracotta-hover shadow-xs shadow-queco-terracotta/20 text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Ver cómo preparar en YouTube</span>
              <ExternalLink className="w-4 h-4 opacity-85" />
            </a>

            {/* Consulta enfocada estilo YouTube Ask */}
            <div className="pt-3 border-t border-queco-border/70 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-queco-body">
                  ¿Tienes una duda específica mientras cocinas?
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {YOUTUBE_ASK_TOPICS.map((topic) => {
                  const active = selectedAskTopic === topic.query;
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => setSelectedAskTopic(topic.query)}
                      className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-queco-ink border-queco-ink text-white'
                          : 'bg-queco-canvas border-queco-border text-queco-body hover:border-queco-terracotta hover:text-queco-ink'
                      }`}
                    >
                      {topic.label}
                    </button>
                  );
                })}
              </div>

              <a
                href={askYoutubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border border-queco-border-strong hover:border-queco-terracotta text-queco-ink hover:text-queco-terracotta text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <HelpCircle className="w-4 h-4 opacity-75" />
                <span>Consultar en YouTube Ask</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-75" />
              </a>
            </div>

            {/* Vista transparente de la URL dinámica generada */}
            <div className="pt-2 flex items-center justify-between gap-2 bg-queco-canvas rounded-xl px-3 py-2 border border-queco-border">
              <code className="font-mono text-[11px] text-queco-body truncate">
                {primaryYoutubeUrl}
              </code>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-medium text-queco-ink hover:bg-queco-subtle flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-queco-sage" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copiado' : 'Copiar URL'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
