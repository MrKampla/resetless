#!/usr/bin/env node

import { program } from 'commander';
import loadCommands from './commands/commandLoader';
import { isRunWithArguments } from './utils/isRunWithArguments';

program
  .name('resetless')
  .version(
    require('../package.json').version,
    '-v, --version',
    'Output the current version.',
  );
program.addHelpCommand();

loadCommands(program);

program.parse(process.argv);

if (!isRunWithArguments(process)) {
  program.outputHelp();
}
