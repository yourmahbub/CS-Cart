/** Order statuses, shared by the list and the detail page so the two agree. */
export const ORDER_STATUSES = [
  'pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled', 'refunded', 'failed',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_STYLE: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  paid: 'bg-green-50 text-green-700 border-green-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
  refunded: 'bg-gray-100 text-gray-600 border-gray-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
};

export const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded', 'failed'] as const;

/**
 * Order timestamps come from SQLite as "YYYY-MM-DD HH:MM:SS" in UTC with no
 * zone marker, so they have to be stamped as UTC before being displayed.
 */
export function formatOrderDate(value: string | undefined): string {
  if (!value) return '';
  const date = new Date(value.replace(' ', 'T') + 'Z');
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
