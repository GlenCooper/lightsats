import {
  LnbitsWallet,
  SentReminder,
  Tip,
  User,
  Withdrawal,
  WithdrawalError,
} from "@prisma/client";

export type AdminDashboard = {
  adminUsers: User[];
  users: User[];
  lnbitsDashboardUrl: string;
  tips: Tip[];
  withdrawals: AdminExtendedWithdrawal[];
  withdrawalErrors: AdminExtendedWithdrawalError[];
  walletBalance: number;
  smsForSatsAccountBalance: number;
};

export type AdminExtendedUser = User & {
  tipsSent: Tip[];
  lnbitsWallet: LnbitsWallet | null;
  tipsReceived: Tip[];
  lnbitsWalletUrl: string | undefined;
  walletBalance: number;
  withdrawals: AdminExtendedWithdrawal[];
  withdrawalErrors: AdminExtendedWithdrawalError[];
};

export type AdminExtendedTip = Tip & {
  tipper: User;
  tippee: User | null;
  sentReminders: SentReminder[];
  withdrawal: AdminExtendedWithdrawal | null;
  withdrawalErrors: AdminExtendedWithdrawalError[];
  lnbitsWallet: LnbitsWallet | null;
  lnbitsWalletUrl: string | undefined;
  walletBalance: number;
};

export type AdminExtendedWithdrawal = Withdrawal & {
  tips: Tip[];
  user: User | null;
};
export type AdminExtendedWithdrawalError = WithdrawalError & {
  user: User | null;
  tip: Tip | null;
};
