import {
  ModuleImplementationNotFound,
  ModuleWithoutCode,
  NoFunctionReturnedFromModule,
} from './errors/coreErrors';

export interface ResetlessModule {
  code: string;
  modifiedAt: Date;
  version: number;
  isCachingEnabled: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  moduleFunction?: Function | undefined;
}

/**
 * Resetless Framework allows for modifying server code during runtime without restarting the server.
 * How to add/modify code to a running server? You have to configure a trigger:
 * code trigger - called a function `addImplementationForModule` that adds new version of a module from the code
 * FS trigger - changed or uploaded a file which triggerd a FileSystemTrigger to reload a module
 * HTTP trigger - called an http endpoint that allows for rebuilding a module (dependend on underlying framework)
 */
export class Resetless {
  private modulesCache: Map<string, ResetlessModule> = new Map();

  private getModule(moduleName: string) {
    return this.modulesCache.get(moduleName);
  }

  private addModule(
    moduleName: string,
    {
      code,
      enableCaching,
      existingModuleVersion,
    }: { code: string; enableCaching: boolean; existingModuleVersion?: number },
  ) {
    // bump module version if it has previously existed in cache
    const newVersion = existingModuleVersion ? existingModuleVersion + 1 : 1;

    this.modulesCache.set(moduleName, {
      code,
      modifiedAt: new Date(),
      version: newVersion,
      isCachingEnabled: enableCaching,
    });
  }

  private getCachedModuleFunction(moduleName: string) {
    return this.getModule(moduleName)?.moduleFunction;
  }

  addImplementationForModule(
    moduleName: string,
    moduleCode: string,
    enableCaching = true,
  ) {
    if (!moduleCode) {
      throw new ModuleWithoutCode();
    }

    const existingModuleVersion = this.getModule(moduleName)?.version;

    this.addModule(moduleName, {
      code: moduleCode,
      enableCaching,
      existingModuleVersion,
    });
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  getModuleFunction<ModuleFunction = Function>(moduleName: string): ModuleFunction {
    const implementationOfRequestedModule = this.getModule(moduleName);

    if (!implementationOfRequestedModule) {
      throw new ModuleImplementationNotFound();
    }

    const cachedModuleFunction = this.getCachedModuleFunction(moduleName);

    if (cachedModuleFunction) {
      return (cachedModuleFunction as unknown) as ModuleFunction;
    }

    const module = eval(implementationOfRequestedModule.code) as ModuleFunction;
    if (typeof module !== 'function') {
      throw new NoFunctionReturnedFromModule();
    }

    if (implementationOfRequestedModule.isCachingEnabled) {
      this.modulesCache.set(moduleName, {
        ...implementationOfRequestedModule,
        moduleFunction: module,
      });
    }

    return module;
  }

  getCachedModulesInfo({ omitCode = false }: { omitCode?: boolean } = {}) {
    return Array.from(this.modulesCache, ([name, value]) => ({
      name,
      ...value,
      code: omitCode ? undefined : value.code,
      moduleFunction: undefined,
    }));
  }
}
