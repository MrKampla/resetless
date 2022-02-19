import chalk from 'chalk';
import { Command } from 'commander';
import inquirer from 'inquirer';
import { CommandBase } from './commandBase';
import { getSelectedLanguage } from './common';
import { join } from 'path';
import ora from 'ora';
import {
  GenerateNewModuleOptions,
  handleGenerateNewModuleCommand,
} from '../actions/generateNewModule';

export class GenerateNewModuleCommand implements CommandBase {
  load(program: Command) {
    program
      .command('generate <module-name>')
      .alias('g')
      .description('Generate new Resetless module.')
      .option(
        '-l, --language <language>',
        'Programming language to be used (JavaScript or TypeScript).',
      )
      .action(async (moduleName: string, options: Partial<GenerateNewModuleOptions>) => {
        const params = {
          ...options,
        };

        if (typeof options.language === 'string') {
          params.language = getSelectedLanguage(options.language);
        }

        if (!options.language) {
          const { selectedLanguage } = await inquirer.prompt({
            message: 'Which language do You want to use?',
            type: 'list',
            choices: ['JavaScript', 'TypeScript'],
            name: 'selectedLanguage',
          });
          params.language = getSelectedLanguage(selectedLanguage);
        }

        const spinner = ora('Generating a new module...').start();
        await handleGenerateNewModuleCommand(
          moduleName,
          params as GenerateNewModuleOptions,
        );
        spinner.stop();

        console.log(
          chalk.green(`\n✅ New module has been successfully generated into directory:`),
        );
        console.log(join(process.cwd(), moduleName));
        console.log(chalk.blue('\nThanks for using Resetless! Happy coding!'));
      });
  }
}
