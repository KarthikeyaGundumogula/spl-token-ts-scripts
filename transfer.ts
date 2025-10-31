import {
  Commitment,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import wallet from "./guideSecret.json";
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection(
  "https://thrilling-crimson-telescope.solana-devnet.quiknode.pro/7a4b1449eb7c342487be87e219813391bd5a14bc/",
  commitment
);

// Mint address
const mint = new PublicKey("GTUUnFV7JpPXPEaSXjhqjZJqtRNsMhvEpnyZdFdHQ2oF");

// Recipient address
const to = new PublicKey("4skPC47LyisLYW2yJPQx57S7nE9Jm86ZsgaCJemd45BQ");

(async () => {
  try {
    // Get the token account of the fromWallet address, and if it does not exist, create it
    var fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey
    );

    // Get the token account of the toWallet address, and if it does not exist, create it
    var toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      to
    );

    // Transfer the new token to the "toTokenAccount" we just created
    const signature = await transfer(
      connection,
      keypair,
      fromTokenAccount.address,
      toTokenAccount.address,
      keypair.publicKey,
      1 * 10 ** 8,
      []
    );
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
