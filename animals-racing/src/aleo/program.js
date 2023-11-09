export const ProgramId = 'raceanimals_v2.aleo';

export const Program = `program raceanimals_v2.aleo;

record token:
    owner as address.private;
    amount as u64.private;

struct String64:
    part0 as u128;
    part1 as u128;
    part2 as u128;
    part3 as u128;
    part4 as u128;
    part5 as u128;

struct Nft:
    uri as String64;


mapping account:
	key as address.public;
	value as u64.public;


mapping tokenExists:
	key as u128.public;
	value as boolean.public;


mapping publicNftData:
	key as u128.public;
	value as Nft.public;


mapping publicNftOwners:
	key as u128.public;
	value as address.public;

function mint_nft_public:
    input r0 as u128.public;
    input r1 as String64.public;
    async mint_nft_public self.caller r0 r1 into r2;
    output r2 as raceanimals_v2.aleo/mint_nft_public.future;

finalize mint_nft_public:
    input r0 as address.public;
    input r1 as u128.public;
    input r2 as String64.public;
    cast r2 into r3 as Nft;
    contains tokenExists[r1] into r4;
    get.or_use account[r0] 0u64 into r5;
    sub r5 10u64 into r6;
    set r6 into account[r0];
    set r3 into publicNftData[r1];
    set r0 into publicNftOwners[r1];
    set true into tokenExists[r1];


function mint_token_public:
    input r0 as address.public;
    input r1 as u64.public;
    async mint_token_public r0 r1 into r2;
    output r2 as raceanimals_v2.aleo/mint_token_public.future;

finalize mint_token_public:
    input r0 as address.public;
    input r1 as u64.public;
    get.or_use account[r0] 0u64 into r2;
    add r2 r1 into r3;
    set r3 into account[r0];


function mint_token_private:
    input r0 as address.private;
    input r1 as u64.private;
    cast r0 r1 into r2 as token.record;
    output r2 as token.record;


function burn_token_public:
    input r0 as u64.public;
    async burn_token_public self.caller r0 into r1;
    output r1 as raceanimals_v2.aleo/burn_token_public.future;

finalize burn_token_public:
    input r0 as address.public;
    input r1 as u64.public;
    get.or_use account[r0] 0u64 into r2;
    sub r2 r1 into r3;
    set r3 into account[r0];


function transfer_token_public:
    input r0 as address.public;
    input r1 as u64.public;
    async transfer_token_public self.caller r0 r1 into r2;
    output r2 as raceanimals_v2.aleo/transfer_token_public.future;

finalize transfer_token_public:
    input r0 as address.public;
    input r1 as address.public;
    input r2 as u64.public;
    get.or_use account[r0] 0u64 into r3;
    sub r3 r2 into r4;
    set r4 into account[r0];
    get.or_use account[r1] 0u64 into r5;
    add r5 r2 into r6;
    set r6 into account[r1];


function transfer_token_private:
    input r0 as token.record;
    input r1 as address.private;
    input r2 as u64.private;
    sub r0.amount r2 into r3;
    cast r0.owner r3 into r4 as token.record;
    cast r1 r2 into r5 as token.record;
    output r4 as token.record;
    output r5 as token.record;

`