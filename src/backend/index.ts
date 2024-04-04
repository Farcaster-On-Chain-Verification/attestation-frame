import express, { Request, Response } from 'express';

const app = express();

const ATTEST_SERVER = "https://attest-theta.vercel.app";
const EAS_URL = "https://arbitrum.easscan.org";
const GITCOIN_PASSPORT_URL = "https://passport.gonzalomelov.xyz";

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  const buttons: Button[] = [{
    text: "✅ Get Verified",
    action: "post",
    url: `${ATTEST_SERVER}/api/action`
  }];

  res.send(pageTemplate(
    "https://farcaster-on-chain-verification.s3.amazonaws.com/frame1.gif",
    "Farcaster On-Chain Verification",
    mainPageBody,
    buttons
  ));
});

app.post("/refresh", (req: Request, res: Response) => {
  const address = req.query.address as string;

  const buttons: Button[] = [
    {
      text: "🏷️ Claim Stamp",
      action: "link",
      url: GITCOIN_PASSPORT_URL
    },
    {
      text: "👀 See Verification on EAS",
      action: "link",
      url: `${EAS_URL}/address/${address}`
    }
  ];

  res.send(pageTemplate(
    "https://farcaster-on-chain-verification.s3.amazonaws.com/frame3.png",
    "Claim Your Stamp",
    mainPageBody,
    buttons
  ));
});

app.listen();

interface Button {
  text: string;
  action: 'link' | 'post';
  url: string;
}

const pageTemplate = (
  imageUrl: string,
  title: string,
  body: string,
  buttons: Button[] = []
): string => {
  const buttonMetaTags = buttons.map((button, index) => {
    const buttonNumber = index + 1; // Human-readable numbering
    return `
      <meta property='fc:frame:button:${buttonNumber}' content='${button.text}' />
      <meta property='fc:frame:button:${buttonNumber}:action' content='${button.action}' />
      <meta property='fc:frame:button:${buttonNumber}:target' content='${button.url}' />
      <meta property='fc:frame:button:${buttonNumber}:post_url' content='${button.url}' />
    `;
  }).join('\n');

  return `
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='utf-8' />
    <meta name='viewport' content='width=device-width, initial-scale=1' />
    <meta name='next-size-adjust' />
    <meta property='fc:frame' content='vNext' />
    <meta property='fc:frame:image' content='${imageUrl}' />
    ${buttonMetaTags}
    <meta property='og:title' content='${title}' />
    <meta property='og:image' content='${imageUrl}' />
    <title>${title}</title>
</head>
<body>
    ${body}
</body>
</html>
  `;
};

const mainPageBody = `
    <div>
        <h1>
          Help build a trustful decentralized identity infrastructure ⛓️
        </h1>
        <p>
          Verify your Farcaster account and claim your Gitcoin Passport stamp to improve your humanity and reputation score!
        </p>
        <p>
            Go to <a href='https://warpcast.com/gonzalomelov/0x6631596f'>Warpcast</a> and complete the steps directly on the Frame!
        </p>
    </div>
`;