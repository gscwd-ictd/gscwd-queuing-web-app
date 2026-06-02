'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { accountLoginFormSchema } from '@/lib/schemas/dashboard/accountLoginFormSchema';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TransactionCounterSelect } from './transaction-counter-select';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState, useMemo } from 'react';
import { ShellIcon, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

type SignInOptions = {
  redirect: boolean;
  email: string;
  password: string;
  transactionId?: string;
  counterId?: string;
};

export function LoginForm() {
  const router = useRouter();
  const [selectedTransactionId, setSelectedTransactionId] = useState('');
  const [selectedCounterId, setSelectedCounterId] = useState('');
  const [isNotApplicable, setIsNotApplicable] = useState(false);

  const form = useForm<z.infer<typeof accountLoginFormSchema>>({
    resolver: zodResolver(accountLoginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      transactionId: '',
      counterId: '',
    },
  });

  const email = form.watch('email');
  const debouncedEmail = useDebounce(email, 500);
  const password = form.watch('password');
  const transactionId = form.watch('transactionId');
  const counterId = form.watch('counterId');

  // Check if user exists and has queuing access
  const { data: userCheckData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['check-user-by-email', debouncedEmail],
    queryFn: async () => {
      if (!debouncedEmail || !debouncedEmail.includes('@gscwd.com')) return null;
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/users/check-user?email=${encodeURIComponent(debouncedEmail)}`
      );
      return response.data;
    },
    enabled: !!debouncedEmail && !!debouncedEmail.includes('@gscwd.com'),
    retry: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const shouldShowCounterSelect = userCheckData?.user?.allowedRoutes?.includes('/queuing');

  // Determine if we should show loading spinner - use debouncedEmail for consistency
  const showEmailLoadingSpinner = debouncedEmail && debouncedEmail.includes('@gscwd.com') && isLoadingUser;

  // Determine if login button should be disabled - use debouncedEmail
  const isLoginDisabled = useMemo(() => {
    // If still loading user data, disable button
    if (isLoadingUser) return true;

    // If no email or password, disable button
    if (!debouncedEmail || !password) return true;

    // If user doesn't have queuing access, enable button (no transaction/counter needed)
    if (!shouldShowCounterSelect) return false;

    // If "Not Applicable" is selected, enable button (bypass transaction/counter requirement)
    if (isNotApplicable) return false;

    // If user has queuing access, require both transaction and counter selection
    if (shouldShowCounterSelect) {
      return !transactionId || !counterId;
    }

    // Default: enable button
    return false;
  }, [debouncedEmail, password, isLoadingUser, shouldShowCounterSelect, transactionId, counterId, isNotApplicable]);

  // Get button text based on state - use debouncedEmail
  const getButtonText = () => {
    if (isLoadingUser) return 'Loading...';
    if (!debouncedEmail) return 'Enter email';
    if (!password) return 'Enter password';
    if (isNotApplicable) return 'Login (Non-Queuing Mode)';
    if (shouldShowCounterSelect && (!transactionId || !counterId)) {
      return 'Please select transaction and counter';
    }
    return 'Login';
  };

  // Update form values when transaction/counter changes
  useEffect(() => {
    form.setValue('transactionId', selectedTransactionId);
    form.setValue('counterId', selectedCounterId);
  }, [selectedTransactionId, selectedCounterId, form]);

  // Clear selections when debouncedEmail changes
  useEffect(() => {
    if (debouncedEmail && (!userCheckData || userCheckData.user?.role !== 'user')) {
      setSelectedTransactionId('');
      setSelectedCounterId('');
      setIsNotApplicable(false);
      form.setValue('transactionId', '');
      form.setValue('counterId', '');
    }
  }, [debouncedEmail, userCheckData, form]);

  async function onSubmit(values: z.infer<typeof accountLoginFormSchema>) {
    // Additional validation before submitting
    if (!isNotApplicable && shouldShowCounterSelect && (!values.transactionId || !values.counterId)) {
      toast.error('Error', { description: 'Please select both transaction and counter' });
      return;
    }

    // Build the signIn options - ONLY include transactionId/counterId if NOT "Not Applicable"
    const signInOptions: SignInOptions = {
      redirect: false,
      email: values.email,
      password: values.password,
    };

    // Only add transactionId and counterId if "Not Applicable" is NOT selected
    if (!isNotApplicable && values.transactionId && values.counterId) {
      signInOptions.transactionId = values.transactionId;
      signInOptions.counterId = values.counterId;
    }

    const res = await signIn('credentials', signInOptions);

    if (!res?.error) {
      // Conditional redirect based on login mode
      if (isNotApplicable || !shouldShowCounterSelect) {
        router.push(`${process.env.NEXT_PUBLIC_HOST}/home`);
        toast.success('Success', {
          description: 'Login successful',
        });
      } else {
        router.push(`${process.env.NEXT_PUBLIC_HOST}/queuing`);
        toast.success('Success', {
          description: () => (
            <span className="flex gap-2">
              <ShellIcon className="animate-spin" /> Login successful (Queuing mode)
            </span>
          ),
        });
      }
    } else {
      toast.error('Error', { description: `${res.error}` });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your details below to login to your account
          </p>
        </div>

        <div className="grid gap-6">
          <div className="grid gap-3">
            <FormField
              control={form.control}
              name={'email'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@gscwd.com"
                        className={showEmailLoadingSpinner ? 'pr-10' : ''}
                        {...field}
                      />
                    </FormControl>
                    {showEmailLoadingSpinner && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <FormMessage />

                  {showEmailLoadingSpinner && (
                    <p className="text-xs text-muted-foreground mt-1">Fetching user data...</p>
                  )}
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-3">
            <FormField
              control={form.control}
              name={'password'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <FormControl>
                    <Input id="password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {shouldShowCounterSelect && (
            <TransactionCounterSelect
              onTransactionChange={(transactionId) => {
                setSelectedTransactionId(transactionId);
              }}
              onCounterChange={(counterId) => {
                setSelectedCounterId(counterId);
              }}
              selectedTransactionId={selectedTransactionId}
              email={debouncedEmail} // CHANGED: Use debouncedEmail here
              onNotApplicableSelected={setIsNotApplicable}
            />
          )}

          <Button
            type="submit"
            className="w-full"
            size="sm"
            disabled={isLoginDisabled}
            title={isLoginDisabled ? getButtonText() : ''}
          >
            {getButtonText()}
          </Button>
        </div>
      </form>
    </Form>
  );
}
