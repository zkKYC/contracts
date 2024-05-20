pragma circom 2.1.8;

include "../../node_modules/circomlib/circuits/mimcsponge.circom";

template mimc() {
	signal input val;
	signal input secret;
    signal input hashedVal;

    component hasher = MiMCSponge(2, 220, 1);
    hasher.ins[0] <== val;
    hasher.ins[1] <== secret;
    hasher.k <== 0;

    log(hasher.outs[0]);
    log(hashedVal);
    hashedVal === hasher.outs[0];
}