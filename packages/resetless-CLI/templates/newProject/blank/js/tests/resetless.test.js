const { Resetless } = require('@resetless/core');

describe('Resetless', () => {
  test('allows to dynamicly change implementation for module during runtime', async () => {
    const rl = new Resetless();

    rl.addImplementationForModule(
      'test',
      `(arg) => {
          return { value: arg };
        };`,
    );

    const response = rl.getModuleFunction('test')(1);
    expect(response).toEqual({ value: 1 });

    rl.addImplementationForModule(
      'test',
      `(arg) => {
          return { value: arg * 2 };
        };`,
    );

    const response = rl.getModuleFunction('test')(2);
    expect(response).toEqual({ value: 4 });
  });
});
