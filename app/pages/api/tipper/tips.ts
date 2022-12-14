import { Tip } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { createAchievement } from "lib/createAchievement";
import {
  createLnbitsUserAndWallet,
  generateUserAndWalletName,
} from "lib/lnbits/createLnbitsUserAndWallet";
import prisma from "lib/prismadb";
import { recreateTipFundingInvoice } from "lib/recreateTipFundingInvoice";
import { calculateFee } from "lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { CreateTipRequest } from "types/TipRequest";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Tip | Tip[]>
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }

  switch (req.method) {
    case "POST":
      return handlePostTip(session, req, res);
    case "GET":
      return getTips(session, req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}
async function getTips(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse<Tip[]>
) {
  const tips = await prisma.tip.findMany({
    where: {
      tipperId: {
        equals: session.user.id,
      },
    },
    orderBy: {
      created: "desc",
    },
  });

  return res.status(StatusCodes.OK).json(tips);
}

async function handlePostTip(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse<Tip>
) {
  if (!process.env.APP_URL) {
    throw new Error("No APP_URL provided");
  }
  if (!process.env.LNBITS_URL) {
    throw new Error("No LNBITS_URL provided");
  }
  if (!process.env.LNBITS_API_KEY) {
    throw new Error("No LNBITS_API_KEY provided");
  }
  if (!process.env.LNBITS_WEBHOOK_SECRET_KEY) {
    throw new Error("No LNBITS_WEBHOOK_SECRET_KEY provided");
  }
  if (!process.env.LNBITS_USER_ID) {
    throw new Error("No LNBITS_USER_ID provided");
  }

  const createTipRequest = req.body as CreateTipRequest;
  if (
    createTipRequest.amount <= 0 ||
    Math.floor(createTipRequest.amount) !== createTipRequest.amount
  ) {
    throw new Error("Only tips with positive, whole amounts are allowed");
  }

  const expiry = createTipRequest.expiry;
  const fee = calculateFee(createTipRequest.amount);
  let tip = await prisma.tip.create({
    data: {
      tipperId: session.user.id,
      amount: createTipRequest.amount,
      fee,
      status: "UNFUNDED",
      expiry,
      currency: createTipRequest.currency,
      skipOnboarding: createTipRequest.skipOnboarding,
      version: 1 /* 0=all tips in same bucket, 1=one wallet per tip */,
    },
  });

  const deleteTip = () =>
    prisma.tip.delete({
      where: {
        id: tip.id,
      },
    });

  // create a user and wallet for the tip
  const { createLnbitsUserResponse, createLnbitsUserResponseBody } =
    await createLnbitsUserAndWallet(generateUserAndWalletName("tip", tip.id));

  if (!createLnbitsUserResponse.ok) {
    console.error(
      "Failed to create lnbits user+wallet for tip",
      createLnbitsUserResponseBody
    );
    await deleteTip();
    throw new Error("Failed to create lnbits user+wallet for tip");
  }

  const lnbitsWallet = createLnbitsUserResponseBody.wallets[0];
  try {
    // save the newly-created lnbits wallet (for creating/paying invoice)
    await prisma.lnbitsWallet.create({
      data: {
        tipId: tip.id,
        id: lnbitsWallet.id,
        lnbitsUserId: lnbitsWallet.user,
        adminKey: lnbitsWallet.adminkey,
      },
    });
  } catch (error) {
    console.error("Failed to save tip lnbits wallet to database", error);
    await deleteTip();
    throw new Error("Failed to save tip lnbits wallet to database");
  }

  tip = await recreateTipFundingInvoice(tip, lnbitsWallet.adminkey);

  await createAchievement(session.user.id, "CREATED_TIP");

  res.json(tip);
}
