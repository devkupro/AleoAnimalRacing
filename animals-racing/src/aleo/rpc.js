import { JSONRPCClient } from 'json-rpc-2.0';
import { ProgramId } from './program';
import { bigIntToString, joinBigIntsToString, parseStringToBigIntArray } from '../utils/index';
// import assert from 'assert';

export const TESTNET3_API_URL = "https://testnet3.aleorpc.com";
const ALEO_URL = 'https://vm.aleo.org/api/testnet3/';

export async function getHeight(apiUrl) {
    const client = getClient(apiUrl);
    const height = await client.request('getHeight', {});
    return height;
}

export async function getMappingValue(programId, mappingName, mappingKey) {
    const response = await fetch(`${ALEO_URL}program/${programId}/mapping/${mappingName}/${mappingKey}`);
    const data = await response.json();
    return data;
}

export async function getProgram(programId, apiUrl) {
    const client = getClient(apiUrl);
    const program = await client.request('program', {
        id: programId
    });
    return program;
}

async function getDeploymentTransaction(programId) {
    const response = await fetch(`${ALEO_URL}find/transactionID/deployment/${programId}`);
    const deployTxId = await response.json();
    const txResponse = await fetch(`${ALEO_URL}transaction/${deployTxId}`);
    const tx = await txResponse.json();
    return tx;
}

export async function getVerifyingKey(programId, functionName) {
    const deploymentTx = await getDeploymentTransaction(programId);

    const allVerifyingKeys = deploymentTx.deployment.verifying_keys;
    const verifyingKey = allVerifyingKeys.filter((vk) => vk[0] === functionName)[0][1][0];
    return verifyingKey;
}

export async function getClaimValue(claim) {
    const response = await fetch(`${ALEO_URL}program/${ProgramId}/mapping/claims_to_nfts/${claim}`);
    return response.text();
}

export async function getTransactionsForProgram(programId, functionName, apiUrl) {
    const client = getClient(apiUrl);
    const transaction = await client.request('transactionsForProgram', {
        programId,
        functionName,
        "page": 0,
        "maxTransactions": 1000
    });
    return transaction;
}

export async function getAleoTransactionsForProgram(programId, functionName, apiUrl, page = 0, maxTransactions = 1000) {
    const client = getClient(apiUrl);
    const result = await client.request('aleoTransactionsForProgram', {
        programId,
        functionName,
        page,
        maxTransactions
    });

    return result;
}


export async function getTransaction(apiUrl, transactionId) {
    const transactionUrl = `${apiUrl}/aleo/transaction`;
    const response = await fetch(`${transactionUrl}/${transactionId}`);
    if (!response.ok) {
        throw new Error('Transaction not found');
    }
    const transaction = await response.json();
    return transaction;
}

// Handle the case where a whitelist operation is done twice for the same address
export async function getWhitelist(apiUrl) {
    const addMinterTransactionMetadata = await getAleoTransactionsForProgram(ProgramId, 'add_minter', apiUrl);
    const whitelist = addMinterTransactionMetadata.map((txM) => {
        return {
            address: txM.transaction.execution.transitions[0].inputs[0].value,
            amount: parseInt(txM.transaction.execution.transitions[0].inputs[1].value.slice(0, -2))
        }
    }).reverse();

    // Filter out duplicates
    const uniqueMap = new Map();
    for (const item of whitelist) {
        if (!uniqueMap.has(item.address)) {
            uniqueMap.set(item.address, item);
        }
    }
    const uniqueWhitelist = Array.from(uniqueMap.values());

    return uniqueWhitelist;
}

export async function getMintedNFTs(apiUrl) {
    const mintTransactionsMetadata = await getAleoTransactionsForProgram(ProgramId, 'mint', apiUrl);
    const mintedNFTs = mintTransactionsMetadata.map((txM) => {
        const urlBigInts = parseStringToBigIntArray(txM.transaction.execution.transitions[0].inputs[0].value);
        const relativeUrl = joinBigIntsToString(urlBigInts);
        return {
            url: relativeUrl,
            edition: parseInt(txM.transaction.execution.transitions[0].inputs[1].value.slice(0, -6)),
            inputs: txM.transaction.execution.transitions[0].inputs
        }
    });
    return mintedNFTs;
}

export async function getInitializedCollection(apiUrl) {
    const initializedTransactionMetadata = await getAleoTransactionsForProgram(ProgramId, 'initialize_collection', apiUrl);
    assert(initializedTransactionMetadata.length === 1, 'There should only be one initialize_collection transaction');
    const transactionMetadata = initializedTransactionMetadata[0];

    const total = parseInt(transactionMetadata.transaction.execution.transitions[0].inputs[1].value.slice(0, -2));
    const symbol = bigIntToString(BigInt(transactionMetadata.transaction.execution.transitions[0].inputs[1].value.slice(0, -4)));
    const urlBigInts = parseStringToBigIntArray(transactionMetadata.transaction.execution.transitions[0].inputs[2].value);
    const baseUri = joinBigIntsToString(urlBigInts);
    return {
        total,
        symbol,
        baseUri
    }
}

export async function getBaseURI(apiUrl) {
    const { baseUri } = await getInitializedCollection(apiUrl);
    if (!baseUri) {
        return;
    }

    const updateTxsMetadata = await getAleoTransactionsForProgram(ProgramId, 'update_base_uri', apiUrl);
    const transactionIds = updateTxsMetadata.map((txM) => txM.transction.id);
    if (transactionIds.length === 0) {
        return baseUri;
    }

    const transaction = await getTransaction(apiUrl, transactionIds[transactionIds.length - 1]);
    const urlBigInts = parseStringToBigIntArray(transaction.execution.transitions[0].inputs[0].value);
    return joinBigIntsToString(urlBigInts);
}

export async function getSettingsStatus(apiUrl) {
    const transactions = await getTransactionsForProgram(ProgramId, 'update_toggle_settings', apiUrl);
    const transactionIds = transactions.map((transactionId) => transactionId.transaction_id);
    if (transactionIds.length === 0) {
        return 5;
    }

    const transaction = await getTransaction(apiUrl, transactionIds[transactionIds.length - 1]);
    const status = transaction.execution.transitions[0].inputs[0].value;
    return parseInt(status.slice(0, status.indexOf('u32')));
};

export async function getMintBlock(apiUrl) {
    const transactionMetadata = await getAleoTransactionsForProgram(ProgramId, 'set_mint_block', apiUrl);
    if (transactionMetadata.length === 0) {
        return { block: 0 };
    }

    const transaction = transactionMetadata[transactionMetadata.length - 1].transaction;
    const block = parseInt(transaction.execution.transitions[0].inputs[0].value.slice(0, -4));
    return { block };
}

export async function getClaims(apiUrl) {
    const claimTxMetadata = await getAleoTransactionsForProgram(ProgramId, 'open_mint', apiUrl);
    return claimTxMetadata.map((txM) => { txM.transaction });
}

export async function getNFTs(apiUrl, fetchProperties = true) {
    const baseUri = await getBaseURI(apiUrl);
    const addNFTTransactionMetadata = await getAleoTransactionsForProgram(ProgramId, 'add_nft', apiUrl);

    let nfts = addNFTTransactionMetadata.map((txM) => {
        const tx = txM.transaction;
        const urlBigInts = parseStringToBigIntArray(tx.execution.transitions[0].inputs[0].value);
        const tokenEditionHash = tx.execution.transitions[0].finalize[0];
        const relativeUrl = joinBigIntsToString(urlBigInts);
        return {
            url: baseUri + relativeUrl,
            edition: parseInt(tx.execution.transitions[0].inputs[1].value.slice(0, -6)),
            inputs: tx.execution.transitions[0].inputs,
            tokenEditionHash
        }
    });

    nfts = await Promise.all(nfts.map(async (nft) => {
        if (!fetchProperties) {
            return nft;
        }
        const properties = await getJSON(`https://${nft.url}`);
        return {
            ...nft,
            properties
        }
    }));
    return {
        baseURI: baseUri,
        nfts
    };
}

export const getClient = (apiUrl) => {
    const client = new JSONRPCClient((jsonRPCRequest) =>
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({ ...jsonRPCRequest })
        }).then((response) => {
            if (response.status === 200) {
                // Use client.receive when you received a JSON-RPC response.
                return response.json().then((jsonRPCResponse) => client.receive(jsonRPCResponse));
            } else if (jsonRPCRequest.id !== undefined) {
                return Promise.reject(new Error(response.statusText));
            }
        })
    );
    return client;
};

export async function getJSON(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}