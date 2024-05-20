pragma circom 2.1.8;

include "../helpers/mimc.circom";

template blindHashEquality() {
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

component main {public [hashedValue, nonce]} = blindHashEquality();
