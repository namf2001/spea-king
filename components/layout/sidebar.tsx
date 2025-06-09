'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { logo } from '@/assets/image';
import {
  conversationIcon,
  practiceIcon,
  progressIcon,
  pronunciationIcon,
  reflexIcon,
} from '@/assets/image/icon';
import { BookOpen } from 'lucide-react';

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
      icon: (
        <Image
          src={pronunciationIcon}
          alt="Pronunciation"
          width={32}
          height={32}
        />
      ),
    },
    {
      label: 'TỪ VỰNG',
      href: '/vocabulary',
      icon: (
        <Image src={practiceIcon} alt="Vocabulary" width={32} height={32} />
      ),
    },
    {
      label: 'PHẢN XẠ',
      href: '/reflex',
      icon: <Image src={reflexIcon} alt="Reflex" width={32} height={32} />,
    },
    {
      label: 'GIAO TIẾP',
      href: '/conversation',
      icon: (
        <Image
          src={conversationIcon}
          alt="Conversation"
          width={32}
          height={32}
        />
      ),
    },
    {
      label: 'THỐNG KÊ',
      href: '/progress',
      icon: <Image src={progressIcon} alt="Progress" width={32} height={32} />,
    },
    {
      label: 'NGỮ PHÁP',
      href: '/gramma',
      icon: <BookOpen className="h-8 w-8" />,
    },
  ];

  // Calculate if a menu item is active
  const isActive = (href: string) => {
    if (href === '/') return pathname === href;
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
            'border-r-2 border-gray-200 py-4 dark:border-gray-600',
            isIpad ? 'w-26' : 'min-w-28 md:min-w-64',
          )}
        >
          <SidebarHeader className="mb-8 flex flex-col items-center gap-1">
            <Link href="/" className="flex w-full justify-center">
              {isIpad ? (
                <div className="relative h-14 w-14">
                  <Image
                    src={logo}
                    alt="SPEA-KING Logo"
                    fill
                    sizes="(max-width: 768px) 40px, 56px"
                    className="object-contain rounded-lg"
                  />
                </div>
              ) : (
                <span className="text-primary text-5xl font-extrabold capitalize">
                  milo
                </span>
              )}
            </Link>
          </SidebarHeader>
          <SidebarContent className="flex flex-1 flex-col items-center gap-3 overflow-y-auto px-4">
            <SidebarMenu className="flex-1">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    className={cn(
                      'flex h-14 w-full items-center rounded-xl transition-all',
                      isIpad
                        ? 'mx-auto w-14 justify-center'
                        : 'justify-center md:justify-start',
                      isActive(item.href) ? 'border-2' : 'border-transparent',
                    )}
                    data-active={isActive(item.href)}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        'justify-bg flex items-center py-0',
                        isActive(item.href)
                          ? 'bg-primary border-primary/60 text-primary'
                          : 'border-transparent',
                      )}
                    >
                      <div className={cn(isIpad ? 'mx-auto' : 'mr-5 ml-3')}>
                        {item.icon}
                      </div>
                      {!isIpad && (
                        <span
                          className={cn('hidden text-base font-bold md:block')}
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
    <div className="bg-secondary fixed right-0 bottom-0 left-0 z-50 border-t-2 border-gray-200 md:hidden dark:border-gray-800">
      <div className="flex items-center justify-between px-1 py-2">
        {navigation.slice(0, 6).map((item) => (
          <Link key={item.href} href={item.href} className="w-full">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl transition-all',
                  isActive(item.href)
                    ? 'bg-primary/30 border-primary border-2'
                    : 'text-muted-foreground',
                )}
              >
                <div className={isActive(item.href) ? 'text-primary' : ''}>
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
