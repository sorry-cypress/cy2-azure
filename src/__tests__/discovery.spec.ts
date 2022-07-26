import fs from 'fs';
import { getConfigFilesPaths } from '../discovery';
import { getConfigFilesPaths_stateModule } from '../discovery-state-module';
import { getConfigFilesPaths_cli } from '../discovery-cli';

jest.mock('../discovery-state-module');
jest.mock('../discovery-cli');

test('should use explicit path', async () => {
  fs.statSync = jest.fn().mockReturnValue(true);

  const result = await getConfigFilesPaths('explicitPath/config/app.yml');

  expect(result.configFilePath).toMatch('explicitPath/config/app.yml');
  expect(result.backupConfigFilePath).toMatch('explicitPath/config/_app.yml');
  expect(result.uploadLibFilePath).toMatch('explicitPath/lib/upload.js');
  expect(result.backupUploadLibFilePath).toMatch('explicitPath/lib/_upload.js');
  expect(fs.statSync).toHaveBeenCalledWith(
    expect.stringMatching('explicitPath')
  );
});

test('should use state-module', async () => {
  (getConfigFilesPaths_stateModule as jest.Mock).mockReturnValue({});

  await getConfigFilesPaths();

  expect(getConfigFilesPaths_stateModule).toHaveBeenCalled();
});

test('should use getConfigFilesPaths_cli', async () => {
  (getConfigFilesPaths_stateModule as jest.Mock).mockRejectedValueOnce(
    new Error('oh!')
  );

  await getConfigFilesPaths();

  expect(getConfigFilesPaths_stateModule).toHaveBeenCalled();
  expect(getConfigFilesPaths_cli).toHaveBeenCalled();
});
