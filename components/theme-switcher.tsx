import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { Moon, Sun, Palette } from 'lucide-react';
import { useEffect } from 'react';

export function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    if (resolvedTheme) {
      setTheme(resolvedTheme);
    }
  }, [resolvedTheme]);

  const handleThemeToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="w-full flex justify-between">
      <SwitchPrimitives.Root
        checked={theme === 'dark'}
        onClick={handleThemeToggle}
        className={cn(
          'peer focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
          theme === 'dark' ? 'bg-primary' : 'bg-input'
        )}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            'bg-background pointer-events-none flex size-5 items-center justify-center rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
          )}
        >
          {theme === 'dark' ? (
            <Moon className="size-3 text-foreground" />
          ) : (
            <Sun className="size-3 text-primary" />
          )}
        </SwitchPrimitives.Thumb>
      </SwitchPrimitives.Root>
    </div>
  );
}
