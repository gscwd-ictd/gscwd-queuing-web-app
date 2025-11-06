import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";
import React, { useCallback, useEffect, useRef } from "react";

type ButtonWithShortcutKeyProps = {
  shortcutKey: string | null;
  children: React.ReactNode;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
};

export function ButtonWithShortcutKey({
  shortcutKey,
  className,
  variant,
  size,
  children,
  onClick,
  disabled = false,
  ...props
}: ButtonWithShortcutKeyProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>) {
  const isDisabledRef = useRef(disabled);
  const onClickRef = useRef(onClick);

  useEffect(() => {
    isDisabledRef.current = disabled;
  }, [disabled]);

  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  const handleKeyShortcut = useCallback((e: KeyboardEvent) => {
    if (isDisabledRef.current) return;

    const activeElement = document.activeElement;
    if (
      activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement ||
      activeElement instanceof HTMLSelectElement
    ) {
      return;
    }

    const modals = document.querySelectorAll(
      '[role="dialog"], [data-state="open"]'
    );
    if (modals.length > 0) return;

    e.preventDefault();
    onClickRef.current({} as React.MouseEvent<HTMLButtonElement>);
  }, []);

  useEffect(() => {
    if (!shortcutKey) return;

    const keydown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === shortcutKey.toLowerCase()) {
        handleKeyShortcut(e);
      }
    };

    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [shortcutKey, handleKeyShortcut]);

  return (
    <Button
      {...props}
      onClick={onClick}
      disabled={disabled}
      className={cn(buttonVariants({ variant, size, className }))}
      aria-keyshortcuts={shortcutKey?.toString()}
    >
      {shortcutKey ? (
        <>
          {children} ({shortcutKey})
        </>
      ) : (
        children
      )}
    </Button>
  );
}
