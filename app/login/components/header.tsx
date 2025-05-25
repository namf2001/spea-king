"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { logo } from '@/assets/image';

export const Header = () => {
    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b"
        >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/">
                    <Button
                        variant="ghost"
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Quay lại trang chủ"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Quay lại</span>
                    </Button>
                </Link>
                <div className="flex items-center gap-2">
                    <Image
                        src={logo}
                        alt="SPEA-KING Logo"
                        width={32}
                        height={32}
                        className="object-contain"
                    />
                    <span className="font-semibold text-primary">SPEA-KING</span>
                </div>
            </div>
        </motion.header>
    );
};