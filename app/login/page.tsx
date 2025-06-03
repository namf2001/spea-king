'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

import { logo } from '@/assets/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { FacebookSignIn } from './components/facebook-sign-in';
import { GoogleSignIn } from './components/google-sign-in';

export default function LoginPage() {
  return (
    <div className="flex w-full items-center justify-center px-4 py-6 sm:px-6 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[95%] sm:max-w-[420px] md:max-w-md"
      >
        <Card className="from-primary/20 to-background w-full overflow-hidden border-none bg-gradient-to-b shadow-lg">
          <CardHeader className="flex flex-col items-center space-y-3 px-4 pb-2 sm:space-y-4 sm:px-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-lg"
            >
              <Image
                src={logo}
                alt="SPEA-KING Logo"
                fill
                className="block object-contain"
                priority
              />
            </motion.div>
            <CardTitle className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-center text-2xl font-bold text-transparent sm:text-3xl">
              Đăng Nhập
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5 px-4 sm:space-y-6 sm:px-6 md:px-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="text-muted-foreground from-primary/20 to-background bg-gradient-to-b px-2">
                  login with
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <GoogleSignIn />
              <FacebookSignIn />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
