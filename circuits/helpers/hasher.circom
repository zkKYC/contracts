pragma circom 2.1.8;

include "../../node_modules/circomlib/circuits/mimcsponge.circom";

template Hasher() {
    signal input val;

    signal output hashedValue;
   
    component hasher = MiMCSponge(1, 220, 1);
    hasher.ins[0] <== val;
    hasher.k <== 0;
    hashedValue <== hasher.outs[0];
}