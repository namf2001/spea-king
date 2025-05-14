import { Role } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
    interface User {
        role: Role;
        id?: string;
    }

    interface Session {
        user: {
            name: string;
            email: string;
            image: string;
            role: Role;
            id: string;
            createdAt: Date;
        }
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: Role;
    }
}