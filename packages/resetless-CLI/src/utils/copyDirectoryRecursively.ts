import { ncp } from 'ncp';

export const copyDirectoryRecursively = (source: string, destination: string) =>
  new Promise((resolve, reject) => {
    ncp(source, destination, errors => {
      if (errors) {
        errors.forEach(error => {
          console.log(error);
        });
        reject(errors);
      }
      resolve(1);
    });
  }).catch(reason => process.exit(reason));
