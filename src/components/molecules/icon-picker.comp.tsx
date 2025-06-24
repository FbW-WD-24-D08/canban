import { ICON_CATEGORIES, type IconInfo } from '@/lib/icon-map';
import * as Popover from '@radix-ui/react-popover';
import React from 'react';

interface IconPickerProps {
  children: React.ReactNode;
  onSelect: (iconName: string) => void;
  isMeisterTask?: boolean;
}

export function IconPicker({ children, onSelect, isMeisterTask = false }: IconPickerProps) {
  const popoverContentStyle = isMeisterTask
    ? 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200'
    : 'bg-zinc-800 border-zinc-700 text-zinc-200';

  const categoryHeaderStyle = isMeisterTask 
    ? 'text-zinc-600 dark:text-zinc-400' 
    : 'text-zinc-400';
  
  const iconButtonStyle = isMeisterTask
    ? 'hover:bg-zinc-100 dark:hover:bg-zinc-700'
    : 'hover:bg-zinc-700';
  
  const iconStyle = isMeisterTask
    ? 'text-zinc-700 dark:text-zinc-300'
    : 'text-zinc-300';


  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        {children}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={5}
          className={`w-[300px] max-h-[400px] border rounded-lg shadow-lg z-[1001] overflow-y-auto ${popoverContentStyle}`}
        >
          <div className="p-4">
            {ICON_CATEGORIES.map((category) => (
              <div key={category.name} className="mb-4 last:mb-0">
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${categoryHeaderStyle}`}>
                  {category.name}
                </h4>
                <div className="grid grid-cols-6 gap-2">
                  {category.icons.map((iconInfo: IconInfo) => (
                    <Popover.Close 
                      key={iconInfo.name}
                      asChild
                      onClick={() => onSelect(iconInfo.name)}
                    >
                      <button
                        className={`flex items-center justify-center p-2 rounded-md transition-colors ${iconButtonStyle}`}
                        aria-label={iconInfo.name.replace('Icon', '')}
                      >
                        <iconInfo.component className={`w-5 h-5 ${iconStyle}`} />
                      </button>
                    </Popover.Close>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
} 