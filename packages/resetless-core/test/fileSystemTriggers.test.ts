import { existsSync } from 'fs';
import fs from 'fs/promises';
import { ModuleImplementationNotFound } from '../src/errors/coreErrors';
import { Resetless, ModuleFileTrigger, ModuleDirectoryTrigger } from '../src/index';
import { waitFor } from './testUtils';

describe('File system triggers', () => {
  let rl: Resetless;
  beforeEach(() => {
    rl = new Resetless();
  });

  beforeAll(async () => {
    if (!existsSync('./test_packages')) {
      await fs.mkdir('./test_packages');
    }
  });

  afterAll(async () => {
    await fs.unlink('./impl.js');
    await fs.rm('./test_packages', { recursive: true, force: true });
  });

  describe('ModuleFileTrigger', async () => {
    test('watches single file for changes and causes module to reload', async () => {
      await fs.writeFile('./impl.js', '() => 1');

      rl.addImplementationForModule(
        'handler',
        (await fs.readFile('./impl.js')).toString(),
      );
      const fsChangeTrigger = new ModuleFileTrigger({
        moduleName: 'handler',
        path: './impl.js',
      });

      fsChangeTrigger.enableTrigger(rl);
      const moduleFunctionBeforeChange = rl.getModuleFunction<() => number>('handler');

      expect(moduleFunctionBeforeChange()).toEqual(1);

      await fs.writeFile('./impl.js', '() => 2');

      await waitFor(() => {
        const moduleFunctionAfterChange = rl.getModuleFunction<() => number>('handler');
        expect(moduleFunctionAfterChange()).toEqual(2);
      }, 2000);

      fsChangeTrigger.disableTrigger(rl);
    });
  });

  describe('ModuleDirectoryTrigger', () => {
    test('watches for new files in selected directory and adds new modules', async () => {
      const fsChangeTrigger = new ModuleDirectoryTrigger({
        path: './test_packages',
      });

      fsChangeTrigger.enableTrigger(rl);

      expect(() => rl.getModuleFunction<() => number>('impl')).toThrowError(
        new ModuleImplementationNotFound().message,
      );

      await fs.writeFile('./test_packages/impl.js', '() => 1');

      await waitFor(() => {
        const moduleFunctionAfterChange = rl.getModuleFunction<() => number>('impl');
        expect(moduleFunctionAfterChange()).toEqual(1);
      }, 2000);

      fsChangeTrigger.disableTrigger(rl);
    });

    test('watches for file changes in selected directory and overwrites existing modules', async () => {
      const fsChangeTrigger = new ModuleDirectoryTrigger({
        path: './test_packages',
      });
      await fs.writeFile('./test_packages/impl.js', '() => 1');

      fsChangeTrigger.enableTrigger(rl);

      expect(() => rl.getModuleFunction<() => number>('impl')).toThrowError(
        new ModuleImplementationNotFound().message,
      );

      await fs.writeFile('./test_packages/impl.js', '() => 2');

      await waitFor(() => {
        const moduleFunctionAfterChange = rl.getModuleFunction<() => number>('impl');
        expect(moduleFunctionAfterChange()).toEqual(2);
      }, 2000);

      fsChangeTrigger.disableTrigger(rl);
    });
  });
});
