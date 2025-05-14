"use client";

import Image from "next/image";
import { GoogleSignIn } from "./components/google-sign-in";
import { FacebookSignIn } from "./components/facebook-sign-in";
import {logo} from '@/assets/image'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-24 h-24 mb-4">
              <Image
                src={logo}
                alt="SPEA-KING Logo"
                fill
                className="object-contain block"
              />
            </div>
            <h1 className="text-3xl font-bold text-center text-green-600 dark:text-green-400">
              Đăng Nhập
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-center">
              Tiếp tục học tập để cải thiện kỹ năng nói tiếng Anh của bạn
            </p>
          </div>

          <div className="space-y-4">
            <GoogleSignIn />
            <FacebookSignIn />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-gray-700 p-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-2 h-2 rounded-full bg-yellow-400 mx-1"></div>
              <div className="w-2 h-2 rounded-full bg-green-500 mx-1"></div>
              <div className="w-2 h-2 rounded-full bg-blue-500 mx-1"></div>
              <div className="w-2 h-2 rounded-full bg-red-500 mx-1"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Học nói tiếng Anh mỗi ngày, tiến bộ mỗi ngày
            </p>
          </div>
        </div>
      </div>

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