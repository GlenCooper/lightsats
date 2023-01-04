import { StatusCodes } from "http-status-codes";
import { refundableTipStatuses } from "lib/constants";
import prisma from "lib/prismadb";
import { reclaimTip } from "lib/reclaimTip";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<never>
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }

  switch (req.method) {
    case "POST":
      return handleReclaimTip(session, req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}

async function handleReclaimTip(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse<never>
) {
  const { id } = req.query;
  const tip = await prisma.tip.findUnique({
    where: {
      id: id as string,
    },
    include: {
      lnbitsWallet: true,
    },
  });
  if (!tip) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }
  if (session.user.id !== tip.tipperId) {
    return res.status(StatusCodes.FORBIDDEN).end();
  }
  if (refundableTipStatuses.indexOf(tip.status) < 0) {
    return res.status(StatusCodes.CONFLICT).end();
  }

  await reclaimTip(tip);

  return res.status(204).end();
}
