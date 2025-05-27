'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Award,
  MessageSquare,
  Mic,
  MoreHorizontal,
  User,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { logo } from '@/assets/image';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { ThemeSwitcher } from './theme-switcher';
import { LogoutButton } from './logout-button';

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  iconColor?: string;
}

export function AppSidebar() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isIpad, setIsIpad] = useState(false);

  // Check if we're on mobile or iPad
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsIpad(width >= 768 && width <= 1024);
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);

    return () => {
      window.removeEventListener('resize', checkDeviceType);
    };
  }, []);

  // Logo to use based on theme

  const navigation: NavigationItem[] = [
    {
      label: 'PHÁT ÂM',
      href: '/pronunciation',
      icon: <Mic className="h-6 w-6" />,
      iconColor: 'text-primary',
    },
    {
      label: 'PHẢN XẠ',
      href: '/reflex',
      icon: <Zap className="h-6 w-6" />,
      iconColor: 'text-primary',
    },
    {
      label: 'GIAO TIẾP',
      href: '/conversation',
      icon: <MessageSquare className="h-6 w-6" />,
      iconColor: 'text-primary',
    },
    {
      label: 'THỐNG KÊ',
      href: '/progress',
      icon: <Award className="h-6 w-6" />,
      iconColor: 'text-primary',
    },
    {
      label: 'HỒ SƠ',
      href: '/settings',
      icon: <User className="h-6 w-6" />,
      iconColor: 'text-primary',
    },
    {
      label: 'XEM THÊM',
      href: '/more',
      icon: <MoreHorizontal className="h-6 w-6" />,
      iconColor: 'text-primary',
    },
  ];

  // Calculate if a menu item is active
  const isActive = (href: string) => {
    if (href === '/') return pathname === href;
    // For other paths, check if pathname starts with the href
    return pathname.startsWith(href);
  };

  // Desktop or iPad sidebar
  if (!isMobile) {
    return (
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="h-screen"
      >
        <Sidebar
          collapsible="none"
          className={cn(
            'bg-secondary border-r py-4 shadow-sm',
            isIpad ? 'w-28' : 'min-w-28 md:min-w-64',
          )}
        >
          <SidebarHeader className="mb-6 flex flex-col items-center gap-1">
            <Link href="/" className="mb-6 flex w-full justify-center">
              <div className="relative h-14 w-14">
                <Image
                  src={logo}
                  alt="SPEA-KING Logo"
                  fill
                  sizes="(max-width: 768px) 40px, 56px"
                  className="object-contain"
                />
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent className="flex flex-1 flex-col items-center gap-2 overflow-y-auto px-4">
            <SidebarMenu className="flex-1">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    className={cn(
                      'flex h-14 w-full items-center rounded-xl transition-all',
                      isIpad
                        ? 'justify-center'
                        : 'justify-center md:justify-start',
                      isActive(item.href)
                        ? 'bg-primary border-primary/60'
                        : 'border-transparent',
                    )}
                    data-active={isActive(item.href)}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        'justify-bg flex items-center',
                        isActive(item.href)
                          ? 'bg-primary border-primary/60'
                          : 'border-transparent',
                      )}
                    >
                      <div className={cn(isIpad ? 'mx-auto' : 'mr-5 ml-2')}>
                        {item.icon}
                      </div>
                      {!isIpad && (
                        <span
                          className={cn('hidden text-xs font-bold md:block')}
                        >
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <div className="mt-auto flex w-full flex-col gap-2">
              <ThemeSwitcher />
              <LogoutButton isIpad={isIpad} />
            </div>
          </SidebarContent>
        </Sidebar>
      </motion.div>
    );
  }

  // Mobile sidebar (bottom navigation)
  return (
    <div className="bg-secondary fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200 shadow-lg md:hidden dark:border-gray-800">
      <div className="flex items-center justify-between px-1 py-2">
        {navigation.slice(0, 5).map((item) => (
          <Link key={item.href} href={item.href} className="w-full">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl transition-all',
                  isActive(item.href)
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground',
                )}
              >
                <div
                  className={
                    isActive(item.href) ? 'text-white' : item.iconColor
                  }
                >
                  {item.icon}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
