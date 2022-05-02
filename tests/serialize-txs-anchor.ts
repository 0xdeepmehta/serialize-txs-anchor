import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SerializeTxsAnchor } from "../target/types/serialize_txs_anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";


describe("serialize-txs-anchor", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SerializeTxsAnchor as Program<SerializeTxsAnchor>;

  it("Is initialized!", async () => {
    // let generate a newly fresh account
    let freshAccount = anchor.web3.Keypair.generate();
    
    let tx = await program.methods.initialize().accounts({
      payer: provider.wallet.publicKey,
      someAccount: freshAccount.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId
    }).transaction();

    const blockhash = (await program.provider.connection.getLatestBlockhash("finalized"))
    .blockhash;

    tx.recentBlockhash = blockhash;
    tx.feePayer = provider.wallet.publicKey;
    tx.partialSign(freshAccount)

    console.log("FeePayer :: ", tx.feePayer.toString())

    let serialize_tx_into_string = tx.serialize({requireAllSignatures: false}).toString('base64');
    console.log("Serialize tx to string :: ", serialize_tx_into_string);

    // Deserialize tx from string to Transcation()
    if (typeof serialize_tx_into_string !== 'string') throw new Error('invalid transaction');
    const transaction_from_str = anchor.web3.Transaction.from(Buffer.from(serialize_tx_into_string, 'base64'));
    console.log("Deserialize tx :: ", transaction_from_str.instructions)

    transaction_from_str.partialSign((provider.wallet as NodeWallet).payer);
    const theTx = transaction_from_str.serialize();
    console.log("Final txSerializer ::", theTx)

    const finalTxHash = await program.provider.connection.sendRawTransaction(theTx);
    console.log("txHash :: ", finalTxHash)

  });
});
