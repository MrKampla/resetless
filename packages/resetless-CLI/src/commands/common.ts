export const getSelectedLanguage = (arg: string) => {
  const languageFromArg = arg.toLowerCase();
  if (languageFromArg === 'js' || languageFromArg === 'javascript') {
    return 'js';
  }
  if (languageFromArg === 'ts' || languageFromArg === 'typescript') {
    return 'ts';
  }
  throw new Error('Unsupported language, please choose JavaScript or TypeScript');
};

export const getSelectedTemplate = (arg: string) => {
  const templateFromArg = arg
    .toLowerCase()
    // remove quotation marks
    .replace("'", '')
    .replace('"', '');

  if (templateFromArg !== 'blank' && templateFromArg !== 'express') {
    throw new Error(`Template not found, please choose 'blank' or 'express'`);
  }

  return templateFromArg;
};
