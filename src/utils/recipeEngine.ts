import type { DishArchetype, DishPhotoKey, SuggestedRecipe } from '../types/queco';
import { normalizeText } from '../data/pantryCatalog';

interface RecipeTemplate {
  id: string;
  title: string;
  subtitle: string;
  prepTimeMinutes: number;
  difficulty: 'Fácil' | 'Media';
  servings: number;
  archetype: DishArchetype;
  photoKey: DishPhotoKey;
  coreIngredients: string[];
  secondaryEnhancers: string[];
  enhancerRolePhrase: string;
  steps: string[];
  chefTip: string;
}

const CURATED_TEMPLATES: RecipeTemplate[] = [
  {
    id: 'estofado-res-papas',
    title: 'Estofado casero de carne de res con papas y zanahoria',
    subtitle: 'Carne de res tierna cocinada en olla a fuego lento con papas doradas y caldo espeso.',
    prepTimeMinutes: 40,
    difficulty: 'Fácil',
    servings: 4,
    archetype: 'stew',
    photoKey: 'estofado_res_papas',
    coreIngredients: ['Carne de res', 'Papas'],
    secondaryEnhancers: ['Zanahoria', 'Cebolla', 'Ajo'],
    enhancerRolePhrase: 'armar el fondo aromático y espesar naturalmente el jugo del estofado',
    steps: [
      'Corta la carne de res en cubos medianos y las papas peladas en trozos grandes parejos.',
      'Sella la carne en olla honda con aceite caliente, cebolla y ajo picados hasta dorar.',
      'Añade las papas, zanahoria en rodajas y 2 tazas de agua caliente; tapa a fuego medio-bajo por 25 minutos.',
      'Rectifica sal, espolvorea perejil o cilantro fresco y sirve bien caliente.',
    ],
    chefTip: 'Presiona dos trocitos de papa cocida contra el borde de la olla al final para espesar la salsa sin usar harina.',
  },
  {
    id: 'saltado-res-papas-doradas',
    title: 'Salteado criollo de carne de res con papas doradas y arroz blanco',
    subtitle: 'Tiras jugosas de res salteadas con cebolla y tomate junto a papas crujientes y arroz.',
    prepTimeMinutes: 30,
    difficulty: 'Fácil',
    servings: 3,
    archetype: 'skillet',
    photoKey: 'salteado_res_papas_arroz',
    coreIngredients: ['Carne de res', 'Papas', 'Arroz'],
    secondaryEnhancers: ['Cebolla', 'Tomate', 'Ajo'],
    enhancerRolePhrase: 'lograr el juguito criollo del salteado y equilibrar el dorado de la carne',
    steps: [
      'Corta las papas en cascos o bastones y dóralas en sartén hasta que queden crujientes por fuera.',
      'Sella la carne de res en tiras a fuego alto durante 3 minutos para conservar todos sus jugos.',
      'Incorpora gajos gruesos de cebolla y tomate, salteando 2 minutos a fuego vivo.',
      'Sirve en el plato junto a las papas doradas y una porción de arroz blanco graneado.',
    ],
    chefTip: 'Seca muy bien las tiras de carne antes de llevarlas al sartén caliente para que doren rápido sin soltar agua.',
  },
  {
    id: 'arroz-campesino-res',
    title: 'Arroz atollado de carne de res y papas en una sola olla',
    subtitle: 'Arroz dorado y jugoso cocinado directamente con dados de res, papas tiernas y cilantro.',
    prepTimeMinutes: 35,
    difficulty: 'Fácil',
    servings: 4,
    archetype: 'rice',
    photoKey: 'arroz_res_papas',
    coreIngredients: ['Carne de res', 'Arroz', 'Papas'],
    secondaryEnhancers: ['Pimentón', 'Cebolla', 'Cilantro'],
    enhancerRolePhrase: 'aportar aroma fresco y color dorado al arroz en cazuela',
    steps: [
      'Dora la carne de res cortada en cubos pequeños dentro de una cazuela amplia con aceite.',
      'Suma las papas en cubos pequeños, pimentón y cebolla picada, sofriendo 4 minutos.',
      'Agrega el arroz crudo, revuelve 1 minuto y vierte 2.5 tazas de agua caliente por taza de arroz.',
      'Cocina a fuego bajo tapado por 14 minutos y corona con cilantro fresco picado al servir.',
    ],
    chefTip: 'Déjalo reposar tapado 5 minutos fuera del fuego para que cada grano absorba todo el sabor de la carne.',
  },
  {
    id: 'pastel-papa-carne',
    title: 'Pastel rústico de puré de papa relleno de carne',
    subtitle: 'Capas cremosas de papa gratinada al sartén rellenas de carne de res jugosa.',
    prepTimeMinutes: 40,
    difficulty: 'Media',
    servings: 4,
    archetype: 'skillet',
    photoKey: 'pastel_papa_carne',
    coreIngredients: ['Papas', 'Carne de res'],
    secondaryEnhancers: ['Queso', 'Mantequilla', 'Cebolla'],
    enhancerRolePhrase: 'dar cremosidad al puré y formar la costra dorada superior',
    steps: [
      'Cocina las papas en agua con sal hasta ablandar y haz un puré suave con mantequilla o leche.',
      'Pica finamente la carne de res y sofríela en sartén con cebolla hasta obtener un relleno jugoso.',
      'En un sartén amplio extiende la mitad del puré, distribuye la carne guisada y cubre con el puré restante.',
      'Espolvorea queso encima y tapa a fuego mínimo por 8 minutos hasta fundir y dorar.',
    ],
    chefTip: 'Puedes armarlo en sartén de hierro o antiadherente con tapa sin necesidad de encender el horno.',
  },
  {
    id: 'pollo-sudado-arroz',
    title: 'Pollo sudado casero con papas y arroz blanco',
    subtitle: 'Presas de pollo tiernas bañadas en salsa casera de tomate y cebolla con papas y arroz.',
    prepTimeMinutes: 38,
    difficulty: 'Fácil',
    servings: 4,
    archetype: 'stew',
    photoKey: 'pollo_sudado_arroz',
    coreIngredients: ['Pollo', 'Papas', 'Arroz'],
    secondaryEnhancers: ['Tomate', 'Cebolla', 'Ajo'],
    enhancerRolePhrase: 'preparar el hogao casero que baña el pollo y las papas',
    steps: [
      'Prepara un sofrito en olla con tomate maduro, cebolla y ajo picados durante 5 minutos.',
      'Acomoda las piezas de pollo y las papas peladas, cubriendo hasta la mitad con agua caliente.',
      'Tapa y cocina a fuego medio durante 25 minutos hasta que el pollo esté tierno y la salsa espese.',
      'Sirve acompañado de arroz blanco recién hecho y cilantro picado.',
    ],
    chefTip: 'Baña las presas de pollo con la salsa a mitad de cocción para que tomen un color dorado uniforme.',
  },
  {
    id: 'arroz-con-pollo-casero',
    title: 'Arroz con pollo casero salteado con verduras',
    subtitle: 'Clásico familiar lleno de sabor con trozos dorados de pollo, zanahoria y pimentón.',
    prepTimeMinutes: 35,
    difficulty: 'Fácil',
    servings: 4,
    archetype: 'rice',
    photoKey: 'arroz_pollo_verduras',
    coreIngredients: ['Pollo', 'Arroz'],
    secondaryEnhancers: ['Zanahoria', 'Pimentón', 'Ajo'],
    enhancerRolePhrase: 'darle el dulzor y colorido tradicional al arroz con pollo',
    steps: [
      'Corta el pollo en bocados medianos, sazónalo con ajo y dóralo bien en cazuela amplia.',
      'Retira el pollo un momento y sofríe en ese mismo fondo la zanahoria y el pimentón picados.',
      'Añade el arroz, nacara 1 minuto, incorpora el agua o caldo caliente y regresa el pollo.',
      'Cocina tapado a fuego bajo por 15 minutos hasta que el grano abra suave y suelto.',
    ],
    chefTip: 'Dorar primero el pollo en la misma cazuela donde harás el arroz multiplica el sabor casero.',
  },
  {
    id: 'pasta-cremosa-pollo',
    title: 'Pasta cremosa al sartén con pollo dorado',
    subtitle: 'Pasta corta envuelta en salsa suave de queso y crema con pechuga dorada a la pimienta.',
    prepTimeMinutes: 25,
    difficulty: 'Fácil',
    servings: 3,
    archetype: 'skillet',
    photoKey: 'pasta_cremosa_pollo',
    coreIngredients: ['Pasta', 'Pollo'],
    secondaryEnhancers: ['Crema de leche', 'Queso', 'Ajo'],
    enhancerRolePhrase: 'ligar una salsa cremosa y aterciopelada alrededor de la pasta',
    steps: [
      'Hierve la pasta en agua con sal hasta dejarla al dente y reserva media taza del agua de cocción.',
      'Sella trozos de pollo sazonados en sartén caliente con ajo picado hasta que estén bien dorados.',
      'Baja el fuego, añade crema de leche (o leche con queso) y un chorrito del agua de la pasta.',
      'Integra la pasta caliente durante 2 minutos y sirve con pimienta recién molida.',
    ],
    chefTip: 'Añade el agua caliente de la pasta poco a poco para que la salsa quede ligera y brillante.',
  },
  {
    id: 'pasta-atun-tomate',
    title: 'Pasta con atún y salsa casera de tomate fresco',
    subtitle: 'Espaguetis salteados en salsa rústica de tomate y ajo con trozos de atún.',
    prepTimeMinutes: 20,
    difficulty: 'Fácil',
    servings: 3,
    archetype: 'skillet',
    photoKey: 'pasta_roja_atun',
    coreIngredients: ['Atún en lata', 'Pasta', 'Tomate'],
    secondaryEnhancers: ['Ajo', 'Cebolla', 'Cilantro'],
    enhancerRolePhrase: 'perfumar la salsa de tomate fresco y realzar el atún',
    steps: [
      'Cocina la pasta en agua con sal hasta que esté al dente y reserva un poco de su agua.',
      'Sofríe tomate maduro rallado o picado con ajo y cebolla durante 6 minutos hasta formar salsa.',
      'Agrega el atún escurrido en trozos grandes y apaga el fuego para mantenerlo jugoso.',
      'Mezcla la pasta con la salsa roja y termina con hierbas frescas picadas.',
    ],
    chefTip: 'Incorpora el atún al final con el fuego suave para que conserve su textura tierna en trozos.',
  },
  {
    id: 'tortilla-espanola-papas',
    title: 'Tortilla casera de papas doradas y huevos',
    subtitle: 'Tortilla gruesa y jugosa al sartén con papas tiernas y verduras frescas.',
    prepTimeMinutes: 25,
    difficulty: 'Fácil',
    servings: 3,
    archetype: 'skillet',
    photoKey: 'tortilla_papas_huevos',
    coreIngredients: ['Huevos', 'Papas'],
    secondaryEnhancers: ['Cebolla', 'Tomate', 'Aguacate'],
    enhancerRolePhrase: 'darle jugosidad interna y acompañarla fresca en el plato',
    steps: [
      'Corta las papas en cubos pequeños o láminas finas y cocínalas en sartén a fuego medio hasta ablandar.',
      'Bate los huevos con una pizca de sal y mezcla con las papas tibias dejando reposar 3 minutos.',
      'Vierte en sartén antiadherente y cocina 4 minutos a fuego bajo hasta cuajar bordes.',
      'Voltea con ayuda de un plato llano, dora 3 minutos más y sirve en triángulos.',
    ],
    chefTip: 'Dejar reposar la papa tibia dentro del huevo batido antes de cuajar hace que quede mucho más suave.',
  },
  {
    id: 'huevos-cazuela-tomate-queso',
    title: 'Huevos caseros al sartén con tomate y queso fundido',
    subtitle: 'Huevos pochados directamente sobre sofrito jugoso de tomate, cebolla y queso derretido.',
    prepTimeMinutes: 15,
    difficulty: 'Fácil',
    servings: 2,
    archetype: 'skillet',
    photoKey: 'huevos_tomate_queso',
    coreIngredients: ['Huevos', 'Tomate', 'Queso'],
    secondaryEnhancers: ['Cebolla', 'Cilantro', 'Pan'],
    enhancerRolePhrase: 'redondear el sofrito jugoso y acompañar la salsa caliente',
    steps: [
      'Sofríe tomate maduro y cebolla en cubitos en un sartén mediano por 5 minutos hasta que suelten jugo.',
      'Haz pequeños huecos en el sofrito y casca los huevos directamente encima con cuidado.',
      'Distribuye el queso alrededor, tapa el sartén y cocina a fuego bajo de 4 a 5 minutos.',
      'Destapa cuando la clara esté firme y el queso fundido; espolvorea cilantro fresco.',
    ],
    chefTip: 'Cocina con tapa a fuego mínimo para que el vapor funda el queso dejando la yema tierna.',
  },
  {
    id: 'lentejas-guisadas-caseras',
    title: 'Guiso casero de lentejas con papas, zanahoria y arroz',
    subtitle: 'Lentejas espesas guisadas en casa con cubos tiernos de papa, zanahoria y arroz blanco.',
    prepTimeMinutes: 35,
    difficulty: 'Fácil',
    servings: 4,
    archetype: 'stew',
    photoKey: 'guiso_lentejas_papas',
    coreIngredients: ['Lentejas', 'Papas'],
    secondaryEnhancers: ['Zanahoria', 'Arroz', 'Cebolla'],
    enhancerRolePhrase: 'completar el guiso casero y servirlo bien rendidor',
    steps: [
      'Enjuaga las lentejas y hiérvelas cubiertas con agua junto con papa y zanahoria en cubos pequeños.',
      'Sofríe cebolla, tomate y ajo picados en sartén aparte durante 4 minutos.',
      'Integra el sofrito a la olla de lentejas en los últimos 10 minutos para espesar el caldo.',
      'Ajusta de sal y acompaña con una porción de arroz blanco y cilantro fresco.',
    ],
    chefTip: 'Añadir la sal en los últimos 10 minutos mantiene la piel de las lentejas suave y cremosa.',
  },
];

function matchesIngredient(userIngredients: string[], target: string): boolean {
  const normTarget = normalizeText(target);
  return userIngredients.some((u) => {
    const normU = normalizeText(u);
    return normU === normTarget || normU.includes(normTarget) || normTarget.includes(normU);
  });
}

export function generateDeterministicSuggestions(userIngredients: string[]): SuggestedRecipe[] {
  const cleanUser = userIngredients.filter(Boolean);
  if (cleanUser.length === 0) {
    return [];
  }

  const scored = CURATED_TEMPLATES.map((tpl) => {
    const matchedCore = tpl.coreIngredients.filter((c) => matchesIngredient(cleanUser, c));
    const missingCore = tpl.coreIngredients.filter((c) => !matchesIngredient(cleanUser, c));
    const matchedSecondary = tpl.secondaryEnhancers.filter((s) => matchesIngredient(cleanUser, s));
    const missingSecondary = tpl.secondaryEnhancers.filter((s) => !matchesIngredient(cleanUser, s));

    const coreRatio = matchedCore.length / tpl.coreIngredients.length;
    const secondaryRatio =
      tpl.secondaryEnhancers.length > 0 ? matchedSecondary.length / tpl.secondaryEnhancers.length : 1;

    const rawScore =
      coreRatio * 72 + secondaryRatio * 24 - missingCore.length * 14 - missingSecondary.length * 2;
    const affinityScore = Math.max(48, Math.min(99, Math.round(rawScore)));

    const allMatched = [...matchedCore, ...matchedSecondary];
    const missingCombined = [...missingCore, ...missingSecondary].slice(0, 3);

    let culinaryReason =
      'Tienes todos los ingredientes clave en tu cocina; solo necesitas sal y un toque de aceite.';
    if (missingCombined.length > 0) {
      const listFormatter =
        missingCombined.length === 1
          ? missingCombined[0].toLowerCase()
          : `${missingCombined
              .slice(0, -1)
              .map((i) => i.toLowerCase())
              .join(', ')} y ${missingCombined[missingCombined.length - 1].toLowerCase()}`;
      culinaryReason = `Te falta un poco de ${listFormatter} para ${tpl.enhancerRolePhrase}.`;
    }

    return {
      recipe: {
        id: tpl.id,
        title: tpl.title,
        subtitle: tpl.subtitle,
        prepTimeMinutes: tpl.prepTimeMinutes,
        difficulty: tpl.difficulty,
        servings: tpl.servings,
        archetype: tpl.archetype,
        photoKey: matchedCore.length > 0 ? tpl.photoKey : 'custom_card',
        matchedIngredients: allMatched.length > 0 ? allMatched : cleanUser.slice(0, 2),
        minimalMissingIngredients: {
          items: missingCombined,
          culinaryReason,
        },
        steps: tpl.steps,
        chefTip: tpl.chefTip,
        affinityScore,
      } satisfies SuggestedRecipe,
      matchedCoreCount: matchedCore.length,
      matchedTotalWeight: matchedCore.length * 3 + matchedSecondary.length,
      score: rawScore,
    };
  });

  scored.sort(
    (a, b) =>
      b.matchedCoreCount - a.matchedCoreCount ||
      b.matchedTotalWeight - a.matchedTotalWeight ||
      b.score - a.score
  );

  // Filtrar solo plantillas que tengan coincidencia real con al menos 1 ingrediente núcleo
  const relevantMatches = scored.filter((entry) => entry.matchedCoreCount > 0);

  if (relevantMatches.length >= 3) {
    return relevantMatches.slice(0, 4).map((entry) => entry.recipe);
  }

  // Si la usuaria escribió ingredientes muy específicos que no están en las plantillas base,
  // generamos alternativas adaptativas con ficha gastronómica literal ('custom_card').
  const mainList = cleanUser.slice(0, 3).join(', ');
  const pairTitle = cleanUser.slice(0, 2).join(' y ').toLowerCase();

  const customRecipes: SuggestedRecipe[] = [
    {
      id: 'salteado-casero-adaptativo',
      title: `Salteado casero de ${pairTitle}`,
      subtitle: `Preparación rápida al sartén aprovechando ${mainList.toLowerCase()}.`,
      prepTimeMinutes: 25,
      difficulty: 'Fácil',
      servings: 3,
      archetype: 'skillet',
      photoKey: 'custom_card',
      matchedIngredients: cleanUser,
      minimalMissingIngredients: {
        items: ['Cebolla', 'Ajo'],
        culinaryReason: 'Te falta un poco de cebolla y ajo para realzar el sabor base del salteado.',
      },
      steps: [
        `Lava y corta ${mainList.toLowerCase()} en bocados uniformes para una cocción pareja.`,
        'Calienta un sartén amplio con aceite y sofríe cebolla y ajo picados por 2 minutos.',
        'Incorpora primero los ingredientes más firmes y luego el resto a fuego medio-alto.',
        'Ajusta punto de sal y sirve recién hecho.',
      ],
      chefTip: 'Cortar los insumos de tamaño similar garantiza que queden tiernos al mismo tiempo.',
      affinityScore: 92,
    },
    {
      id: 'guiso-casero-adaptativo',
      title: `Cazuela hogareña de ${pairTitle}`,
      subtitle: `Guiso jugoso en una sola olla con ${mainList.toLowerCase()}.`,
      prepTimeMinutes: 35,
      difficulty: 'Fácil',
      servings: 4,
      archetype: 'stew',
      photoKey: 'custom_card',
      matchedIngredients: cleanUser,
      minimalMissingIngredients: {
        items: ['Tomate', 'Cebolla'],
        culinaryReason: 'Te falta un poco de tomate y cebolla para formar una salsa casera jugosa.',
      },
      steps: [
        'Prepara un sofrito base en olla mediana con tomate y cebolla picados.',
        `Incorpora ${mainList.toLowerCase()} y mezcla para impregnar los sabores.`,
        'Añade media taza de agua caliente, tapa y cocina a fuego suave por 20 minutos.',
        'Rectifica sazón y sirve caliente.',
      ],
      chefTip: 'Cocinar tapado a fuego medio-bajo concentra los jugos naturales de tus insumos.',
      affinityScore: 88,
    },
  ];

  return [...relevantMatches.map((r) => r.recipe), ...customRecipes].slice(0, 4);
}
