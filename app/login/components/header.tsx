'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';

export const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-background/80 fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-sm"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors"
            aria-label="Quay lại trang chủ"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại</span>
          </Button>
        </Link>
      </div>
    </motion.header>
  );
};
