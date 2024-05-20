export function toFixedHex(number: BigInt, length = 32) {
  let str = number.toString(16);
  while (str.length < length * 2) str = "0" + str;
  str = "0x" + str;
  return str;
}
