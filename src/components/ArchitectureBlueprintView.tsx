import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { buildYoutubeRecipeUrl } from '../utils/youtube';

export function ArchitectureBlueprintView() {
  const [sampleRecipeName, setSampleRecipeName] = useState('Estofado de carne con papas');
  const generatedSampleUrl = buildYoutubeRecipeUrl(sampleRecipeName);

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Encabezado editorial */}
      <section className="bg-white rounded-3xl border border-queco-border shadow-[0_2px_18px_rgba(38,27,22,0.03)] p-6 sm:p-9 flex flex-col sm:flex-row sm:items-center gap-6">
        <img
          src="/assets/aistudio/Glossy_Terracotta_Q_Mascot_Logo_8e9e2a55.png"
          alt="Logo Queco"
          className="w-20 h-20 sm:w-24 sm:h-24 object-contain mix-blend-multiply shrink-0"
        />
        <div>
          <p className="text-xs font-semibold text-queco-sage">
            Documento Vivo de Producto · Arquitectura UX/UI & Ingeniería
          </p>
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-queco-ink mt-1.5 tracking-tight">
            Arquitectura de Producto de Queco ("¿Qué Cocino?")
          </h1>
          <p className="mt-3 text-sm sm:text-base text-queco-body leading-relaxed max-w-3xl">
            Diseño centrado en reducir la fatiga de decisión diaria frente a la nevera abierta: interacción con una sola mano, áreas táctiles mínimas de 44×44 px, cero escritura obligatoria y conexión directa a guías visuales paso a paso.
          </p>
        </div>
      </section>

      {/* 1. Flujo de Usuario y Wireframes Textuales Pantalla por Pantalla */}
      <section className="bg-white rounded-3xl border border-queco-border shadow-[0_2px_18px_rgba(38,27,22,0.03)] p-6 sm:p-9 space-y-6">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-queco-ink">
            01. Flujo de Usuario y Wireframes Pantalla por Pantalla
          </h2>
          <p className="mt-1.5 text-sm text-queco-body">
            Recorrido lineal en menos de 15 segundos desde que la persona abre la despensa hasta que empieza a cocinar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pantalla 1 */}
          <div className="rounded-2xl border border-queco-border p-5 bg-queco-canvas flex flex-col justify-between space-y-4">
            <div>
              <p className="text-xs font-semibold text-queco-terracotta">Pantalla 01 · Entrada Ágil</p>
              <h3 className="font-display text-lg font-bold text-queco-ink mt-0.5">
                Mi Despensa
              </h3>
              <p className="text-xs text-queco-body mt-1 leading-relaxed">
                Captura híbrida sin fricción: barra con autocompletado y soporte de comas más grilla táctil categorizada en zona media/baja del pulgar.
              </p>
            </div>
            <pre className="font-mono text-[11px] leading-snug text-queco-ink bg-white p-3.5 rounded-xl border border-queco-border overflow-x-auto">
{`+----------------------------------+
| [Q] ¿Qué Cocino? [Sugerir platos]|
+----------------------------------+
| ¿Qué cocino?                     |
| [🔍 carne, papas, arroz... ][ + ]|
|  └─ Sugerencia: Carne de res     |
|                                  |
| [Proteínas][Verduras][Carbos]    |
| [✓ Carne res] [✓ Papas ] [+ Pollo|
| [+ Huevos   ] [+ Tomate] [+ Queso|
|                                  |
| En tu cocina (3):                |
| [Carne res ×] [Papas ×] [Arroz ×]|
|                                  |
| [  DESCUBRIR QUÉ COCINAR (3)   ] |
+----------------------------------+`}
            </pre>
          </div>

          {/* Pantalla 2 */}
          <div className="rounded-2xl border border-queco-border p-5 bg-queco-canvas flex flex-col justify-between space-y-4">
            <div>
              <p className="text-xs font-semibold text-queco-terracotta">Pantalla 02 · Decisión</p>
              <h3 className="font-display text-lg font-bold text-queco-ink mt-0.5">
                Menú de 3 a 4 Alternativas
              </h3>
              <p className="text-xs text-queco-body mt-1 leading-relaxed">
                Jerarquía visual limpia: tiempo, dificultad y recuadro semántico suave que distingue lo disponible de los insumos adicionales mínimos.
              </p>
            </div>
            <pre className="font-mono text-[11px] leading-snug text-queco-ink bg-white p-3.5 rounded-xl border border-queco-border overflow-x-auto">
{`+----------------------------------+
| Platos ideales con tu despensa   |
| [Todas] [≤25 min] [Una sola olla]|
+----------------------------------+
| [ Foto Plato ]                   |
| Opción 01 · 35 min · Fácil · 4p  |
| Sudado casero de res con papas   |
| Usas: Carne de res, Papas, Arroz |
| +------------------------------+ |
| | ! Insumos mínimos: Cebolla,  | |
| |   ajo para armar el sofrito. | |
| +------------------------------+ |
| [Ver pasos (4)] [Ver en YouTube] |
+----------------------------------+`}
            </pre>
          </div>

          {/* Pantalla 3 */}
          <div className="rounded-2xl border border-queco-border p-5 bg-queco-canvas flex flex-col justify-between space-y-4">
            <div>
              <p className="text-xs font-semibold text-queco-terracotta">Pantalla 03 · Ejecución</p>
              <h3 className="font-display text-lg font-bold text-queco-ink mt-0.5">
                Paso a Paso + YouTube Ask
              </h3>
              <p className="text-xs text-queco-body mt-1 leading-relaxed">
                Hoja inferior deslizable con pasos marcables (manos ocupadas en cocina) y redirección dinámica instantánea a YouTube.
              </p>
            </div>
            <pre className="font-mono text-[11px] leading-snug text-queco-ink bg-white p-3.5 rounded-xl border border-queco-border overflow-x-auto">
{`+----------------------------------+
|          === (Handle)            |
| 35 min · Fácil · 4 porciones [X] |
| Sudado casero de res con papas   |
|----------------------------------|
| [✓] 1. Cortar carne y papas...   |
| [ ] 2. Armar sofrito base...     |
| [ ] 3. Cocinar 25 min tapado...  |
| [ ] 4. Acompañar con arroz...    |
|----------------------------------|
| [ ▶ Ver cómo preparar YouTube  ] |
| [ ? Consultar en YouTube Ask   ] |
+----------------------------------+`}
            </pre>
          </div>
        </div>
      </section>

      {/* 2. Lógica del Algoritmo de Sugerencias */}
      <section className="bg-white rounded-3xl border border-queco-border shadow-[0_2px_18px_rgba(38,27,22,0.03)] p-6 sm:p-9 space-y-6">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-queco-ink">
            02. Lógica del Algoritmo de Priorización e Insumos Mínimos
          </h2>
          <p className="mt-1.5 text-sm text-queco-body">
            Queco combina clasificación estructural de ingredientes con un motor híbrido (IA generativa estructurada + motor determinístico de respaldo).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-queco-border p-5 bg-queco-canvas/60">
            <p className="text-xs font-semibold text-queco-terracotta tabular-nums">Nivel 1 · Peso 65%</p>
            <h3 className="font-display text-base font-bold text-queco-ink mt-1">
              Insumos Estructurales (Núcleo)
            </h3>
            <p className="text-sm text-queco-body mt-2 leading-relaxed">
              Proteínas (res, pollo, huevos, atún, legumbres) y bases saciantes (arroz, papa, pasta, yuca). Un plato solo se sugiere si al menos el 70%–100% de su núcleo está en la lista de la usuaria.
            </p>
          </div>

          <div className="rounded-2xl border border-queco-border p-5 bg-queco-canvas/60">
            <p className="text-xs font-semibold text-queco-gold tabular-nums">Nivel 2 · Peso 25%</p>
            <h3 className="font-display text-base font-bold text-queco-ink mt-1">
              Realzadores y Puentes de Sabor
            </h3>
            <p className="text-sm text-queco-body mt-2 leading-relaxed">
              Aromáticos y ligantes menores (cebolla, ajo, tomate, pimentón, cilantro, 1 huevo o toque de queso). Si faltan entre 1 y 3, no descartan la receta: se etiquetan como <strong>Insumos adicionales mínimos</strong> explicando su rol culinario.
            </p>
          </div>

          <div className="rounded-2xl border border-queco-border p-5 bg-queco-canvas/60">
            <p className="text-xs font-semibold text-queco-sage tabular-nums">Nivel 3 · Peso 0% (Implícitos)</p>
            <h3 className="font-display text-base font-bold text-queco-ink mt-1">
              Básicos Universales de Cocina
            </h3>
            <p className="text-sm text-queco-body mt-2 leading-relaxed">
              Agua, sal, pimienta y aceite vegetal básico se asumen disponibles por defecto para nunca saturar a la usuaria pidiéndole que registre "agua" o "sal" cada día.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-queco-canvas border border-queco-border p-4 sm:p-5 font-mono text-xs sm:text-sm text-queco-ink overflow-x-auto">
          Score(Receta) = 0.72 × (Núcleo_Coincidente / Núcleo_Total) + 0.24 × (Aromáticos_Coincidentes / Aromáticos_Total) − Penalización_Faltantes
        </div>
      </section>

      {/* 3. Probador interactivo y Código de Redirección Dinámica a YouTube */}
      <section className="bg-white rounded-3xl border border-queco-border shadow-[0_2px_18px_rgba(38,27,22,0.03)] p-6 sm:p-9 space-y-6">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-queco-ink">
            03. Lógica y Probador en Vivo de Redirección Dinámica a YouTube
          </h2>
          <p className="mt-1.5 text-sm text-queco-body">
            Prueba cualquier nombre de plato para verificar cómo se sanitizan tildes, signos y espacios hacia la estructura estándar solicitada.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="recipe-url-tester" className="block text-xs font-semibold text-queco-ink mb-1.5">
              Nombre de la receta seleccionada:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="recipe-url-tester"
                type="text"
                value={sampleRecipeName}
                onChange={(e) => setSampleRecipeName(e.target.value)}
                className="flex-1 min-h-[46px] px-4 py-2 rounded-xl border border-queco-border-strong bg-queco-canvas text-sm text-queco-ink focus:bg-white focus:border-queco-terracotta focus:outline-none"
              />
              <a
                href={generatedSampleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[46px] px-5 py-2.5 rounded-xl bg-queco-terracotta hover:bg-queco-terracotta-hover text-white text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors"
              >
                <span>Probar enlace en YouTube</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="rounded-xl bg-queco-ink text-[#FAF7F3] p-4 font-mono text-xs overflow-x-auto">
            {generatedSampleUrl}
          </div>
        </div>
      </section>
    </div>
  );
}
