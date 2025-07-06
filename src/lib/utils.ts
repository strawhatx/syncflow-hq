import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getImagePath = (icon_name: string) => {
  if (!icon_name) return;
  return `/svg/${icon_name}.svg`;
};
