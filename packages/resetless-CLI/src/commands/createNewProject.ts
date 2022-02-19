import chalk from 'chalk';
import { Command } from 'commander';
import inquirer from 'inquirer';
import {
  CreateNewProjectOptions,
  handleCreateNewProjectCommand,
} from '../actions/createNewProject';
import { CommandBase } from './commandBase';
import { getSelectedLanguage, getSelectedTemplate } from './common';
import { join } from 'path';
import ora from 'ora';

export class CreateNewProjectCommand implements CommandBase {
  load(program: Command) {
    program
      .command('new <project-name>')
      .alias('n')
      .description('Generate Resetless application.')
      .option(
        '-l, --language <language>',
        'Programming language to be used (JavaScript or TypeScript).',
      )
      .option(
        '-t, --template <project-template>',
        'Template for project to be used (blank or Express).',
      )
      .action(async (projectName: string, options: Partial<CreateNewProjectOptions>) => {
        const params = {
          ...options,
        };

        if (typeof options.template === 'string') {
          params.template = getSelectedTemplate(options.template);
        }

        if (!options.template) {
          const { projectTemplate } = await inquirer.prompt({
            message: 'Choose a template...',
            type: 'list',
            choices: ['blank', 'express'],
            name: 'projectTemplate',
          });

          params.template = projectTemplate;
        }

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

        const spinner = ora('Bootstraping a new project...').start();
        await handleCreateNewProjectCommand(
          projectName,
          params as CreateNewProjectOptions,
        );
        spinner.stop();

        console.log(
          chalk.green(
            `\n✅ Your project has been successfully bootstrapped into directory:`,
          ),
        );
        console.log(join(process.cwd(), projectName));
        console.log(chalk.blue('\nThanks for using Resetless! Happy coding!'));
      });
  }
}
