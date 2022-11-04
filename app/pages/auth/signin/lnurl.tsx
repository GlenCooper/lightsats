import { Loading, Spacer, Text } from "@nextui-org/react";
import { BackButton } from "components/BackButton";
import { NextLink } from "components/NextLink";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import QRCode from "react-qr-code";
import useSWR, { SWRConfiguration } from "swr";
import useSWRImmutable from "swr/immutable";
import { LnurlAuthLoginInfo } from "types/LnurlAuthLoginInfo";
import { LnurlAuthStatus } from "types/LnurlAuthStatus";

type EmailSignInProps = {
  csrfToken: string;
};

const useLnurlStatusConfig: SWRConfiguration = { refreshInterval: 1000 };

export default function LnurlAuthSignIn({ csrfToken }: EmailSignInProps) {
  const router = useRouter();
  const { callbackUrl } = router.query;
  // only retrieve the qr code once
  const { data: qr } = useSWRImmutable<LnurlAuthLoginInfo>(
    "/api/auth/lnurl/generate-secret",
    defaultFetcher
  );

  const { data: status } = useSWR<LnurlAuthStatus>(
    qr ? `/api/auth/lnurl/status?k1=${qr.k1}` : null,
    defaultFetcher,
    useLnurlStatusConfig
  );

  React.useEffect(() => {
    if (qr && status?.verified) {
      (async () => {
        try {
          const result = await signIn("lnurl", {
            k1: qr.k1,
            callbackUrl: (callbackUrl as string) ?? Routes.home,
            redirect: false,
          });

          if (result && result.ok && result.url) {
            router.push(result.url);
          } else {
            throw new Error("Unexpected login result: " + result?.error);
          }
        } catch (error) {
          console.error(error);
          alert("login failed");
        }
      })();
    }
  }, [callbackUrl, csrfToken, qr, router, status]);

  return (
    <>
      <Text>
        Scan or tap the code below to login with your LNURL-auth enabled wallet.
      </Text>
      <Spacer />
      {qr ? (
        <>
          <Loading type="points" color="currentColor" size="sm" />
          <Spacer />
          <NextLink href={`lightning:${qr.encoded}`}>
            <a>
              <QRCode value={qr.encoded} />
            </a>
          </NextLink>
        </>
      ) : (
        <Loading type="spinner" color="currentColor" size="sm" />
      )}
      <Spacer y={4} />
      <BackButton />
    </>
  );
}