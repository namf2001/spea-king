import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { generateMetadata as generateOGMetadata } from '@/lib/og-metadata';

import { Header } from './components/header';

export const metadata = generateOGMetadata({
  title: 'Đăng Nhập - SpeaKing',
  description: 'Đăng nhập vào SpeaKing để bắt đầu hành trình học ngôn ngữ của bạn',
  url: '/login',
});

export default async function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (session?.user) {
    redirect('/pronunciation');
  }

  return (
    <div className="from-background to-primary/5 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b p-4">
      <Header />
      <div className="mt-16">{children}</div>
    </div>
  );
}
