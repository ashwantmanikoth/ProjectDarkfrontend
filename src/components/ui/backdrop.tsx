"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BackdropProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Backdrop({ children, className, onClick }: BackdropProps) {
  return (
    <div 
      className={cn(
        "fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-200",
        "dark:bg-background/60 dark:backdrop-blur-lg",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
