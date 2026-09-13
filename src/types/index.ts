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
export type Account = "BANK" | "SAVINGS" | "POCKET_MONEY" | "WALLET";

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string | null;
}

export interface Bank {
  id: string;
  name: string;
  details?: string | null;
}

export interface Wallet {
  id: string;
  name: string;
  details?: string | null;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  scope: Scope;
  paymentMethod: PaymentMethod;
  account: Account;
  bankId?: string | null;
  bank?: Bank | null;
  walletId?: string | null;
  wallet?: Wallet | null;
  transferId?: string | null;
  isDeposit?: boolean;
  source: string;
  note?: string | null;
  occurredAt: string;
  category?: Category | null;
}
