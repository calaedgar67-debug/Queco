import { useEffect, useState } from 'react';
import { CookingPot, Flame, Soup, UtensilsCrossed } from 'lucide-react';
import type { DishPhotoKey, SuggestedRecipe } from '../types/queco';
import { resolveLiteralPhotoKey } from '../utils/photoMatcher';

import heroKitchenImg from '../assets/images/queco_kitchen_hero_1793272505903.jpg';
import estofadoResImg from '../assets/images/dish_protein_stew_1793272507696.jpg';
import arrozPolloImg from '../assets/images/dish_rice_skillet_1793272508638.jpg';
import tortillaPapasImg from '../assets/images/dish_veggie_egg_1793272508451.jpg';
import salteadoResImg from '../assets/images/salteado_res_papas_1793275766752.jpg';
import arrozResImg from '../assets/images/arroz_res_papas_1793275767720.jpg';
import pastelPapaCarneImg from '../assets/images/pastel_papa_carne_1793275768915.jpg';
import polloSudadoImg from '../assets/images/pollo_sudado_arroz_1793275770891.jpg';
import pastaRojaAtunImg from '../assets/images/pasta_roja_atun_1793275772116.jpg';
import pastaCremosaPolloImg from '../assets/images/pasta_cremosa_pollo_1793275773244.jpg';
import huevosTomateQuesoImg from '../assets/images/huevos_tomate_queso_1793275774672.jpg';
import guisoLentejasImg from '../assets/images/guiso_lentejas_papas_1793275774997.jpg';

const LITERAL_PHOTO_MAP: Record<Exclude<DishPhotoKey, 'custom_card'> | 'hero', string> = {
  hero: heroKitchenImg,
  estofado_res_papas: estofadoResImg,
  salteado_res_papas_arroz: salteadoResImg,
  arroz_res_papas: arrozResImg,
  pastel_papa_carne: pastelPapaCarneImg,
  arroz_pollo_verduras: arrozPolloImg,
  pollo_sudado_arroz: polloSudadoImg,
  pasta_roja_atun: pastaRojaAtunImg,
  pasta_cremosa_pollo: pastaCremosaPolloImg,
  tortilla_papas_huevos: tortillaPapasImg,
  huevos_tomate_queso: huevosTomateQuesoImg,
  guiso_lentejas_papas: guisoLentejasImg,
};

interface DishImageProps {
  recipe?: Pick<
    SuggestedRecipe,
    'title' | 'subtitle' | 'matchedIngredients' | 'archetype' | 'photoKey' | 'imageUrl'
  >;
  isHero?: boolean;
  alt: string;
  className?: string;
}

export function DishImage({ recipe, isHero = false, alt, className = '' }: DishImageProps) {
  const [dynamicFailed, setDynamicFailed] = useState(false);
  const [staticFailed, setStaticFailed] = useState(false);

  const dynamicSrc = recipe
    ? recipe.imageUrl || `/api/recipe-image?title=${encodeURIComponent(recipe.title)}`
    : '';

  useEffect(() => {
    setDynamicFailed(false);
    setStaticFailed(false);
  }, [dynamicSrc, recipe?.title]);

  if (isHero) {
    if (staticFailed) {
      return (
        <div
          className={`flex flex-col items-center justify-center bg-gradient-to-br from-queco-subtle via-queco-terracotta-soft to-queco-sage-soft text-queco-body p-6 ${className}`}
          role="img"
          aria-label={alt}
        >
          <UtensilsCrossed className="w-8 h-8 text-queco-terracotta mb-2" />
          <span className="text-sm font-medium text-center">{alt}</span>
        </div>
      );
    }

    return (
      <img
        src={LITERAL_PHOTO_MAP.hero}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setStaticFailed(true)}
        className={`object-cover ${className}`}
      />
    );
  }

  const verifiedStaticKey = recipe ? resolveLiteralPhotoKey(recipe) : 'custom_card';
  if (!staticFailed && verifiedStaticKey !== 'custom_card' && LITERAL_PHOTO_MAP[verifiedStaticKey]) {
    return (
      <img
        src={LITERAL_PHOTO_MAP[verifiedStaticKey]}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setStaticFailed(true)}
        className={`object-cover ${className}`}
      />
    );
  }

  if (!dynamicFailed && dynamicSrc) {
    return (
      <img
        src={dynamicSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setDynamicFailed(true)}
        className={`object-cover ${className}`}
      />
    );
  }

  const archetype = recipe?.archetype || 'skillet';
  const VesselIcon =
    archetype === 'stew' ? Soup : archetype === 'rice' ? CookingPot : Flame;
  const methodLabel =
    archetype === 'stew'
      ? 'Preparación de olla'
      : archetype === 'rice'
        ? 'Cazuela y granos'
        : 'Preparación al sartén';
  const ingredientsPreview = recipe?.matchedIngredients?.slice(0, 4).join(' · ') || '';

  return (
    <div
      className={`flex flex-col justify-between bg-gradient-to-br from-queco-subtle via-queco-terracotta-soft/70 to-queco-gold-soft/70 p-5 border-b sm:border-b-0 sm:border-r border-queco-border ${className}`}
      role="img"
      aria-label={alt}
    >
      <div className="flex items-center justify-between text-queco-muted">
        <span className="text-[11px] font-semibold tracking-tight text-queco-terracotta">
          {methodLabel}
        </span>
        <VesselIcon className="w-5 h-5 text-queco-terracotta/80 shrink-0" />
      </div>

      <div className="my-auto py-3">
        <p className="font-display text-base sm:text-lg font-bold text-queco-ink leading-snug line-clamp-3">
          {recipe?.title || alt}
        </p>
        {ingredientsPreview && (
          <p className="mt-2 text-xs text-queco-body leading-relaxed line-clamp-2">
            {ingredientsPreview}
          </p>
        )}
      </div>

      <div className="text-[11px] text-queco-muted">Receta casera a medida</div>
    </div>
  );
}
