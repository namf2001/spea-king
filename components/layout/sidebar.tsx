"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Award, MessageSquare, Mic, MoreHorizontal, User, Zap } from "lucide-react"
import { motion } from "framer-motion"
import { logo } from "@/assets/image"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ThemeSwitcher } from "./theme-switcher"
import { LogoutButton } from "./logout-button"

interface NavigationItem {
  label: string
  href: string
  icon: React.ReactNode
  iconColor?: string
}

export function AppSidebar() {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [isIpad, setIsIpad] = useState(false)

  // Check if we're on mobile or iPad
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsIpad(width >= 768 && width <= 1024)
    }

    checkDeviceType()
    window.addEventListener("resize", checkDeviceType)

    return () => {
      window.removeEventListener("resize", checkDeviceType)
    }
  }, [])

  // Logo to use based on theme

  const navigation: NavigationItem[] = [
    {
      label: "PHÁT ÂM",
      href: "/pronunciation",
      icon: <Mic className="h-6 w-6" />,
    },
    {
      label: "PHẢN XẠ",
      href: "/reflex",
      icon: <Zap className="h-6 w-6" />,
    },
    {
      label: "GIAO TIẾP",
      href: "/conversation",
      icon: <MessageSquare className="h-6 w-6" />,
    },
    {
      label: "THỐNG KÊ",
      href: "/progress",
      icon: <Award className="h-6 w-6" />,
    },
    {
      label: "HỒ SƠ",
      href: "/settings",
      icon: <User className="h-6 w-6" />,
    },
    {
      label: "XEM THÊM",
      href: "/more",
      icon: <MoreHorizontal className="h-6 w-6" />,
    },
  ]

  // Calculate if a menu item is active
  const isActive = (href: string) => {
    if (href === "/") return pathname === href
    return pathname.startsWith(href)
  }

  // Desktop or iPad sidebar
  if (!isMobile) {
    return (
      <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="h-screen">
        <Sidebar
          collapsible="none"
          className={cn(
            "py-4 border-r shadow-sm",
            isIpad ? "w-26" : "min-w-28 md:min-w-64",
          )}
        >
          <SidebarHeader className="flex flex-col items-center gap-1 mb-6">
            <Link href="/" className="flex justify-center w-full mb-6">
              <div className="relative w-14 h-14">
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
          <SidebarContent className="flex-1 flex flex-col items-center gap-2 px-4 overflow-y-auto">
            <SidebarMenu className="flex-1">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    className={cn(
                      "w-full h-14 flex items-center rounded-xl transition-all",
                      isIpad ? "justify-center mx-auto w-14" : "justify-center md:justify-start",
                      isActive(item.href)
                        ? "border-2"
                        : "border-transparent",
                    )}
                    data-active={isActive(item.href)}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-bg",
                        isActive(item.href)
                          ? "bg-primary border-primary/60 text-primary"
                          : "border-transparent",
                      )}
                    >
                      <div
                        className={cn(
                          isIpad ? "mx-auto" : "ml-2 mr-5",
                        )}
                      >
                        {item.icon}
                      </div>
                      {!isIpad && (
                        <span
                          className={cn(
                            "text-xs font-bold hidden md:block",
                          )}
                        >
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <div className="mt-auto w-full flex flex-col gap-2">
              <ThemeSwitcher />
              <LogoutButton isIpad={isIpad} />
            </div>
          </SidebarContent>
        </Sidebar>
      </motion.div>
    )
  }

  // Mobile sidebar (bottom navigation)
  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-secondary border-t border-gray-200 dark:border-gray-800 shadow-lg"
    >
      <div className="flex justify-between items-center px-1 py-2">
        {navigation.slice(0, 5).map((item) => (
          <Link key={item.href} href={item.href} className="w-full">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-12 h-12 flex items-center justify-center rounded-xl transition-all",
                  isActive(item.href)
                    ? "bg-primary/30 border-2 border-primary"
                    : "text-muted-foreground"
                )}
              >
                <div className={isActive(item.href) ? "text-primary" : ""}>
                  {item.icon}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}