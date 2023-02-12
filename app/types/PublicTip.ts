import { Tip, User } from "@prisma/client";

// TODO: add tipperName, expiry etc.
export type PublicTip = Pick<
  Tip,
  | "id"
  | "amount"
  | "tipperId"
  | "tippeeId"
  | "currency"
  | "note"
  | "status"
  | "expiry"
  | "tippeeName"
  | "created"
  | "tippeeLocale"
  | "onboardingFlow"
  | "lastWithdrawal"
  | "updated"
  | "recommendedWalletId"
> & {
  hasClaimed: boolean;
  tipper: Pick<User, "name" | "twitterUsername" | "avatarURL"> & {
    fallbackAvatarId: string | undefined;
  };
  tippee:
    | (Pick<
        User,
        "journeyStep" | "inJourney" | "name" | "twitterUsername" | "avatarURL"
      > & {
        fallbackAvatarId: string | undefined;
      })
    | undefined;
};
