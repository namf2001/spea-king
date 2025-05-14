import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email({
        message: "Invalid email",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters long",
    }),
});

export const registerSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters long",
    }),
    email: z.string().email({
        message: "Invalid email",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters long",
    }),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, {
        message: "Current password is required",
    }),
    newPassword: z.string().min(6, {
        message: "New password must be at least 6 characters long",
    }),
    confirmPassword: z.string().min(6, {
        message: "Confirm password must be at least 6 characters long",
    }),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});