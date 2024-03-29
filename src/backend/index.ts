import { Server } from 'azle';
import express from 'express';

interface FarcasterMessage {
    untrustedData: {
        fid: number;
        url: string;
        messageHash: string;
        timestamp: number;
        network: number;
        buttonIndex: number;
        castId: {
            fid: number;
            hash: string;
        };
    };
    trustedData: {
        messageBytes: string;
    };
}

export default Server(() => {
    const app = express();

    app.use(express.json());

    app.post('/action', (req, res) => {
        const body = req.body as FarcasterMessage;
        const buttonChosen = body.untrustedData.buttonIndex;
        let buttonTexts = [
            'Button 1'
        ];
        buttonTexts[buttonChosen - 1] = '**' + buttonTexts[buttonChosen - 1] + '**';
        
        // const schemaEncoder = new SchemaEncoder("bool metIRL");
        // const encoded = schemaEncoder.encodeData([
        //     { name: "metIRL", type: "bool", value: true },
        // ]);
        
        // invariant(signer, "signer must be defined");
        // eas.connect(signer);

        // const recipient = ensResolvedAddress
        //     ? ensResolvedAddress
        //     : address;

        // const tx = await eas.attest({
        //     data: {
        //     recipient: recipient,
        //     data: encoded,
        //     refUID: ethers.ZeroHash,
        //     revocable: true,
        //     expirationTime: BigInt(0),
        //     },
        //     schema: CUSTOM_SCHEMAS.MET_IRL_SCHEMA,
        // });

        // const uid = await tx.wait();

        // const attestation = await getAttestation(uid);

        res.send(pageFromTemplate(
            'https://raw.githubusercontent.com/vrypan/farcaster-brand/main/icons/icon-rounded/purple-white.png',
            buttonTexts[0],
            'https://4c8a-186-55-232-157.ngrok-free.app/action',
            mainPageBody
        ))
    });

    app.get('/', (req, res) => {
        res.send(pageFromTemplate(
            'https://raw.githubusercontent.com/vrypan/farcaster-brand/main/icons/icon-rounded/purple-white.png',
            'Button 1',
            'https://4c8a-186-55-232-157.ngrok-free.app/action',
            mainPageBody
        ))
    });

    return app.listen();
});

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