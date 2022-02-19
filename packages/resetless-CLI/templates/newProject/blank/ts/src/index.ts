import { Resetless } from '@resetless/core';

const rl = new Resetless();

const handler = (arg: number) => {
  return { value: arg };
};

const handler2 = `(arg: number) => {
  return { value: arg * 2 };
};`;

type Handler = typeof handler;

rl.addImplementationForModule('handler', handler.toString());

console.log(`Handler should return 1: ${rl.getModuleFunction<Handler>('handler')(1)}`);
console.log('After two seconds new version of handler will be added...');

setTimeout(() => {
  rl.addImplementationForModule('handler', handler2);
  console.log('Second version of handler added!');
  console.log(`handler should return 2 ${rl.getModuleFunction<Handler>('handler')(1)}`);
}, 2000);
