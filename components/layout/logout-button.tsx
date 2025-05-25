"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from "@/app/actions/auth"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface LogoutButtonProps {
    isIpad?: boolean;
}

export function LogoutButton({ isIpad = false }: LogoutButtonProps) {
    const [isPending, setIsPending] = useState(false)

    const handleLogout = async () => {
        try {
            setIsPending(true)
            await logout()
        } catch (error) {
            console.error("Logout failed:", error)
        } finally {
            setIsPending(false)
        }
    }

    return (
        <form action={handleLogout}>
            <Button
                type="submit"
                variant="ghost"
                disabled={isPending}
                className={cn(
                    "w-full mt-auto flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10",
                    isIpad ? "justify-center px-2" : "justify-start px-4"
                )}
            >
                <LogOut className="h-5 w-5" />
                {!isIpad && <span className="text-xs font-bold hidden md:block">ĐĂNG XUẤT</span>}
            </Button>
        </form>
    )
}