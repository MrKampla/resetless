# Resetless

<p align=center>A Node.js framework with Hot Module Replacement (HMR) for backend</p>

## Description

Resetless is an unopinionated and mimimalist micro framework for building unstoppable, modular Node.js server-side applications. Its main advantage is the module resolution system that allows for adding new or updating existing modules to the app during runtime, without the need of restarting it. No more update downtime on production - ship new functionality within a blink of an eye! Resetless is built with TypeScript (but also can be use with pure JavaScript) and it really emphasizes modular and granular application creation. It doesn't enforce anything on the user, it's framework-agnostic and can be used together with other backend frameworks like Express.js or Fastify. It also can be used as a dependency injection container.

### Getting started

In order to add Resetless to Your application, run:

```sh
yarn add @resetless/core
```

or

```sh
npm install @resetless/core
```

Resetless also delivers a handy CLI tool for developing modules and updating them on the remote server.
You can install it globally:

```sh
npm install @resetless/cli -g
```

and then global resetless binary will be availible in Your terminal.
To start a new project with resetless, run command:

```sh
resetless new project-name
```

More information about CLI can be found [here](#resetless-cli)

### How to use

```ts
import { Resetless } from '@resetless/core';

const rl = new Resetless();

const handler = (arg: number) => {
return { value: arg };
};

const handler2 = '(arg: number) => {
return { value: arg * 2 };
};';

type Handler = typeof handler;

rl.addImplementationForModule('handler', handler.toString());

console.log('Handler should return 1: ' + rl.getModuleFunction<Handler>('handler')(1));
console.log('After two seconds new version of handler will be added...');

setTimeout(() => {
rl.addImplementationForModule('handler', handler2);
console.log('Second version of handler added!');
console.log('handler should return 2 ' + rl.getModuleFunction<Handler>('handler')(1));
}, 2000);
`
```

First, You have to create a Resetless instance by invoking a constructor. Then the instance exposes the following methods:

- `addImplementationForModule(moduleName: string, moduleCode: string, enableCaching = true): void` - it allows to add new implementation for a certain module. A new implementation can be added multiple times for a single module, and it will just override the older one.
- `getModuleFunction<ModuleFunction = Function>(moduleName: string): ModuleFunction` - this function returns a function assigned to the requested module.
- `getCachedModulesInfo({ omitCode = false }: { omitCode: boolean })` - dumps information about all modules currently existing in cache. It provides basic information like module name, timestamp of last edit, module version, and optionally it can provide code of module implementation.

#### Modules

By module, we mean a function that implements some functionality. Resetless allows for this function to change implementation dynamically during runtime, even if this function wasn't present in the bundle package during deployment. This model of software creation enables unprecedented flexibility and makes deployments easier.

Resetless uses JavaScript `eval` function to evaluate module code, so module shouldn't use any exporting syntax like `export` keyword or `module.exports`. In order for Resetless to be able to extract that module function, it has to be declared as inline anonymous function:

```js
// this is a module file
anyArguments => {
  // module logic
};
```

Some bundlers may ignore statements with no effects (and a bare anonymous function declaration can be classified as such) so in order to omit this issue, we suggest wrapping a module in an IIFE, and returning an actual function from it:

```js
// this is a module file
(() => {
  // place for some initialization code
  return arg => {
    // module logic
  };
})();
```

#### Module reload triggering

Updating a certain functionality by swapping underlying module function on a server can be triggered in multiple ways. We'll cover few of them:

- programmatic reload - You can use `addImplementationForModule` function whenever and wherever You want - there aren't any restrictions to adding new modules
- HTTP Request module reload - Thanks to easy integration with any backend web framework, Resetless can reload modules in response to particular HTTP requests. An example of authorized module swap on request with Express.js will be shown [here](#example-usage-with-express).
- File System trigger - Resetless exposes two file system watchers that enable module swapping by changes in file structure:
  - ModuleFileTrigger - watches a single file and reloads a particular module on each file modification
  - ModuleDirectoryTrigger - watches a directory and reloads a module called like changed file, e.g. Admin uploaded a module called example.js so Resetless will reload a module called 'example'.

### Example usage with Express

When using a web framework like Express, HTTP requests can trigger module reloads. Look at the example below:

```ts
import { Resetless } from '@resetless/core';
import express, { Request, RequestHandler, Response } from 'express';
import {
initializeModuleInfoEndpoint,
initializeModuleUpdateEndpoint,
} from './resetlessExpressEndpoints';
import 'dotenv/config';

const app = express();
app.use(express.json());

const rl = new Resetless();

const handler = (\_req: Request, res: Response) => {
res.json({ hello: "world" });
};

rl.addImplementationForModule('hello-world', handler.toString());

initializeModuleInfoEndpoint(app, rl, {
password: process.env.RESETLESS_MODULE_INFO_PASSWORD ?? 'pass',
});
initializeModuleUpdateEndpoint(app, rl, {
password: process.env.RESETLESS_MODULE_UPDATE_PASSWORD ?? 'pass',
});

app.get('/hello-world', (req, res, next) =>
rl.getModuleFunction<RequestHandler>('hello-world')(req, res, next),
);

app.listen(8080, () => console.log('Listening on 8080'));
```

On each GET request to /hello-world, a module function called 'hello-world' will be invoked. Without Resetless, there isn't any possibility to change function implementation. But thanks to this function `initializeModuleUpdateEndpoint` we're able to change the module:

```ts
import { Resetless } from '@resetless/core';
import { Express } from 'express';

export const initializeModuleUpdateEndpoint = (
  app: Express,
  rl: Resetless,
  { password, customEndpoint }: { password: string; customEndpoint?: string },
) => {
  app.post(customEndpoint ?? '/__moduleUpdate', (req, res) => {
    if (req.body?.password !== password) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const { name, code, enableCaching } = req.body.module;
    if (!name || !code) {
      return res.status(400).json({
        reason: 'Module name or code has not been defined',
      });
    }

    return res.json(rl.addImplementationForModule(name, code, enableCaching ?? true));
  });
};

export const initializeModuleInfoEndpoint = (
  app: Express,
  rl: Resetless,
  { password, customEndpoint }: { password: string; customEndpoint?: string },
) => {
  app.get(customEndpoint ?? '/__moduleInfo', (req, res) => {
    if (req.body?.password !== password) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    return res.json(rl.getCachedModulesInfo());
  });
};
```

As You can see, by firing a request to /\_\_moduleUpdate endpoint, we are able to add a new implementation for any module we want. There is also a possibility of securing this endpoint with a password - as probably we don't want any random user to change the implementation of our module's functionality. This implementation of authorization by simple password is just an example to prove a point - You can attach any authorization solution to it.

Additionally, it's worth to set up /\_\_moduleInfo endpoint that can show valuable information about modules currently available in cache.

#### Module caching

By default, adding a module implementation does not trigger its parsing. The module will only be parsed once on the first request. But module caching can be turned off - in this case the module will be parsed every time it's requested. In order to see the difference, we've wrapped an actual module function in an IIFE. An IIFE can be used to leverage closure and [the module pattern](https://developer.mozilla.org/en-US/docs/Glossary/IIFE#the_module_pattern).

```js
rl.addImplementationForModule(
  'module',
  `(() => {
        // this runs every time when caching is disabled
        let x = 0;
        return () => ++x;
       })();`,
  false, // This disables caching
);
```

### Resetless CLI

The aim of Resetless CLI tool is to improve the developer experience by automating the initialization process of a project or by setting up an environment for creating new modules.

#### New project

In order to create a new project with Resetless preinstalled (blank or Express), run:

```
resetless new <project-name> ['-l, --language <language>'] ['-t, --template <project-template>']
```

#### New module

If You want to generate a new repo for Resetless module, run:

```
resetless generate <module-name> ['-l, --language <language>']
```

Newly generated module comes with Parcel bundler built-in and configured properly. Before actually uploading the module to the server, don't forget to run a build process that'll produce a single file `dist/module.js`. Thanks to Parcel, You can split up module code into multiple files and use `require` or `ES6 imports` at Your discretion.

#### Module update in the remote server

We've shown an idea how to use Resetless with backend framework like express to create updatable backend application. There is a specific command in the CLI to help You with uploading modules to a running server. In order for this functionality to work, You have to provide some details about Your implementation like path to the file with code of the module and the endpoint that You want to fire a request to. You can also modify the actual request that will be sent to Your server. It is necessary to secure the module update endpoint in order to prevent unauthorized access, for example with a mandatory password that needs to be passed with the request. You can implement that by adding an Authorization header to the request.

All of that can be done with a configuration file. By default, CLI will check for `resetlessModuleUpdate.config.json` file in the current working directory. If it cannot be found, then the CLI will ask You to provide a path to the config file.

Resetless module update config looks like this:

```json
{
  "uploadSettings": {
    "path": "./dist/module.js",
    "endpoint": "http://localhost:8080/__moduleUpdate"
  },
  "requestConfig": {
    "headers": {
      "Authorization": "some-secret-password"
    }
  }
}
```

It consists of two objects, first one is called `uploadSettings` and it allows to specify path to the module code and the endpoint that the CLI will fire to. Second object is `requestConfig` and it accepts any data. Resetless CLI uses axios under the hood and all properties from `requestConfig` will be forwarded to axios instance, so You can override the default request.

```js
// this is the default request that CLI makes
axios({
  method: 'POST',
  data: {
    module: {
      name: moduleName,
      code: options.code,
      enableCaching: options.isCachingEnabled ?? true,
    },
  },
  ...options.requestConfig,
});
```

If You want upload a Resetless module from the CLI, run:

```
resetless update <module-name>
```

#### Getting help

Please remember that by passing `--help` option to the CLI, You'll always get the current list of supported commands:

```
resetless --help
```

### Development guide

This monorepo consists of two separate packages: Resetless core and CLI. For managing these projects we use Lerna.

To install dependencies for the packages, run:

```
yarn bootstrap
```

To remove depenedencies folder, run:

```
yarn clean
```

In order to add a new dependency, use:

```
lerna add package-name --scope=@resetless/module-name [--dev]
```
