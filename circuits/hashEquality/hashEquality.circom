pragma circom 2.1.8;

include "../helpers/mimc.circom";

template hashEquality() {
    signal input value;
    signal input secret;
    signal input hashedValue;
    signal input nonce;

    signal output squaredNonce;

    component hasher = mimc();
    hasher.val <== value;
    hasher.secret <== secret;
    hasher.hashedVal <== hashedValue;

    squaredNonce <== nonce * nonce;
}

component main {public [value, hashedValue, nonce]} = hashEquality();
