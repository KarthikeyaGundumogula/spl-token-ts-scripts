import {
  createNft,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createGenericFile,
  createSignerFromKeypair,
  generateSigner,
  keypairIdentity,
  percentAmount,
  sol,
} from "@metaplex-foundation/umi";
import { mockStorage } from "@metaplex-foundation/umi-storage-mock";
import * as fs from "fs";
import secret from "../guideSecret.json";

const QUICKNODE_RPC =
  "https://thrilling-crimson-telescope.solana-devnet.quiknode.pro/<000 Replace with API>/";
const umi = createUmi(QUICKNODE_RPC);

const creatorWallet = umi.eddsa.createKeypairFromSecretKey(
  new Uint8Array(secret)
);
const creator = createSignerFromKeypair(umi, creatorWallet);
umi.use(keypairIdentity(creator));
umi.use(mplTokenMetadata());
umi.use(mockStorage());

const nftDetail = {
  name: "Kapten Vault",
  symbol: "KPTN",
  uri: "IPFS_URL_OF_METADATA",
  description: "DePIN capital markets vault",
  imgType: "image/jpg",
};

// mint address: 7KVwmjUutcW4hHoGvKAMbGtXC7GQtsh7C3MZFtafBjfB

async function uploadImage(): Promise<string> {
  try {
    const imgName = "vault";
    const filePath = `nft-scripts/vault.png`;
    const fileBuffer = fs.readFileSync(filePath);
    const image = createGenericFile(fileBuffer, imgName, {
      uniqueName: nftDetail.name,
      contentType: nftDetail.imgType,
    });
    const [imgUri] = await umi.uploader.upload([image]);
    console.log("Uploaded image:", imgUri);
    return imgUri;
  } catch (e) {
    throw e;
  }
}

async function uploadMetadata(imageUri: string): Promise<string> {
  try {
    const metadata = {
      name: nftDetail.name,
      description: nftDetail.description,
      image: imageUri,
    };
    const metadataUri = await umi.uploader.uploadJson(metadata);
    console.log("Uploaded metadata:", metadataUri);
    return metadataUri;
  } catch (e) {
    throw e;
  }
}

async function mintNft(metadataUri: string) {
  try {
    const mint = generateSigner(umi);
    await createNft(umi, {
      mint,
      name: nftDetail.name,
      symbol: nftDetail.symbol,
      uri: metadataUri,
      sellerFeeBasisPoints: percentAmount(0),
      creators: [{ address: creator.publicKey, verified: true, share: 100 }],
    }).sendAndConfirm(umi);
    console.log(`Created NFT: ${mint.publicKey.toString()}`);
  } catch (e) {
    throw e;
  }
}

async function main() {
  const imageUri = await uploadImage();
  const metadataUri = await uploadMetadata(imageUri);
  await mintNft(metadataUri);
}

main();
