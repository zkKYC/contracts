import { BigNumberish, MimcSponge, buildMimcSponge } from "circomlibjs";

// Wrapper class for working with MimcSponge hash from circomlibjs library
export class MiMCSponge {
  private mimcSponge!: MimcSponge;

  async init() {
    this.mimcSponge = await buildMimcSponge();
  }

  hash(xL_in: BigNumberish, xR_in: BigNumberish, k: BigNumberish): string {
    if (!this.mimcSponge) {
      console.error("MimcSponge not initialized. Call init() first.");
      return "";
    }

    const mimcHash = this.mimcSponge.hash(xL_in, xR_in, k);
    const hash = this.mimcSponge.F.toString(mimcHash);
    console.log("MimcSponge hash:", hash);
    return hash;
  }

  multiHash(x: BigNumberish[], k?: BigNumberish, numOutputs?: number): string {
    if (!this.mimcSponge) {
      console.error("MiMCSponge not initialized. Call init() first.");
      return "";
    }

    const mimcHash = this.mimcSponge.multiHash(x, k, numOutputs);
    const hash = this.mimcSponge.F.toString(mimcHash);
    console.log("MimcSponge multiHash:", hash);
    return hash;
  }
}
