import { Server, jsonStringify } from 'azle';
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

    const NEYNAR_API_KEY = 'xxx';
    const FARCASTER_ATTESTOR = 'xxx';

    app.use(express.json());

    app.get('/', (req, res) => {
        res.send(pageFromTemplate(
            'https://ipfs.io/ipfs/QmUF9BmteniwSsLco3XaYVGbpdh3FWuUW8CqbDP52azE65',
            'Attest',
            'https://4c8a-186-55-232-157.ngrok-free.app/action',
            mainPageBody
        ))
    });

    app.post('/action', async (req, res) => {
        res.send(pageFromTemplate(
            'https://ipfs.io/ipfs/QmawGYH6TdvxsC1zhMXtAPJcjy7R5yCMQ6SBmUrwGD5pNE',
            'Refresh',
            'https://4c8a-186-55-232-157.ngrok-free.app/refresh',
            mainPageBody
        ))

        const body = req.body as FarcasterMessage;
        
        const buttonChosen = body.untrustedData.buttonIndex;
        let buttonTexts = [
            'Button 1'
        ];
        buttonTexts[buttonChosen - 1] = '**' + buttonTexts[buttonChosen - 1] + '**';

        const response = await fetch('https://api.neynar.com/v2/farcaster/frame/validate', {
            method: 'POST',
            headers: {
                accept: 'application/json',
                api_key: NEYNAR_API_KEY,
                'content-type': 'application/json'
            },
            body: jsonStringify({
                cast_reaction_context: true,
                follow_context: true,
                signer_context: true,
                message_bytes_in_hex: body.trustedData.messageBytes
            })
        });
        
        const trustedData = await response.json();
        const { action: { interactor: { fid, verified_addresses: { eth_addresses } } } } = trustedData;

        console.log('fid', fid);
        console.log('eth_addresses', eth_addresses[1]);

        // Let the user choose which wallet to use

        // Recast and follow

        const wallet = new ethers.Wallet(
            FARCASTER_ATTESTOR,
            ethers.getDefaultProvider('https://sepolia.base.org') // chainId: "eip155:84532",
        );

        console.log(`Wallet: ${wallet.address}`);

        const schemaEncoder = new SchemaEncoder("uint32 fid,uint64 timestamp");

        const encoded = schemaEncoder.encodeData([
          { name: "fid", type: "uint32", value: fid },
          { name: "timestamp", type: "uint64", value: Date.now() },
        ]);

        console.log(`encoded: ${encoded}`);

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

        console.log(`Transaction sent with hash: ${tx.hash}`);

        const receipt = await tx.wait();

        const uid = receipt.logs[0].data;

        console.log(`uid`, uid);
    });

    app.post('/refresh', async (req, res) => {
        console.log('refresh');

        const body = req.body as FarcasterMessage;

        const response = await fetch('https://api.neynar.com/v2/farcaster/frame/validate', {
            method: 'POST',
            headers: {
                accept: 'application/json',
                api_key: NEYNAR_API_KEY,
                'content-type': 'application/json'
            },
            body: jsonStringify({
                cast_reaction_context: true,
                follow_context: true,
                signer_context: true,
                message_bytes_in_hex: body.trustedData.messageBytes
            })
        });
        
        const trustedData = await response.json();
        const { action: { interactor: { fid, verified_addresses: { eth_addresses } } } } = trustedData;

        console.log('fid', fid);
        console.log('eth_addresses', eth_addresses[1]);

        // const response = await fetch("https://base-sepolia.easscan.org/graphql", {
        //     method: 'POST',
        //     headers: {
        //         accept: 'application/json',
        //         'content-type': 'application/json'
        //     },
        //     body: jsonStringify({
        //         query: 'query Attestations($where: AttestationWhereInput, $orderBy: [AttestationOrderByWithRelationInput!]) {\n  attestations(where: $where, orderBy: $orderBy) {\n    attester\n    revocationTime\n    expirationTime\n    time\n    recipient\n    id\n    data\n  }\n}',
        //         variables: {
        //             where: {
        //                 schemaId: {
        //                     equals: '0xca168d038c5d527bb9724b3201f026520b498d334a2f3f446181d6420d7fb515',
        //                 },
        //                 OR: [
        //                     {
        //                     attester: {
        //                         equals: '0x372082138ea420eBe56078D73F0359D686A7E981',
        //                     },
        //                     },
        //                     {
        //                     recipient: {
        //                         equals: '0x372082138ea420eBe56078D73F0359D686A7E981',
        //                     },
        //                     },
        //                 ],
        //             },
        //             orderBy: [
        //                 {
        //                     time: "desc",
        //                 },
        //             ],
        //         },
        //     })
        // });
        
        // console.log('response');

        // const { data: { attestations } } = await response.json();

        // console.log('attestations', attestations);

        res.send(pageWithLinkFromTemplate(
            'https://ipfs.io/ipfs/QmeJ7JRpo15yGHjPj6bjxdda1y96GEctLUXNkTTtX8MUMT',
            'See Attestation on EAS',
            `https://base-sepolia.easscan.org/address/${eth_addresses[1]}`,  // `https://base-sepolia.easscan.org/attestation/view/${attestation.id}`,
            mainPageBody
        ))
    })

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
