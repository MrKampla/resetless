const fs = require('fs/promises');
const { asyncDependencyFunc } = require('../src/moduleDependency');

describe('Module test', () => {
  let module;
  beforeAll(async () => {
    module = (await fs.readFile('dist/module.js')).toString();
  });

  test('Module is runnable and returns correct value', async () => {
    const moduleFunction = eval(module);

    const result = await moduleFunction('1');

    expect(result).toEqual((await asyncDependencyFunc()) + '1');
  });
});
