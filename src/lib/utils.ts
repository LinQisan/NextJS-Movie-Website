import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const yearDiff = (date: string) => {
  return new Date(Date.now()).getFullYear() - new Date(date).getFullYear();
};
