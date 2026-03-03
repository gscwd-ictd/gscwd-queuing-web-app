"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { step1Schema } from "@/lib/schemas/kiosk/kioskFormSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { transactionOptions } from "@/lib/constants/kiosk/transactionOptions";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { KioskSubmitSuccess } from "../kiosk-submit-success";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { KioskSubmitPending } from "../kiosk-submit-pending";
import { KioskSubmitError } from "../kiosk-submit-error";
import { toast } from "sonner";
import { KioskConfirmPaymentTransaction } from "../kiosk-confirm-payment-transaction";
import { useSocket } from "@/components/providers/socket-provider";
import { printTicket } from "@/lib/functions/kiosk/printTicket";
import { useKioskFormStore } from "@/lib/store/kiosk/useKioskFormStore";
import { GeneratedQueuingTicket } from "@/lib/types/prisma/queuingTicket";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { KioskStepsFormHeader } from "./kiosk-steps-form-header";

type Step1FormValues = z.infer<typeof step1Schema>;

const createQueuingTicket = async (
  formData: Partial<GeneratedQueuingTicket>
) => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_HOST}/api/queuing-tickets`,
    formData
  );
  return response.data;
};

export function Step1Form() {
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const {
    resetForm,
    queuingTicket,
    setQueuingTicket,
    showPaymentTransactionConfirmation,
    setShowPaymentTransactionConfirmation,
  } = useKioskFormStore();

  const { mutate, isPending, isError } = useMutation({
    mutationFn: createQueuingTicket,
    onSuccess: (ticketData: Partial<GeneratedQueuingTicket>) => {
      setQueuingTicket(ticketData);
      setPending(false);
      setSuccess(true);

      printTicket(ticketData);

      if (!socket) return;

      socket.emit("ticket-created", {
        id: ticketData.id,
        number: ticketData.number,
        position: ticketData.position,
        queuingStatus: ticketData.queuingStatus,
        isPrioritized: ticketData.isPrioritized,
        dateCreated: ticketData.dateCreated,
        transaction: {
          id: ticketData.transaction?.id,
          name: ticketData.transaction?.name,
          code: ticketData.transaction?.code,
        },
      });

      const queriesToInvalidate = [
        ["get-all-regular-queuing-tickets"],
        ["get-all-special-lane-queuing-tickets"],
      ];

      queriesToInvalidate.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });
    },
    onError: (error) => {
      setError(true);
      toast.error("Error", {
        description: error.message,
      });
    },
  });

  const form = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      transaction: { id: "" },
      isPrioritized: false,
    },
  });

  function onSubmit(data: Step1FormValues) {
    const formData = {
      transaction: {
        id: data.transaction.id,
      },
      isPrioritized: data.isPrioritized,
    };
    mutate(formData);
    setPending(true);
  }

  const handleTransactionChange = (value: string) => {
    form.setValue("transaction.id", value);
    const selectedOption = transactionOptions.find(
      (option) => option.id === value
    );
    if (selectedOption?.name === "Payment") {
      setShowPaymentTransactionConfirmation(true);
    }
  };

  useEffect(() => {
    if (success) {
      form.reset({
        transaction: { id: "" },
        isPrioritized: false,
      });

      const timer = setTimeout(() => {
        setSuccess(false);
        resetForm();
      }, 5000);
      return () => {
        clearTimeout(timer);
        resetForm();
      };
    }
  }, [form, queuingTicket, resetForm, success]);

  return (
    <>
      {isPending ? (
        <KioskSubmitPending open={pending} onOpenChange={setPending} />
      ) : null}

      {isError ? (
        <KioskSubmitError open={error} onOpenChange={setError} />
      ) : null}

      {success && queuingTicket ? (
        <KioskSubmitSuccess
          open={success}
          onOpenChange={setSuccess}
          data={queuingTicket}
        />
      ) : null}

      <KioskConfirmPaymentTransaction
        open={showPaymentTransactionConfirmation}
        onOpenChange={setShowPaymentTransactionConfirmation}
      />

      <div className="flex-1 flex flex-col items-start justify-between w-full h-full">
        <div className="h-full w-full flex flex-col flex-1 justify-between">
          <div className="flex h-[25%]">
            <KioskStepsFormHeader />
          </div>
          <div className="flex h-[75%]">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col items-center justify-between gap-10 w-full"
              >
                <div className="flex flex-col items-center justify-between w-full h-full gap-10">
                  <FormField
                    control={form.control}
                    name="transaction.id"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-10 w-full justify-between">
                        <div className="flex flex-col mb-2 gap-4">
                          <FormLabel className="text-8xl font-bold">
                            Transaction
                          </FormLabel>
                          <div className="flex flex-col gap-2 w-full">
                            <FormDescription className="text-gray-600 dark:text-white text-4xl">
                              Select the transaction that you want to avail
                            </FormDescription>
                            <span className="italic font-normal text-3xl text-gray-400 dark:text-white">
                              Pilia ang transaksyon nga gusto nimo kuhaon
                            </span>
                          </div>
                        </div>
                        <FormControl>
                          <RadioGroup
                            onValueChange={handleTransactionChange}
                            value={field.value}
                            className="flex flex-col w-full gap-10"
                          >
                            {transactionOptions &&
                              transactionOptions.map((option) => (
                                <FormItem key={option.id}>
                                  <FormControl>
                                    <RadioGroupItem
                                      value={option.id}
                                      className="sr-only peer"
                                      id={option.name}
                                    />
                                  </FormControl>
                                  <FormLabel
                                    htmlFor={option.name}
                                    className="w-full border border-gray-400 bg-white rounded-md cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white transition-colors h-48 p-12 dark:peer-data-[state=checked]:bg-blue-800 flex flex-row items-center gap-12 shadow-md"
                                  >
                                    <option.icon
                                      className="w-36 h-36"
                                      strokeWidth={1}
                                    />
                                    <div className="flex flex-col gap-3">
                                      <p className="text-5xl font-bold">
                                        {option.name}
                                      </p>
                                      <p className="italic font-normal text-4xl">
                                        {option.translation}
                                      </p>
                                    </div>
                                  </FormLabel>
                                </FormItem>
                              ))}
                          </RadioGroup>
                        </FormControl>
                        {form.formState.errors.transaction?.id && (
                          <p className="text-4xl text-destructive leading-none">
                            {form.formState.errors.transaction?.id.message}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isPrioritized"
                    render={({ field }) => (
                      <FormItem>
                        <Label
                          className={cn(
                            "flex flex-row w-full shadow-md cursor-pointer bg-white items-center gap-12 rounded-lg p-10 border-2 border-gray-300 transition",
                            "hover:bg-accent/50 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50",
                            "dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950"
                          )}
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="w-30 h-30 border-4 border-gray-800 [&_svg]:w-30 [&_svg]:h-30"
                            />
                          </FormControl>

                          <div className="w-full space-y-2">
                            <FormDescription className="text-4xl font-semibold text-black dark:text-white">
                              Are you a senior citizen, pregnant, or PWD?
                            </FormDescription>
                            <span className="italic text-gray-500 dark:text-white text-3xl">
                              Ikaw ba usa ka senior citizen, mabdos, o PWD?
                            </span>
                          </div>
                        </Label>
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  variant={"default"}
                  className="w-full h-48 justify-start items-center p-4 gap-6"
                  type="submit"
                  disabled={isPending}
                >
                  <ArrowRight className="h-10 w-10 !size-20" />
                  <p className="text-[60px]">SUBMIT</p>
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
