import axios, { AxiosRequestConfig } from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { getFullPathToFile } from '../utils/getFullPathToFile';

const DEFAULT_RESETLESS_CONFIG_FILENAME = 'resetlessModuleUpdate.config.json';

type ResetlessUploadModuleRequestConfig = {
  uploadSettings: {
    path: string;
    endpoint: string;
    isCachingEnabled: boolean;
  };
  requestConfig: Omit<
    {
      // eslint-disable-next-line @typescript-eslint/ban-types
      [Property in keyof AxiosRequestConfig]: AxiosRequestConfig[Property] extends Function
        ? never
        : AxiosRequestConfig[Property];
    },
    | 'transformRequest'
    | 'transformResponse'
    | 'paramsSerializer'
    | 'adapter'
    | 'onUploadProgress'
    | 'onDownloadProgress'
    | 'validateStatus'
  >;
};

export interface UploadModuleOptions {
  modulePath: string;
  endpoint: string;
  code: string;
  disableCache: boolean;
  requestConfig: ResetlessUploadModuleRequestConfig;
}

export async function readConfigFile(
  configPath: string,
): Promise<ResetlessUploadModuleRequestConfig | undefined> {
  try {
    const config = (await fs.readFile(getFullPathToFile(configPath))).toString();
    return JSON.parse(config);
  } catch (err) {
    return;
  }
}

export async function tryToReadConfigFileFromCurrentDirectory() {
  return readConfigFile(path.join(process.cwd(), DEFAULT_RESETLESS_CONFIG_FILENAME));
}

export async function readModuleCodeFile(modulePath: string) {
  try {
    const moduleCode = (await fs.readFile(getFullPathToFile(modulePath))).toString();
    return moduleCode;
  } catch (err) {
    return;
  }
}

export async function handleUploadModuleCommand(
  moduleName: string,
  options: UploadModuleOptions,
) {
  return axios({
    method: 'POST',
    url: options.endpoint,
    data: {
      module: {
        name: moduleName,
        code: options.code,
        enableCaching: options.disableCache ?? true,
      },
    },
    ...options.requestConfig,
  });
}
