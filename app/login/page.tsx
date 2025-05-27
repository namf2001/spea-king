'use client';

import Image from 'next/image';
import { GoogleSignIn } from './components/google-sign-in';
import { FacebookSignIn } from './components/facebook-sign-in';
import { logo } from '@/assets/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card className="from-primary/20 to-background w-full overflow-hidden border-none bg-gradient-to-b shadow-lg">
        <CardHeader className="flex flex-col items-center space-y-4 pb-2">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative h-24 w-24"
          >
            <Image
              src={logo}
              alt="SPEA-KING Logo"
              fill
              className="block object-contain"
              priority
            />
          </motion.div>
          <CardTitle className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-center text-3xl font-bold text-transparent">
            Đăng Nhập
          </CardTitle>
          <CardDescription className="text-muted-foreground max-w-sm text-center">
            Tiếp tục học tập để cải thiện kỹ năng nói tiếng Anh của bạn
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="text-muted-foreground px-2">login with</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <GoogleSignIn />
            <FacebookSignIn />
          </div>
        </CardContent>

        <CardFooter className="mt-4 flex flex-col space-y-4 p-6">
          <p className="text-muted-foreground text-center text-sm">
            Học nói tiếng Anh mỗi ngày, tiến bộ mỗi ngày
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
