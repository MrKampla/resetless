import chalk from 'chalk';
import { Command } from 'commander';
import inquirer from 'inquirer';
import { CommandBase } from './commandBase';
import ora from 'ora';
import {
  handleUploadModuleCommand,
  readConfigFile,
  readModuleCodeFile,
  tryToReadConfigFileFromCurrentDirectory,
  UploadModuleOptions,
} from '../actions/uploadModule';

export class UploadModuleCommand implements CommandBase {
  load(program: Command) {
    program
      .command('upload <module-name>')
      .aliases(['update', 'u'])
      .option('-p, --path <module-path>', 'Path to a module to be uploaded.')
      .option('-c, --disableCache', 'Disable caching of the module.')
      .option(
        '-e, --endpoint <endpoint>',
        'Endpoint of a server to accept module upload.',
      )
      .description('Update a Resetless module in running application.')
      .action(async (moduleName: string, options: Partial<UploadModuleOptions>) => {
        let moduleUpdateConfig = await tryToReadConfigFileFromCurrentDirectory();

        if (!moduleUpdateConfig) {
          const { configPath } = await inquirer.prompt({
            message:
              'Could not load the module update config file from current directory. Provide the path (relative or absolute) to the resetlessModuleUpdate.config.json file:\n',
            default: './resetlessModuleUpdate.config.json',
            name: 'configPath',
          });
          moduleUpdateConfig = await readConfigFile(configPath);
          if (!moduleUpdateConfig) {
            const { wantsToContinueAnyway } = await inquirer.prompt({
              message: `🟡 WARNING! No resetlessModuleUpdate.config.json file found in the chosen directory. 
    Keep in mind that the module update endpoint should be secured, therefore a bare request may potentially fail.
    Do you want to continue without proper configuration?`,
              type: 'confirm',
              name: 'wantsToContinueAnyway',
            });
            if (!wantsToContinueAnyway) {
              return console.log(
                chalk.red(
                  `❗ Please fill in the resetlessModuleUpdate.config.json file.`,
                ),
              );
            }
          }
        }

        const params = {
          ...options,
          modulePath: options.modulePath ?? moduleUpdateConfig?.uploadSettings?.path,
          endpoint: options.endpoint ?? moduleUpdateConfig?.uploadSettings?.endpoint,
          disableCache:
            !options.disableCache ?? moduleUpdateConfig?.uploadSettings?.isCachingEnabled,
        };

        if (!options.modulePath && !moduleUpdateConfig?.uploadSettings?.path) {
          const { path } = await inquirer.prompt({
            message:
              'Provide the path (relative or absolute) to the module to be uploaded:\n',
            default: './dist/module.js',
            name: 'path',
          });
          params.modulePath = path;
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const code = await readModuleCodeFile(params.modulePath!);
        if (!code) {
          return console.log(
            chalk.red(
              `\n❗ Could not load code of the module from the selected path: ${params.modulePath}.`,
            ),
          );
        }
        params.code = code;

        if (!options.endpoint && !moduleUpdateConfig?.uploadSettings?.endpoint) {
          const { endpoint } = await inquirer.prompt({
            message:
              'Provide the URL address of a server with endpoint responsible for module update:\n',
            default: 'http://locallhost:8080/__moduleUpdate',
            name: 'endpoint',
          });
          params.endpoint = endpoint;
        }

        const spinner = ora('Uploading the module to the server...').start();
        try {
          await handleUploadModuleCommand(moduleName, params as UploadModuleOptions);
        } catch (err) {
          return console.log(chalk.red(`\n❗ Something went wrong! Reason: ${err}`));
        } finally {
          spinner.stop();
        }

        console.log(
          chalk.green(
            `\n✅ The ${moduleName} module from ${params.modulePath} has been successfully uploaded to ${params.endpoint}:`,
          ),
        );
      });
  }
}
