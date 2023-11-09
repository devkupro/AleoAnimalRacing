import { useState, useRef, useLayoutEffect, useEffect } from "react";
import "./App.css";

import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { LeoWalletAdapter } from "@demox-labs/aleo-wallet-adapter-leo";
import { SignMessage } from "./wallet/signing";

import { WalletMultiButton } from '@demox-labs/aleo-wallet-adapter-reactui/';

import { TESTNET3_API_URL, getAleoTransactionsForProgram } from './aleo/rpc';
import { ProgramId } from "./aleo/program";

import { sleep, randomInt, padArray, splitStringToBigInts, joinBigIntsToString, calculateGame, getBalance, changeBalance } from './utils/index';

import {
    Transaction,
    WalletAdapterNetwork,
    WalletNotConnectedError,
} from '@demox-labs/aleo-wallet-adapter-base';

import { gsap } from "gsap";

import Swal from 'sweetalert2';
import { Link } from "react-router-dom";
import Header from "./components/Header/Header";

// const aleoWorker = AleoWorker();

const animals = ["🐎", "🐒", "🐅", "🐁", "🐇", "🦖", "🐉", "🐘", "🐖", "🦅"];

function App() {
    const [executing, setExecuting] = useState(false);

    const { wallet, wallets, publicKey } = useWallet();

    const [ranking, setRanking] = useState([]);

    const [isRun, setIsRun] = useState(false);
    const [balanceToken, setBalanceToken] = useState(0);
    const [betAmount, setBetAmount] = useState(0);
    const [betAnimal, setBetAnimal] = useState(0);

    const screen = useRef();
    const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

    const handleStart = async () => {
        if (!betAmount || betAmount <= 0) {
            return Swal.fire('Error', 'Amount must greater than 0', 'error');
        }

        if (balanceToken < betAmount) {
            return Swal.fire('Error', 'Your token balance not enough', 'error');
        }

        await burn_token(betAmount);

        setIsRun(true);
        for (let i = 0; i < 10; i++) {
            refs[i].current.style.left = '0px';
        }
        const width = screen.current.getBoundingClientRect().width - 120;
        const rank = [];
        for (let i = 0; i < 100; i++) {
            await sleep(300);
            for (let j = 0; j < 10; j++) {
                if (rank.includes(j)) {
                    gsap.to(refs[j].current, {
                        top: "0"
                    });
                    continue;
                }

                let random = randomInt(20, 100);

                let left = refs[j].current.style.left;

                if (parseInt(left.split('px')[0]) + random >= width) {
                    rank.push(j);
                    random = width - parseInt(left.split('px')[0]);
                }

                if (i % 2 == 0) {
                    gsap.to(refs[j].current, {
                        left: `+=${random}`,
                        top: "+=6",
                    });
                } else {
                    gsap.to(refs[j].current, {
                        left: `+=${random}`,
                        top: "-=6",
                    });
                }

            }

            if (rank.length === 10) {
                setRanking([...rank]);
                setIsRun(false);
                const reward = calculateGame(rank, betAnimal, betAmount);
                if (reward > 0) {
                    Swal.fire(
                        'Congratulation!',
                        `You win: ${reward} LOR`,
                        'success'
                    )
                    await mint_token(reward);
                } else {
                    Swal.fire(
                        'Lose!',
                        '',
                        'info'
                    )
                }
                break;
            }
        }

    }

    async function get() {
        // const data = await getAleoTransactionsForProgram(ProgramId, "mint_nft_public", TESTNET3_API_URL);
        // console.log(data);
        if (!publicKey)
            return;
        // const rs = await getBalanceToken(ProgramId, "account", publicKey);
        const rs = await getBalance(publicKey);
        console.log(rs);
        if (!rs)
            return;
        setBalanceToken(rs);
    }

    async function mint_token(amount) {
        const inputs = [publicKey, `${amount}u64`];

        const aleoTransaction = Transaction.createTransaction(
            publicKey,
            WalletAdapterNetwork.Testnet,
            ProgramId,
            'mint_token_public',
            inputs,
            Math.floor(parseFloat(0.3) * 1_000_000),
            false
        );

        const txId =
            (await (wallet?.adapter).requestTransaction(
                aleoTransaction
            )) || '';

        await changeBalance(publicKey, amount, '+');
        setBalanceToken((e) => e + amount);
    }

    async function burn_token(amount) {
        const inputs = [`${amount}u64`];

        const aleoTransaction = Transaction.createTransaction(
            publicKey,
            WalletAdapterNetwork.Testnet,
            ProgramId,
            'burn_token_public',
            inputs,
            Math.floor(parseFloat(0.3) * 1_000_000),
            false
        );

        const txId =
            (await (wallet?.adapter).requestTransaction(
                aleoTransaction
            )) || '';
        console.log(txId);
        await changeBalance(publicKey, amount, '-');
        setBalanceToken((e) => e - amount);
    }

    useEffect(() => {
        // handleStart();
        get();
        // return () => wallets[0].adapter.removeListener('connect');
    }, [publicKey])

    return (
        <>
            {/* <div style={{ display: 'flex', justifyContent: 'space-between', 'marginBottom': '1rem', alignItems: 'center' }} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
                    <Link to={'/view-nft'}>View NFT</Link>
                    <Link to={'/buy-nft'}>Buy NFT</Link>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 40 }}>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{balanceToken} LOR</div>
                    <WalletMultiButton />
                </div>
            </div> */}
            <Header balanceToken={balanceToken} />
            <div ref={screen} style={{ minHeight: '60vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 10, border: '1px solid #ccc', padding: '20px' }}>
                {animals.map((e, i) => <div key={i} style={{ width: '100%', display: 'flex', padding: '4px 2px', position: 'relative', minHeight: '40px' }}><span ref={refs[i]} style={{ position: 'absolute', fontSize: 26, transform: 'scaleX(-1)', left: 0 }}>{e}</span></div>)}
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 40, alignItems: 'center' }}>
                <h1>Ranking</h1>
                {ranking.map((e, i) => <h1 key={i}>{animals[e]}</h1>)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginBottom: 60 }}>
                <h1>BET</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <select value={betAnimal} onChange={e => setBetAnimal(e.target.value)} style={{ height: 44, width: 100, fontSize: 20, textAlign: 'center' }}>
                        {animals.map((e, i) => <option key={i} value={i}>{e}</option>)}
                    </select>
                    <input value={parseInt(betAmount)} onChange={e => setBetAmount(parseInt(e.target.value))} type="number" style={{ padding: '10px 12px', minWidth: '40%', fontSize: 18, borderRadius: 8 }} placeholder="Amount" />
                    {!isRun && <button onClick={handleStart}>OK</button>}
                </div>
            </div>
            <div style={{}}>
                <button onClick={() => mint_token(50)}>Mint token</button>
            </div>
        </>
    );
}

export default App;
