import path from "path";
import fs from "fs";
import { MiMCSponge } from "../helpers/MiMC";

const outputPath = path.join(__dirname, "..", "helpers", "Hasher.json");

function main(): void {
  const mimcSponge = new MiMCSponge();
  const hasher_abi = mimcSponge.getABI();
  const hasher_bytecode = mimcSponge.getBytecode();

  const contract = {
    contractName: "Hasher",
    abi: hasher_abi,
    bytecode: hasher_bytecode,
  };

  fs.writeFileSync(outputPath, JSON.stringify(contract));
}

main();
