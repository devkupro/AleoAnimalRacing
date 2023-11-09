import { Link } from "react-router-dom";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import Header from "../../components/Header/Header";
import { useEffect, useState } from "react";
import { TESTNET3_API_URL, getMappingValue, getAleoTransactionsForProgram, getTransactionsForProgram } from "../../aleo/rpc";
import { ProgramId } from "../../aleo/program";
import { addNft, getBalance } from "../../utils";
import { changeBalance, padArray, splitStringToBigInts, joinBigIntsToString, stringToBigInt } from "../../utils";

import {
    Transaction,
    WalletAdapterNetwork,
    WalletNotConnectedError,
} from '@demox-labs/aleo-wallet-adapter-base';
import Swal from "sweetalert2";

const baseUrl = "https://ipfs.filebase.io/ipfs/QmT6feh7vbFhBeEVv7sD9PnFS5TjjmATXbb2JTgjiszYK8";

function BuyNFT() {
    const { wallet, publicKey } = useWallet();
    const [balanceBe, setBalanceBe] = useState(0);
    const [balanceToken, setBalanceToken] = useState(0);
    const [existNfts, setExistNfts] = useState([]);

    async function get() {
        const eNfts = [];
        const exists = await Promise.allSettled(Array(9).fill(null).map((e, i) => getMappingValue(ProgramId, "tokenExists", `${i}u128`)));
        exists.forEach((e, i) => {
            if (e.value) {
                console.log(e.value, i);
                eNfts.push(i);
            }
        })
        setExistNfts(eNfts);

        if (!publicKey)
            return;
        // const rs = await getBalanceToken(ProgramId, "account", publicKey);
        const rs = await getMappingValue(ProgramId, "account", publicKey);
        const bbe = await getBalance(publicKey);
        if (!rs)
            return;
        setBalanceBe(bbe);
        setBalanceToken(rs.split('u64')[0]);
    }

    async function mint_nft(id, amount) {
        if (balanceToken < amount || balanceBe < amount) {
            return Swal.fire('Error', 'Balance token not enough', 'error');
        }

        const url = `https://ipfs.filebase.io/ipfs/QmT6feh7vbFhBeEVv7sD9PnFS5TjjmATXbb2JTgjiszYK8/${id}.png`;
        let urlInputs = padArray(splitStringToBigInts(url), 6);
        urlInputs = urlInputs.map(e => e.toString().split('n')[0] + 'u128')

        // urlInputs = urlInputs.map(e => BigInt(e.toString().split('u128')[0]))

        // console.log(joinBigIntsToString(urlInputs));

        const inputs = [`${id}u128`, `{part0: ${urlInputs[0]},part1: ${urlInputs[1]},part2: ${urlInputs[2]},part3: ${urlInputs[3]},part4: ${urlInputs[4]},part5: ${urlInputs[5]}}`];

        console.log(inputs);

        const aleoTransaction = Transaction.createTransaction(
            publicKey,
            WalletAdapterNetwork.Testnet,
            ProgramId,
            'mint_nft_public',
            inputs,
            Math.floor(parseFloat(0.5) * 1_000_000),
            false
        );

        const txId =
            (await (wallet?.adapter).requestTransaction(
                aleoTransaction
            )) || '';
        console.log(txId);
        await changeBalance(publicKey, amount, '-');
        setBalanceToken(balanceToken - amount);
        addNft(publicKey, id, baseUrl)
    }

    useEffect(() => {
        get()
    }, [publicKey])

    return (<div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        <Header balanceToken={balanceBe} />
        <div>Onchain: {balanceToken} LOR</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 30 }}>
            {new Array(9).fill(null).map((e, i) => <div key={i} style={{ width: 'calc((100% - 100px) / 4)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <img src={`${baseUrl}/${i}.png`} crossOrigin="anonymous" style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
                {!existNfts.includes(i) && <button onClick={() => mint_nft(i, 200)}>BUY with 200 LOR</button>}
            </div>)}
        </div>
    </div>);
}

export default BuyNFT;