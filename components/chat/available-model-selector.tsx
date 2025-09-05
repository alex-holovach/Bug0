'use client';

import { startTransition, useMemo, useOptimistic, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/chat/utils';
import { CheckCircleFillIcon, ChevronDownIcon } from '@/components/chat/icons';
import { saveChatModelAsCookie } from '@/app/(auth)/(chat)/chat/actions';
import { useAvailableModels } from '@/hooks/use-available-models';
import { Loader2, Check, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function AvailableModelSelector({
  selectedModelId,
  className,
}: {
  selectedModelId: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);

  const { models, isLoading, error } = useAvailableModels();

  const selectedChatModel = useMemo(
    () => models.find(model => model.id === optimisticModelId),
    [models, optimisticModelId]
  );

  if (isLoading) {
    return (
      <Button
        variant="outline"
        className={cn('md:px-2 md:h-[34px]', className)}
        disabled
      >
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading models...
      </Button>
    );
  }

  if (error || models.length === 0) {
    return (
      <Button
        variant="outline"
        className={cn('md:px-2 md:h-[34px]', className)}
        disabled
      >
        No models available
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          data-testid="available-model-selector"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('md:px-2 md:h-[34px] justify-between', className)}
        >
          {selectedChatModel?.name || 'Select model'}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search models..." className="h-9" />
          <CommandList>
            <CommandEmpty>No models found.</CommandEmpty>
            <CommandGroup>
              {models.map(model => {
                const { id } = model;

                return (
                  <CommandItem
                    data-testid={`available-model-selector-item-${id}`}
                    key={id}
                    value={id}
                    onSelect={currentValue => {
                      setOpen(false);

                      startTransition(() => {
                        setOptimisticModelId(currentValue);
                        saveChatModelAsCookie(currentValue);
                      });
                    }}
                  >
                    <div className="flex flex-col gap-1 items-start flex-1">
                      <div>{model.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {model.id}
                      </div>
                    </div>
                    <Check
                      className={cn(
                        'ml-auto h-4 w-4',
                        optimisticModelId === id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
