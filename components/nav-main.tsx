'use client';

import { ChevronRight, type LucideIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';

export function NavMain({
  items,
  disabled,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
  disabled?: boolean;
}) {
  const pathname = usePathname();

  const isActiveRoute = (url: string) => {
    return url === pathname;
  };

  const isActiveItem = (item: (typeof items)[0]) => {
    if (isActiveRoute(item.url)) return true;
    return false;
  };

  const shouldOpenCollapsible = (item: (typeof items)[0]) => {
    if (isActiveRoute(item.url)) return true;
    if (item.items) {
      return item.items.some(subItem => isActiveRoute(subItem.url));
    }
    return false;
  };

  const handleClick = (e: React.MouseEvent, isDisabled: boolean) => {
    if (isDisabled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map(item => (
          <SidebarMenuItem key={item.title}>
            {item.items && item.items.length > 0 ? (
              <Collapsible
                defaultOpen={shouldOpenCollapsible(item)}
                className="group/collapsible"
              >
                <CollapsibleTrigger asChild disabled={disabled}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActiveItem(item)}
                    disabled={disabled}
                    className="data-[state=open]:bg-transparent data-[state=open]:text-sidebar-foreground"
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map(subItem => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActiveRoute(subItem.url)}
                        >
                          <a
                            href={disabled ? undefined : subItem.url}
                            onClick={e => handleClick(e, !!disabled)}
                            className={
                              disabled ? 'pointer-events-none opacity-50' : ''
                            }
                          >
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isActiveRoute(item.url)}
              >
                <a
                  href={disabled ? undefined : item.url}
                  onClick={e => handleClick(e, !!disabled)}
                  className={disabled ? 'pointer-events-none opacity-50' : ''}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
