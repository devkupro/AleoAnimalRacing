import axios from 'axios';

// const str = "{program_id: raceanimals_v2.aleo,function_name: mint_nft_public,arguments: [aleo1hxy9p4dw5g8prtw72expa9x77dyx6jzqt6809er6l7rfrtddacrsh8r4sk,0u128,{part0: 144103887200906736709559221277605262440u128,part1: 145307390002290579370414395630207197797u128,part2: 73721980582784877718303380554400544340u128,part3: 130722974616572604875003272638108353651u128,part4: 149113358480210045822645478553794785890u128,part5: 26478u128}]}"
// console.log(str.split('arguments')[1].split('[')[1].split(','));

// const BASE_URL = "http://192.168.1.179:5005";
const BASE_URL = "http://localhost:8000";

export async function getNft(address) {
    try {
        const rs = await axios.get(`${BASE_URL}/nft?address=${address}`);
        const data = rs.data.nfts;
        return data;
    } catch (err) {
        console.log(err.message);
    }
}

export async function addNft(address, nftId, baseUrl) {
    try {
        const rs = await axios.post(`${BASE_URL}/nft`, {
            address,
            nftId,
            baseUrl
        })
        const data = rs.data;
        return data;
    } catch (err) {
        console.log(err.message);
    }
}

export async function getBalance(address) {
    try {
        const rs = await axios.get(`${BASE_URL}/balance?address=${address}`);
        const data = rs.data.amount;
        return data;
    } catch (err) {
        console.log(err.message);
    }
}

export async function changeBalance(address, amount, method) {
    try {
        const rs = await axios.post(`${BASE_URL}/balance`, {
            address,
            amount,
            method
        });
        const data = rs.data;
        return data;
    }
    catch (err) {
        console.log(err.message);
    }
}

export async function sleep(ms) {
    return new Promise(r => setInterval(r, ms));
}

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const REWARD = [4, 3, 2, 1, 0, 0, 0, 0, 0, 0];
export function calculateGame(ranking, betAnimal, betAmount) {
    for (let i = 0; i < ranking.length; ++i) {
        if (ranking[i] === betAnimal) {
            console.log(i, betAnimal, betAmount);
            return betAmount * REWARD[i];
        }
    }
}

export function getSettingsFromNumber(settingNum) {
    const bitStringArray = settingNum.toString(2).padStart(32, '0').split('').reverse();
    return {
        initialized: bitStringArray[0] === '1',
        active: bitStringArray[1] === '1',
        whiteList: bitStringArray[2] === '1',
        frozen: bitStringArray[3] === '1',
    };
}

function getBit(setting) {
    return setting ? '1' : '0';
}

export function convertSettingsToNumber(settings) {
    const { frozen, active, whiteList, initialized } = settings;
    const bitString = `${getBit(frozen)}${getBit(whiteList)}${getBit(active)}${getBit(initialized)}`;

    return parseInt(bitString, 2);
}

export function safeParseInt(value) {
    const parsedValue = parseInt(value, 10);
    return isNaN(parsedValue) ? 0 : parsedValue;
}

export function stringToBigInt(input) {
    const encoder = new TextEncoder();
    const encodedBytes = encoder.encode(input);

    let bigIntValue = BigInt(0);
    for (let i = 0; i < encodedBytes.length; i++) {
        const byteValue = BigInt(encodedBytes[i]);
        const shiftedValue = byteValue << BigInt(8 * i);
        bigIntValue = bigIntValue | shiftedValue;
    }

    return bigIntValue;
}

export function bigIntToString(bigIntValue) {
    const bytes = [];
    let tempBigInt = bigIntValue;

    while (tempBigInt > BigInt(0)) {
        const byteValue = Number(tempBigInt & BigInt(255));
        bytes.push(byteValue);
        tempBigInt = tempBigInt >> BigInt(8);
    }

    const decoder = new TextDecoder();
    const asciiString = decoder.decode(Uint8Array.from(bytes));
    return asciiString;
}

export function splitStringToBigInts(input) {
    const chunkSize = 16; // Chunk size to split the string
    const numChunks = Math.ceil(input.length / chunkSize);
    const bigInts = [];

    for (let i = 0; i < numChunks; i++) {
        const chunk = input.substr(i * chunkSize, chunkSize);
        const bigIntValue = stringToBigInt(chunk);
        bigInts.push(bigIntValue);
    }

    return bigInts;
}

export function joinBigIntsToString(bigInts) {
    let result = '';

    for (let i = 0; i < bigInts.length; i++) {
        const chunkString = bigIntToString(bigInts[i]);
        result += chunkString;
    }

    return result;
}

export function padArray(array, length) {
    const paddingLength = length - array.length;
    if (paddingLength <= 0) {
        return array; // No padding needed
    }

    const padding = Array(paddingLength).fill(BigInt(0));
    const paddedArray = array.concat(padding);
    return paddedArray;
}

export function parseStringToBigIntArray(input) {
    const bigIntRegex = /([0-9]+)u128/g;
    const matches = input.match(bigIntRegex);

    if (!matches) {
        return [];
    }

    const bigInts = matches.map((match) => BigInt(match.slice(0, -4)));
    return bigInts;
}

export function getRandomElement(list) {
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
}

export const removeVisibilitySuffix = (str) => {
    return str.replace(/\.public$|\.private$/, '');
};