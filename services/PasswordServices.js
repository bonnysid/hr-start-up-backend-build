"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomCode = exports.generatePassword = void 0;
const SYMBOLS = '#$%&()*+,-./:;<=>?@[]^_{|}~]'.split('');
const WORDS = 'qwertyuiopasdfghjklzxcvbnm'.split('');
const NUMBERS = '1234567890'.split('');
const PASS_SYM = [SYMBOLS, WORDS, NUMBERS];
const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
};
const generatePassword = (length = 25) => {
    let res = '';
    for (let i = 0; i < length; i++) {
        const randomSymArrIndex = getRandomInt(PASS_SYM.length);
        const randomSymArr = PASS_SYM[randomSymArrIndex];
        const randomSymIndex = getRandomInt(randomSymArr.length);
        const randomSym = randomSymArr[randomSymIndex];
        res += randomSym;
    }
    return res;
};
exports.generatePassword = generatePassword;
const generateRandomCode = (length = 8) => {
    let res = '';
    for (let i = 0; i < length; i++) {
        const randomSymIndex = getRandomInt(NUMBERS.length);
        const randomSym = NUMBERS[randomSymIndex];
        res += randomSym;
    }
    return res;
};
exports.generateRandomCode = generateRandomCode;
