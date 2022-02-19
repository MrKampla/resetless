import { ModuleImplementationNotFound } from '../src/errors/coreErrors';
import { Resetless } from '../src/resetless';

const EXAMPLE_MODULE_CODE = '() => 42';

describe('Resetless core', () => {
  let rl: Resetless;

  beforeEach(() => {
    rl = new Resetless();
  });

  test('add implementation for a module', () => {
    rl.addImplementationForModule('module', EXAMPLE_MODULE_CODE);

    const moduleCode = rl.getModuleFunction('module');

    expect(moduleCode).toBeDefined();
    expect(typeof moduleCode).toEqual('function');
  });

  test('get implementation for a module', () => {
    rl.addImplementationForModule('module', EXAMPLE_MODULE_CODE);

    const moduleCode = rl.getModuleFunction('module');

    expect(moduleCode).toBeDefined();
    expect(moduleCode.toString()).toEqual(EXAMPLE_MODULE_CODE);
  });

  test('overwrite existing implementation for a module', () => {
    rl.addImplementationForModule('module', EXAMPLE_MODULE_CODE);

    const moduleCode = rl.getModuleFunction('module');

    expect(moduleCode).toBeDefined();
    expect(moduleCode.toString()).toEqual(EXAMPLE_MODULE_CODE);

    rl.addImplementationForModule('module', '() => 44');

    const moduleCodeAfterChange = rl.getModuleFunction('module');

    expect(moduleCodeAfterChange).toBeDefined();
    expect(moduleCodeAfterChange.toString()).toEqual('() => 44');
  });

  test('throw an error if module implementation has not been found', () => {
    expect(() => rl.getModuleFunction('module')).toThrowError(
      new ModuleImplementationNotFound().message,
    );
  });

  test('get dump from cache describing all loaded modules', () => {
    rl.addImplementationForModule('module', EXAMPLE_MODULE_CODE);
    rl.addImplementationForModule('module2', EXAMPLE_MODULE_CODE);
    rl.addImplementationForModule('module2', EXAMPLE_MODULE_CODE);

    const cacheInfo = rl.getCachedModulesInfo();

    expect(cacheInfo.length).toEqual(2);
    expect(cacheInfo[0].name).toEqual('module');
    expect(cacheInfo[0].version).toEqual(1);
    expect(cacheInfo[1].name).toEqual('module2');
    expect(cacheInfo[1].version).toEqual(2);
  });

  test('check if module functions are cached by default', () => {
    rl.addImplementationForModule(
      'module',
      `(() => {
        // this runs only once when caching is enabled
        let x = 0;
        return () => ++x;
     })();`,
    );

    rl.getModuleFunction('module')();
    rl.getModuleFunction('module')();
    const res = rl.getModuleFunction('module')();

    expect(res).toEqual(3);
  });

  test('module function caching can be disabled', () => {
    rl.addImplementationForModule(
      'module',
      `(() => {
        // this runs every time when caching is disabled
        let x = 0;
        return () => ++x;
       })();`,
      false,
    );

    rl.getModuleFunction('module')();
    rl.getModuleFunction('module')();
    const res = rl.getModuleFunction('module')();

    expect(res).toEqual(1);
  });
});
