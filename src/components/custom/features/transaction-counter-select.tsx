'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useFormContext } from 'react-hook-form';
import { Transaction } from '@/lib/types/prisma/transaction';
import { Counter } from '@prisma/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type TransactionCounterSelectProps = {
  onTransactionChange?: (transactionId: string) => void;
  onCounterChange?: (counterId: string) => void;
  selectedTransactionId?: string;
  email?: string;
  onNotApplicableSelected?: (isNotApplicable: boolean) => void;
};

type TransactionWithCounters = Pick<Transaction, 'id' | 'name' | 'code'> & {
  counters: (Pick<Counter, 'id' | 'name' | 'code'> & {
    isAvailable?: boolean;
  })[];
};

type CounterWithAvailability = Pick<Counter, 'id' | 'name' | 'code'> & {
  isAvailable: boolean;
  currentSession?: {
    userId: string;
    expiresAt: Date;
  } | null;
};

export function TransactionCounterSelect({
  onTransactionChange,
  onCounterChange,
  selectedTransactionId,
  email,
  onNotApplicableSelected,
}: TransactionCounterSelectProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<string>(selectedTransactionId || '');
  const [userDepartmentId, setUserDepartmentId] = useState<string | null>(null);
  const [isNotApplicable, setIsNotApplicable] = useState(false);
  const [countersWithAvailability, setCountersWithAvailability] = useState<CounterWithAvailability[]>([]);
  const form = useFormContext();

  // Fetch user's department based on email
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user-department', email],
    queryFn: async () => {
      if (!email || !email.includes('@gscwd.com')) return null;
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_HOST}/api/users/user-department?email=${encodeURIComponent(email)}`
        );
        return response.data;
      } catch (error) {
        console.error('Error fetching user department:', error);
        return null;
      }
    },
    enabled: !!email && !!email.includes('@gscwd.com'),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  // Update department ID when user data loads
  useEffect(() => {
    if (userData?.departmentId) {
      setUserDepartmentId(userData.departmentId);
    } else {
      setUserDepartmentId(null);
      setSelectedTransaction('');
    }
  }, [userData]);

  // Fetch transactions filtered by department
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<TransactionWithCounters[]>({
    queryKey: ['get-transactions-by-department', userDepartmentId],
    queryFn: async () => {
      try {
        const url = userDepartmentId
          ? `${process.env.NEXT_PUBLIC_HOST}/api/transactions/by-department?departmentId=${userDepartmentId}`
          : `${process.env.NEXT_PUBLIC_HOST}/api/counters`;

        const response = await axios.get<TransactionWithCounters[]>(url);
        return response.data;
      } catch (error) {
        toast.error('Error fetching transactions', { description: `${error}` });
        return [];
      }
    },
    enabled: true,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch counter availability status
  const { data: availabilityData } = useQuery({
    queryKey: ['counter-availability', selectedTransaction],
    queryFn: async () => {
      if (!selectedTransaction) return null;
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_HOST}/api/counters/availability?transactionId=${selectedTransaction}`
        );
        return response.data;
      } catch (error) {
        console.error('Error fetching counter availability:', error);
        return null;
      }
    },
    enabled: !!selectedTransaction && !isNotApplicable,
    refetchInterval: 30000, // Refetch every 30 seconds to update availability
    staleTime: 5000,
  });

  // Update counters with availability info
  useEffect(() => {
    const selectedTransactionData = transactions?.find(
      (transaction: TransactionWithCounters) => transaction.id === selectedTransaction
    );

    if (selectedTransactionData?.counters && availabilityData) {
      const countersWithStatus = selectedTransactionData.counters.map((counter) => ({
        ...counter,
        isAvailable: availabilityData[counter.id]?.isAvailable ?? true,
        currentSession: availabilityData[counter.id]?.currentSession ?? null,
      }));
      setCountersWithAvailability(countersWithStatus);
    } else if (selectedTransactionData?.counters) {
      // If availability data not loaded yet, assume all are available
      const countersWithStatus = selectedTransactionData.counters.map((counter) => ({
        ...counter,
        isAvailable: true,
        currentSession: null,
      }));
      setCountersWithAvailability(countersWithStatus);
    } else {
      setCountersWithAvailability([]);
    }
  }, [transactions, selectedTransaction, availabilityData]);

  // Auto-select assigned transaction if exists
  useEffect(() => {
    if (userData?.assignedTransactionId && transactions && transactions.length > 0 && !isNotApplicable) {
      const assignedTransaction = transactions.find((t) => t.id === userData.assignedTransactionId);
      if (assignedTransaction && !selectedTransaction) {
        setSelectedTransaction(assignedTransaction.id);
        onTransactionChange?.(assignedTransaction.id);

        // Auto-select first AVAILABLE counter if only one exists
        const availableCounters = assignedTransaction.counters.filter((c) => {
          const availability = availabilityData?.[c.id];
          return availability?.isAvailable !== false;
        });

        if (availableCounters.length === 1) {
          const firstAvailableCounter = availableCounters[0];
          if (form && form.setValue) {
            form.setValue('counterId', firstAvailableCounter.id);
          }
          onCounterChange?.(firstAvailableCounter.id);
        }
      }
    }
  }, [
    userData,
    transactions,
    selectedTransaction,
    onTransactionChange,
    onCounterChange,
    form,
    isNotApplicable,
    availabilityData,
  ]);

  const handleTransactionChange = (value: string) => {
    // Check if "Not Applicable" is selected
    if (value === 'not-applicable') {
      setIsNotApplicable(true);
      setSelectedTransaction('');
      onTransactionChange?.('');
      onCounterChange?.('');
      onNotApplicableSelected?.(true);

      // Clear counter requirement
      if (form && form.setValue) {
        form.setValue('counterId', '');
        form.setValue('transactionId', '');
      }
    } else {
      setIsNotApplicable(false);
      onNotApplicableSelected?.(false);
      setSelectedTransaction(value);
      onTransactionChange?.(value);
      onCounterChange?.('');

      // Reset counter selection
      if (form && form.setValue) {
        form.setValue('counterId', '');
      }
    }
  };

  const handleCounterChange = (value: string) => {
    if (form && form.setValue) {
      form.setValue('counterId', value);
    }
    onCounterChange?.(value);
  };

  // Get current counter value from form
  const currentCounterValue = form?.watch('counterId') || '';

  // Check if there are any available counters
  const hasAvailableCounters = countersWithAvailability.some((counter) => counter.isAvailable);
  const selectedCounterIsAvailable = countersWithAvailability.find((c) => c.id === currentCounterValue)?.isAvailable;

  // Don't show if no email
  if (!email || !email.includes('@gscwd.com')) {
    return null;
  }

  // Show loading state
  if (isLoadingUser || isLoadingTransactions) {
    return (
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label>Select Transaction</Label>
          <div className="text-sm text-muted-foreground">Loading transactions...</div>
        </div>
      </div>
    );
  }

  // Show message if no department assigned
  if (!userDepartmentId) {
    return (
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label>Select Transaction</Label>
          <div className="text-sm text-red-500">
            No department assigned to your account. Please contact administrator.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <Label htmlFor="transaction">
          Select Transaction <span className="text-red-500">*</span>
        </Label>
        <Select
          value={isNotApplicable ? 'not-applicable' : selectedTransaction}
          onValueChange={handleTransactionChange}
        >
          <SelectTrigger id="transaction" className="w-full">
            <SelectValue placeholder="Choose a transaction" />
          </SelectTrigger>
          <SelectContent>
            {/* Not Applicable option - always shown */}
            <SelectItem value="not-applicable" className="text-muted-foreground">
              Not Applicable (For non-queuing functions)
            </SelectItem>

            {/* Divider */}
            <div className="h-px bg-gray-200 my-1" />

            {/* Regular transactions */}
            {transactions && transactions.length > 0 ? (
              transactions.map((transaction) => (
                <SelectItem key={transaction.id} value={transaction.id}>
                  {transaction.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-transactions" disabled>
                No transactions available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Counter select - only show if a regular transaction is selected (not Not Applicable) */}
      {!isNotApplicable && selectedTransaction && (
        <div className="grid gap-3">
          <Label htmlFor="counter">
            Select Counter <span className="text-red-500">*</span>
          </Label>

          {/* Warning if selected counter is no longer available */}
          {currentCounterValue && selectedCounterIsAvailable === false && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md mb-2">
              ⚠️ Previously selected counter is no longer available. Please select another counter.
            </div>
          )}

          {/* Warning if no available counters */}
          {!hasAvailableCounters && (
            <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded-md mb-2">
              ⚠️ No counters are currently available for this transaction. Please try again later or contact
              administrator.
            </div>
          )}

          <Select
            value={currentCounterValue}
            onValueChange={handleCounterChange}
            disabled={countersWithAvailability.length === 0 || !hasAvailableCounters}
          >
            <SelectTrigger
              id="counter"
              className={cn(
                'w-full',
                currentCounterValue && selectedCounterIsAvailable === false && 'border-red-500 ring-red-500'
              )}
            >
              <SelectValue placeholder="Choose a counter" />
            </SelectTrigger>
            <SelectContent>
              {countersWithAvailability.length > 0 ? (
                countersWithAvailability.map((counter) => (
                  <SelectItem
                    key={counter.id}
                    value={counter.id}
                    disabled={!counter.isAvailable}
                    className={cn(!counter.isAvailable && 'text-muted-foreground opacity-60')}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>
                        {counter.name} {counter.code && `(${counter.code})`}
                      </span>
                      {!counter.isAvailable && <span className="text-xs text-red-500 ml-2">(Occupied)</span>}
                      {counter.isAvailable && <span className="text-xs text-green-500 ml-2">(Available)</span>}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-counters" disabled>
                  No counters available for this transaction
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Show message when Not Applicable is selected */}
      {isNotApplicable && (
        <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
          <p className="font-semibold">Queuing features disabled</p>
          <p className="text-xs mt-1">
            You&apos;re logging in without queuing capabilities. You only have access to dashboard, reports, and other
            administrative functions only.
          </p>
        </div>
      )}
    </div>
  );
}
