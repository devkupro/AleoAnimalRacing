import { WalletProvider } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletModalProvider } from "@demox-labs/aleo-wallet-adapter-reactui";
import { LeoWalletAdapter } from "@demox-labs/aleo-wallet-adapter-leo";
import {
    DecryptPermission,
    WalletAdapterNetwork,
} from "@demox-labs/aleo-wallet-adapter-base";

import App from '../App';
import { useMemo } from "react";

// Default styles that can be overridden by your app
import("@demox-labs/aleo-wallet-adapter-reactui/styles.css");

import { createContext, useContext } from 'react';

const gameContext = createContext(null);

import { BrowserRouter, Route, Routes } from "react-router-dom";
import ViewNFT from "../pages/ViewNFT/ViewNFT";
import BuyNFT from "../pages/BuyNFT/BuyNFT";
import Header from "../components/Header/Header";

export const Wallet = () => {


    const wallets = useMemo(
        () => [
            new LeoWalletAdapter({
                appName: "Leo",
            }),
        ],
        []
    );

    return (
        <WalletProvider
            wallets={wallets}
            decryptPermission={DecryptPermission.UponRequest}
            network={WalletAdapterNetwork.Testnet}
            autoConnect
        >
            <WalletModalProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path='/' element={<App />} />
                        <Route path='/view-nft' element={<ViewNFT />} />
                        <Route path='/buy-nft' element={<BuyNFT />} />
                    </Routes>
                </BrowserRouter>
            </WalletModalProvider>
        </WalletProvider>
    );
};