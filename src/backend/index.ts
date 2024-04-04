import express from "express";

const app = express();

const ATTEST_SERVER = "https://attest-theta.vercel.app";
const EAS_URL = "https://base-sepolia.easscan.org";
const GITCOIN_PASSPORT_URL = "https://passport.gonzalomelov.xyz";

app.use(express.json());

app.get("/", (req, res) => {
  res.send(
    pageFromTemplate(
      "https://farcaster-on-chain-verification.s3.amazonaws.com/frame1.gif",
      "✅ Get Verified",
      `${ATTEST_SERVER}/api/action`,
      mainPageBody
    )
  );
});

app.post("/refresh", async (req, res) => {
  console.log("refresh");

  try {
    const address = req.query.address;

    res.send(
      pageWithLinkFromTemplate(
        "https://farcaster-on-chain-verification.s3.amazonaws.com/frame3.png",
        "🏷️ Claim Stamp",
        GITCOIN_PASSPORT_URL,
        "👀 See EAS Verification",
        `${EAS_URL}/address/${address}`,
        mainPageBody
      )
    );
  } catch (err) {
    let message = "";
    if (typeof err === "string") {
      message = err;
    } else if (err instanceof Error) {
      message = err.message;
    }

    res.send(
      pageFromTemplate(
        "https://ipfs.io/ipfs/QmawGYH6TdvxsC1zhMXtAPJcjy7R5yCMQ6SBmUrwGD5pNE",
        message,
        `https://s3afo-miaaa-aaaap-ag7da-cai.raw.icp0.io/refresh`,
        mainPageBody
      )
    );
  }
});

app.listen();

const mainPageBody = `
<div>
        <h1>
          Help build a trustful decentralized identity infraestructure ⛓️
        </h1>
        <p>
          Verify your Farcaster account and claim your Gitcoin Passport stamp to improve your humanity and reputation score!
        </p>
        <p>
            Go to <a href='https://warpcast.com/gonzalomelov/0x6631596f'>Warpcast</a> and complete the steps directly on the Frame!
        </p>
    </div>
`;

let pageFromTemplate = (
  imageUrl: string,
  button1Text: string,
  apiUrl: string,
  body: string
) => `
<!DOCTYPE html>
<html lang='en'>

<head>
    <meta charset='utf-8' />
    <meta name='viewport' content='width=device-width, initial-scale=1' />
    <meta name='next-size-adjust' />
    <meta property='fc:frame' content='vNext' />
    <meta property='fc:frame:image' content='${imageUrl}' />
    <meta property='fc:frame:button:1' content='${button1Text}' />
    <meta property='fc:frame:post_url' content='${apiUrl}' />
    <meta property='og:title' content='Farcaster On-Chain Verification' />
    <meta property='og:image' content='${imageUrl}' />
    <title>Farcaster On-Chain Verification</title>
</head>

<body>
    ${body}
</body>

</html>
`;

let pageWithLinkFromTemplate = (
  imageUrl: string,
  button1Text: string,
  button1ApiUrl: string,
  button2Text: string,
  button2ApiUrl: string,
  body: string
) => `
<!DOCTYPE html>
<html lang='en'>

<head>
    <meta charset='utf-8' />
    <meta name='viewport' content='width=device-width, initial-scale=1' />
    <meta name='next-size-adjust' />
    <meta property='fc:frame' content='vNext' />
    <meta property='fc:frame:image' content='${imageUrl}' />
    <meta property='fc:frame:button:1' content='${button1Text}' />
    <meta property='fc:frame:button:1:action' content='link' />
    <meta property='fc:frame:button:1:target' content='${button1ApiUrl}' />
    <meta property='fc:frame:button:2' content='${button2Text}' />
    <meta property='fc:frame:button:2:action' content='link' />
    <meta property='fc:frame:button:2:target' content='${button2ApiUrl}' />
    <meta property='og:title' content='Farcaster On-Chain Verification' />
    <meta property='og:image' content='${imageUrl}' />
    <title>Farcaster On-Chain Verification</title>
</head>

<body>
    ${body}
</body>

</html>
`;