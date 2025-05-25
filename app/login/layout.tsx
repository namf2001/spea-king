import { auth } from "@/lib/auth";
import { Header } from "./components/header";
import { redirect } from "next/navigation";

export default async function LoginLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth();
    if (session?.user) {
        redirect("/pronunciation");
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-primary/5">
            <Header />
            <div className="mt-16">
                {children}
            </div>
        </div>
    );
}