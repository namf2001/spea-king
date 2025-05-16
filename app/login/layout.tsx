import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from "next/navigation"
interface LoginLayoutProps {
    children: React.ReactNode;
}

const LoginLayout: React.FC<LoginLayoutProps> = async ({ children }) => {
    const session = await auth();

    if (session) {
       redirect('/pronunciation');
    }
    
    return (
        <>
            {children}
        </>
    );
};

export default LoginLayout;