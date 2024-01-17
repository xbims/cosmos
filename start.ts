import { DirectSecp256k1HdWallet, OfflineDirectSigner } from "@cosmjs/proto-signing"
import { SigningStargateClient } from "@cosmjs/stargate"

// EDIT HERE
const MY_KEY = "mnemonic lu" //change "xxxxxxxxxxxxx" with your Mnemonic 
const TOTAL_TX = 3 //change to a number transsaction you want
///////////////

const MEMO = 'urn:cft20:cosmoshub-4@v1;mint$tic=ROIDS,amt=1000000000'
const FEE = '538'
const GAS = '76817'
const RPC = "https://rpc-cosmoshub.goldenratiostaking.net/"

const prepareAccount = async (): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1HdWallet.fromMnemonic((MY_KEY).toString(), {
        prefix: "cosmos",
    })
}

const Start = async (): Promise<void> => {
    const my_Wallet: OfflineDirectSigner = await prepareAccount()
    const my_Pubkey = (await my_Wallet.getAccounts())[0].address
    
    const signingClient = await SigningStargateClient.connectWithSigner(RPC, my_Wallet)
    const balances = await signingClient.getAllBalances(my_Pubkey);
    const uatomBalance = balances.find((coin) => coin.denom === 'uatom');
    const uatomAmount = uatomBalance ? parseFloat(uatomBalance.amount) : 0;
    const atomAmount = uatomAmount / 1_000_000; 

    console.log(`My wallet Address: ${my_Pubkey}` )
    console.log(` - Chain: ${await signingClient.getChainId()}\n - Balance: ${atomAmount}\n - Block Height: ${await signingClient.getHeight()}\n\n`)
    
   
    
    for(let count=0; count < TOTAL_TX; count++){
        const result = await signingClient.sendTokens(my_Pubkey, my_Pubkey, [{ denom: "uatom", amount: "1" }], {
            amount: [{ denom: "uatom", amount: FEE }],
            gas: GAS,
        },
        MEMO,
        )

        console.log(`${count+1}. Explorer: https://www.mintscan.io/cosmos/tx/${result.transactionHash}`)
    }
    
    console.log("\n=======> [ DONE ALL. CONGRATS ] <=======")
}

Start()
