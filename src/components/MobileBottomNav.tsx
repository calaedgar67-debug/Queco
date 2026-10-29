import { Bookmark, BookOpen, Compass, Utensils } from 'lucide-react';
import type { ActiveTab } from '../types/queco';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  savedCount: number;
}

export function MobileBottomNav({ activeTab, onSelectTab, savedCount }: MobileBottomNavProps) {
  const tabs: { id: ActiveTab; label: string; icon: typeof Utensils }[] = [
    { id: 'cocinar', label: 'Despensa', icon: Utensils },
    { id: 'sugerencias', label: 'Sugerencias', icon: Compass },
    { id: 'guardadas', label: savedCount > 0 ? `Guardadas (${savedCount})` : 'Guardadas', icon: Bookmark },
    { id: 'arquitectura', label: 'Diseño UX', icon: BookOpen },
  ];

  return (
    <nav
      aria-label="Navegación móvil"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-queco-border"
    >
      <div className="grid grid-cols-4 items-center h-14 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`min-h-[48px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
                active ? 'text-queco-terracotta font-semibold' : 'text-queco-muted hover:text-queco-ink'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] tracking-tight mt-0.5 whitespace-nowrap truncate max-w-[82px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
