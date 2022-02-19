import { asyncDependencyFunc } from './moduleDependency';

(() => {
  console.log('Initialization of the module...');
  return async function add(b: string) {
    return (await asyncDependencyFunc()) + b;
  };
})();
