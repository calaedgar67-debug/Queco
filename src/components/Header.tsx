import { useState } from 'react';
import type { ActiveTab } from '../types/queco';

const QUECO_LOGO_PATH = '/assets/aistudio/Glossy_Terracotta_Q_Mascot_Logo_8e9e2a55.png';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  savedCount: number;
  onGenerateRecipes: () => void;
  isGenerating: boolean;
  canGenerate: boolean;
}

export function Header({
  activeTab,
  onSelectTab,
  savedCount,
  onGenerateRecipes,
  isGenerating,
  canGenerate,
}: HeaderProps) {
  const [logoFailed, setLogoFailed] = useState(false);

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'cocinar', label: 'Despensa' },
    { id: 'sugerencias', label: 'Sugerencias' },
    { id: 'guardadas', label: savedCount > 0 ? `Guardadas (${savedCount})` : 'Guardadas' },
    { id: 'arquitectura', label: 'Arquitectura UX' },
  ];

  return (
    <header className="md:sticky md:top-0 z-30 bg-white/95 backdrop-blur-md border-b border-queco-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-20">
        {/* Zone 1: Brand Lockup with Queco Mascot Logo */}
        <button
          type="button"
          onClick={() => onSelectTab('cocinar')}
          aria-label="Queco — ¿Qué Cocino?"
          className="flex items-center gap-3 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-queco-terracotta cursor-pointer group"
        >
          {!logoFailed && (
            <img
              src={QUECO_LOGO_PATH}
              alt="Logo Queco"
              onError={() => setLogoFailed(true)}
              className="h-14 w-14 sm:h-16 sm:w-16 object-contain mix-blend-multiply shrink-0 transition-transform duration-150 group-hover:scale-[1.03]"
            />
          )}
          <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-queco-ink">
            {logoFailed ? 'Queco · ¿Qué Cocino?' : '¿Qué Cocino?'}
          </span>
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-7 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-queco-terracotta ${
                  isActive
                    ? 'border-queco-terracotta text-queco-ink font-semibold'
                    : 'border-transparent text-queco-body hover:text-queco-ink hover:border-queco-border-strong'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onGenerateRecipes}
            disabled={!canGenerate || isGenerating}
            className="min-h-[44px] px-4 sm:px-5 py-2 text-sm font-semibold text-white bg-queco-terracotta rounded-xl hover:bg-queco-terracotta-hover shadow-xs shadow-queco-terracotta/15 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-queco-terracotta"
          >
            {isGenerating ? 'Cocinando ideas...' : 'Sugerir platos'}
          </button>
        </div>
      </div>
    </header>
  );
}
