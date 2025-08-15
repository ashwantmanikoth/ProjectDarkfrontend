"use client";

import React from "react";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Backdrop } from "./backdrop";
import { AlertTriangle, Trash2 } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  icon,
  disabled = false
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const defaultIcon = variant === "destructive" ? (
    <AlertTriangle className="w-6 h-6 text-destructive" />
  ) : (
    <AlertTriangle className="w-6 h-6 text-primary" />
  );

  return (
    <Backdrop>
      <Card className="max-w-md w-full mx-4 shadow-xl border-border/50 transition-all duration-200 scale-100 dark:shadow-2xl dark:shadow-black/20">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-2">
            {icon || defaultIcon}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-base">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-none"
            >
              {cancelText}
            </Button>
            <Button
              variant={variant === "destructive" ? "destructive" : "default"}
              onClick={handleConfirm}
              disabled={disabled}
              className="flex-1 sm:flex-none"
            >
              {confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Backdrop>
  );
}
