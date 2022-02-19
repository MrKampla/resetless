import fs from 'fs/promises';
import { asyncDependencyFunc } from '../src/moduleDependency';

describe('Module test', () => {
  let module: string;

  beforeAll(async () => {
    module = (await fs.readFile('dist/module.js')).toString();
  });

  test('Module is runnable and returns correct value', async () => {
    const moduleFunction = eval(module);

    const result = await moduleFunction('1');

    expect(result).toEqual((await asyncDependencyFunc()) + '1');
  });
});
