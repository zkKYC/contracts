pragma circom 2.1.8;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../helpers/mimc.circom";

template age(n) {
    signal input birthdayTimestamp;
    signal input nowTimestamp;
    signal input secret;
    signal input hashBirthdayTimestamp;
    signal input nonce;

    signal output out;
    signal output squaredNonce;

    // You can add a bitness check so that no underflow occurs during subtraction 

    signal adult <== 568036800;
    signal difference <== nowTimestamp - birthdayTimestamp;

    // 1. If in[0] < in[1]
    // 0. If in[0] > in[1]
    component lessThan = LessThan(n);
    lessThan.in[0] <== adult;
    lessThan.in[1] <== difference;

    // Checking that the difference is greater than adult
    assert(lessThan.out == 1);

    component hasher = mimc();
    hasher.val <== birthdayTimestamp;
    hasher.secret <== secret;
    hasher.hashedVal <== hashBirthdayTimestamp;

    squaredNonce <== nonce * nonce;
    out <== lessThan.out;
}

component main {public [nowTimestamp, hashBirthdayTimestamp]} = age(48);
