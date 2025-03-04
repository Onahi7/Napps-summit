import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

export function formatCurrency(amount: number, currency: string = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generatePaginationArray(
  currentPage: number,
  totalPages: number,
  maxLength: number = 7
): (number | '...')[] {
  if (totalPages <= maxLength) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const sideWidth = maxLength < 9 ? 1 : 2;
  const leftWidth = (maxLength - sideWidth * 2 - 3) >> 1;
  const rightWidth = (maxLength - sideWidth * 2 - 3) >> 1;

  if (currentPage <= maxLength - sideWidth - 1 - rightWidth) {
    return [
      ...Array.from({ length: maxLength - sideWidth - 1 }, (_, i) => i + 1),
      '...',
      ...Array.from({ length: sideWidth }, (_, i) => totalPages - sideWidth + i + 1),
    ];
  }

  if (currentPage >= totalPages - sideWidth - 1 - rightWidth) {
    return [
      ...Array.from({ length: sideWidth }, (_, i) => i + 1),
      '...',
      ...Array.from(
        { length: maxLength - sideWidth - 1 },
        (_, i) => totalPages - maxLength + sideWidth + 2 + i
      ),
    ];
  }

  return [
    ...Array.from({ length: sideWidth }, (_, i) => i + 1),
    '...',
    ...Array.from(
      { length: maxLength - sideWidth * 2 - 2 },
      (_, i) => currentPage - leftWidth + i
    ),
    '...',
    ...Array.from({ length: sideWidth }, (_, i) => totalPages - sideWidth + i + 1),
  ];
}
