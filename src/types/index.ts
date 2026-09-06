export type TransactionType = "INCOME" | "EXPENSE";
export type Scope = "PERSONAL" | "FAMILY" | "BUSINESS";
export type PaymentMethod =
  | "CASH"
  | "BKASH"
  | "NAGAD"
  | "ROCKET"
  | "BANK_TRANSFER"
  | "CARD"
  | "OTHER";

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string | null;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  scope: Scope;
  paymentMethod: PaymentMethod;
  source: string;
  note?: string | null;
  occurredAt: string;
  category?: Category | null;
}
