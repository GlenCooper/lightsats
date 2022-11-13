import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { Card, Grid, Image, Spacer, Text } from "@nextui-org/react";
import { Icon } from "components/Icon";
import { MyBitcoinJourneyContent } from "components/tippee/MyBitcoinJourneyContent";
import { MyBitcoinJourneyFooter } from "components/tippee/MyBitcoinJourneyFooter";
import { MyBitcoinJourneyHeader } from "components/tippee/MyBitcoinJourneyHeader";
import { Routes } from "lib/Routes";
import type { NextPage } from "next";
import Head from "next/head";

const WhatIsBitcoinPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Bitcoin</title>
      </Head>
      <MyBitcoinJourneyHeader />
      <MyBitcoinJourneyContent>
        <Image
          alt="Diamond hands"
          src="/images/guide/diamond-hands.png"
          width={250}
        />
        <Text h3 style={{ width: "100%" }}>
          Bitcoin is magic internet money
        </Text>
        <Text>
          {
            "Bitcoin is a digital currency that does not require any intermediary to send and receive from one person to another."
          }
        </Text>
        <Spacer />
        <Text>
          {
            "Just like you received this tip from someone digitally, it never went through a bank or any entity."
          }
        </Text>
        <Spacer y={1} />
        <Card variant="flat">
          <Card.Body>
            <Grid.Container>
              <Grid xs={1}>
                <Icon>
                  <InformationCircleIcon />
                </Icon>
              </Grid>
              <Grid xs={10}>
                {
                  "To withdraw your bitcoin, you'll first need a bitcoin wallet. Find out more in the next step."
                }
              </Grid>
            </Grid.Container>
          </Card.Body>
        </Card>
      </MyBitcoinJourneyContent>
      <MyBitcoinJourneyFooter
        href={Routes.journeySelectWallet}
        text={<>Continue</>}
        nextUp="Download a wallet"
      />
    </>
  );
};

export default WhatIsBitcoinPage;
