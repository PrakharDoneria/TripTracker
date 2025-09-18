
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AuthLayout } from '@/components/layout/auth-layout';

const formSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type LoginFormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    try {
      await login(values.email, values.password);
      // The onAuthStateChanged listener in useAuth will handle redirection
      // and email verification checks. We just need to show a success toast here.
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      router.push('/app');
    } catch (error: any) {
      console.error('Login failed:', error);
      let description = 'An unexpected error occurred.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          description = 'Invalid email or password.';
      } else if (error.code === 'auth/invalid-email') {
          description = 'Please enter a valid email address.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className='p-8 flex flex-col justify-center h-full'>
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground font-headline">Login</h1>
            <p className="text-muted-foreground">
                Enter your email below to login to your account
            </p>
        </div>
        
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                    <Input
                    placeholder="m@example.com"
                    type="email"
                    {...field}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                    <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
            </Button>
        </form>
        </Form>
        <div className="mt-6 text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="underline text-primary font-medium">
            Sign up
        </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
