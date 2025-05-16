"use client";

import Image from "next/image";
import { GoogleSignIn } from "./components/google-sign-in";
import { FacebookSignIn } from "./components/facebook-sign-in";
import { logo } from '@/assets/image';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
export default  function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md overflow-hidden pb-0">
        <CardHeader className="flex flex-col items-center pb-2">
          <div className="relative w-24 h-24 mb-4">
            <Image
              src={logo}
              alt="SPEA-KING Logo"
              fill
              className="object-contain block"
            />
          </div>
          <CardTitle className="text-3xl font-bold text-center">
            Đăng Nhập
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300 mt-2 text-center">
            Tiếp tục học tập để cải thiện kỹ năng nói tiếng Anh của bạn
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 px-8">
          <GoogleSignIn />
          <FacebookSignIn />
        </CardContent>

        <CardFooter className="flex flex-col bg-accent-foreground p-6 mt-4">
          <p className="text-gray-600 dark:text-gray-300 text-center">
            Học nói tiếng Anh mỗi ngày, tiến bộ mỗi ngày
          </p>
        </CardFooter>
      </Card>

      <div className="mt-6 flex items-center justify-center">
        <div className="animate-bounce">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <span className="mr-1">✨</span> Bắt đầu học tiếng Anh ngay hôm nay!
          </span>
        </div>
      </div>
    </div>
  );
}