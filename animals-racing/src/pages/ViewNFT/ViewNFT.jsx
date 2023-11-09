import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import { useEffect, useState } from "react";

import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { getBalance, getNft } from "../../utils";

const baseUrl = "https://ipfs.filebase.io/ipfs/QmT6feh7vbFhBeEVv7sD9PnFS5TjjmATXbb2JTgjiszYK8";

function ViewNFT() {
    const { wallet, publicKey } = useWallet();

    const [nft, setNft] = useState([]);
    const [balance, setBalance] = useState(0);

    async function get() {
        if (!publicKey)
            return;
        const data = await getNft(publicKey);
        const balance = await getBalance(publicKey);
        setBalance(balance)
        if (data)
            setNft(data);
        console.log(data);
    }

    useEffect(() => {
        get();
    }, [publicKey])
    return (<div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        <Header balanceToken={balance} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 30 }}>
            {nft && nft.map((e, i) => <div key={i} style={{ width: 'calc((100% - 100px) / 4)' }}>
                <img src={`${baseUrl}/${e.nftId}.png`} crossOrigin="anonymous" style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
            </div>)}
        </div>
    </div>);
}

export default ViewNFT;