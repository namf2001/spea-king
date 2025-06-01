'use client';

import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';

import { signInWithFacebook } from '@/app/actions/auth';

const FacebookSignInButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button
      variant="outline"
      className="group relative w-full overflow-hidden"
      disabled={pending}
      aria-label="Sign in with Facebook"
    >
      <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
      {pending ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <>
          <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" aria-hidden="true">
            <path
              fill="#1877F2"
              d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
            />
          </svg>
          <span>Facebook</span>
        </>
      )}
    </Button>
  );
};

const FacebookSignIn = () => {
  return (
    <form action={signInWithFacebook}>
      <FacebookSignInButton />
    </form>
  );
};

export { FacebookSignIn };
