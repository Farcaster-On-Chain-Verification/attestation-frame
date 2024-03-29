import { Server } from 'azle';
import { ethers } from 'ethers';
import express from 'express';
import abi from "../../abi.json";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";

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

    app.post('/action', async (req, res) => {
        const body = req.body as FarcasterMessage;
        
        const buttonChosen = body.untrustedData.buttonIndex;
        let buttonTexts = [
            'Button 1'
        ];
        buttonTexts[buttonChosen - 1] = '**' + buttonTexts[buttonChosen - 1] + '**';

        const startTime = new Date();
        const response = await fetch('https://api.neynar.com/v2/farcaster/frame/validate', {
            method: 'POST',
            headers: {
                accept: 'application/json',
                api_key: 'xxx',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                cast_reaction_context: true,
                follow_context: false,
                signer_context: false,
                message_bytes_in_hex: body.trustedData.messageBytes
            })
        });
        const endTime1 = new Date();
        const duration1 = endTime1.getTime() - startTime.getTime();
        console.log(`Fetch call duration: ${duration1} ms`);
        
        const endTime2 = new Date();
        const { action: { interactor: { fid, verified_addresses: { eth_addresses } } } } = await response.json();
        const duration2 = endTime2.getTime() - endTime1.getTime();
        console.log(`Fetch call duration: ${duration2} ms`);
        
        console.log('fid', fid);
        console.log('eth_addresses', eth_addresses[1]);

        
        const wallet = new ethers.Wallet(
            "xxx",
            ethers.getDefaultProvider('https://sepolia.base.org') // chainId: "eip155:84532",
        );

        console.log(`Wallet: ${wallet.address}`);

        const schemaEncoder = new SchemaEncoder("uint32 fid,uint64 timestamp");

        const encoded = schemaEncoder.encodeData([
          { name: "fid", type: "uint32", value: fid },
          { name: "timestamp", type: "uint64", value: Date.now() },
        ]);

        console.log(`encoded: ${encoded}`);

        try {
            const info = {
                schema: "0xca168d038c5d527bb9724b3201f026520b498d334a2f3f446181d6420d7fb515",
                data: {
                    recipient: eth_addresses[1],
                    data: encoded,
                    expirationTime: BigInt(0),
                    revocable: false,
                    refUID: ethers.ZeroHash,
                    value: BigInt(0)
                }
            };
            
            console.log(`info`, info.data.refUID);
    
            const contract = new ethers.Contract("0x4200000000000000000000000000000000000021", abi.abi, wallet);
    
            const tx = await contract.attest(info);
    
            console.log(`tx: ${tx}`);
    
            // Wait for the transaction to be mined
            await tx.wait();
    
            console.log(`Transaction sent with hash: ${tx.hash}`);
        } catch (err) {
            console.log(err);
        }
        

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
