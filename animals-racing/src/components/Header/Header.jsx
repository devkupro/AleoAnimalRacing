import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";
import { Link } from "react-router-dom";

import { WalletProvider } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletModalProvider } from "@demox-labs/aleo-wallet-adapter-reactui";
import { LeoWalletAdapter } from "@demox-labs/aleo-wallet-adapter-leo";
import {
    DecryptPermission,
    WalletAdapterNetwork,
} from "@demox-labs/aleo-wallet-adapter-base";
import { useMemo } from "react";

// Default styles that can be overridden by your app
import("@demox-labs/aleo-wallet-adapter-reactui/styles.css");

function Header({ balanceToken }) {
    const wallets = useMemo(
        () => [
            new LeoWalletAdapter({
                appName: "Leo Demo App",
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
                <div style={{ display: 'flex', justifyContent: 'space-between', 'marginBottom': '1rem', alignItems: 'center' }} className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
                        <Link to={'/'}>Game</Link>
                        <Link to={'/view-nft'}>View NFT</Link>
                        <Link to={'/buy-nft'}>Buy NFT</Link>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 40 }}>
                        <div style={{ fontSize: 20, fontWeight: 700 }}>{balanceToken} LOR</div>
                        <WalletMultiButton />
                    </div>
                </div>
            </WalletModalProvider>
        </WalletProvider>

    );
}

export default Header;