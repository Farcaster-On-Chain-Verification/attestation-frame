import express from 'express';

const app = express();

const ATTEST_SERVER = 'https://attest-theta.vercel.app';

app.use(express.json());

app.get('/', (req, res) => {
    res.send(pageFromTemplate(
        'https://ipfs.io/ipfs/QmUF9BmteniwSsLco3XaYVGbpdh3FWuUW8CqbDP52azE65',
        'Attest',
        `${ATTEST_SERVER}/api/action`,
        mainPageBody
    ))
});

app.post('/refresh', async (req, res) => {
    console.log('refresh');

    try {
        const address = req.query.address;
        
        console.log('address', address);

        // const uid = req.query.uid;
        
        // console.log('uid', uid);

        res.send(pageWithLinkFromTemplate(
            'https://ipfs.io/ipfs/QmeJ7JRpo15yGHjPj6bjxdda1y96GEctLUXNkTTtX8MUMT',
            'See Attestation on EAS',
            `https://base-sepolia.easscan.org/address/${address}`,
            // `https://base-sepolia.easscan.org/attestation/view/${uid}`,
            mainPageBody
        ))

    } catch (err) {
        let message = '';
        if (typeof err === "string") {
        message = err;
        } else if (err instanceof Error) {
        message = err.message;
        }
    
        res.send(pageFromTemplate(
        'https://ipfs.io/ipfs/QmawGYH6TdvxsC1zhMXtAPJcjy7R5yCMQ6SBmUrwGD5pNE',
        message,
        `https://s3afo-miaaa-aaaap-ag7da-cai.raw.icp0.io/refresh`,
        mainPageBody
        ))

    }
})

app.listen();

const mainPageBody = `
<div>
        <p>
            This is a Farcaster frame using Azle (<a
                href='https://github.com/demergent-labs/azle'>https://github.com/demergent-labs/azle</a>) hosted on the
            <a href='https://internetcomputer.org'>Internet Computer</a>.
        </p>
        <p>
            <a href='https://github.com/Gekctek/farcaster-frame-azle'>
                Github
                (https://github.com/Gekctek/farcaster-frame-azle)
            </a>
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
    <meta property='og:title' content='Azle farcaster frame' />
    <meta property='og:image' content='${imageUrl}' />
    <title>Azle farcaster frame</title>
</head>

<body>
    ${body}
</body>

</html>
`;

let pageWithLinkFromTemplate = (
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
    <meta property='fc:frame:button:1:action' content='link' />
    <meta property='fc:frame:button:1:target' content='${apiUrl}' />
    <meta property='og:title' content='Azle farcaster frame' />
    <meta property='og:image' content='${imageUrl}' />
    <title>Azle farcaster frame</title>
</head>

<body>
    ${body}
</body>

</html>
`;

let finalFrame = (
    imageUrl: string,
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
    <meta property='og:title' content='Attestation Done!' />
    <meta property='og:image' content='${imageUrl}' />
    <title>Attestation Done!</title>
</head>

<body>
    ${body}
</body>

</html>
`;
