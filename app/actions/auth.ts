"use server";

import { signIn, signOut } from "@/lib/auth";

export async function signInWithGithub() {
    await signIn("github");
}

export async function signInWithGoogle() {
    await signIn("google");
}

export async function signInWithFacebook() {
    await signIn("facebook");
}

export async function logout() {
    await signOut({ redirectTo: '/' });
}
