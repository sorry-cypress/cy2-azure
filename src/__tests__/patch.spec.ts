const fs = require('fs');
const path = require('path');

const yaml = require('js-yaml');
const { nanoid } = require('nanoid');

const { patch } = require('../patch');
const { getConfigFilesPaths } = require('../discovery');

jest.mock('../discovery');

const originalAppConfig = path.resolve(__dirname, './fixtures/config/app.yml');
const originalUploadLib = path.resolve(__dirname, './fixtures/lib/upload.js');

test('should patch', async () => {
  const seed = nanoid();
  const appConfigFilename = `./fixtures/config/__temp_fixture_${seed}`;
  const uploadLibFilename = `./fixtures/lib/__temp_fixture_${seed}`;

  const configFilePath = path.resolve(__dirname, `${appConfigFilename}.yml`);
  const backupConfigFilePath = path.resolve(
  __dirname,
  `${appConfigFilename}_backup.yml`
  );
  const uploadLibFilePath = path.resolve(__dirname, `${uploadLibFilename}.js`);
  const backupUploadLibFilePath = path.resolve(
  __dirname,
  `${uploadLibFilename}_backup.js`
  );

  fs.copyFileSync(originalAppConfig, configFilePath);
  fs.copyFileSync(originalUploadLib, uploadLibFilePath);

  getConfigFilesPaths.mockResolvedValueOnce({
    configFilePath,
    backupConfigFilePath,
    uploadLibFilePath,
    backupUploadLibFilePath,
  });

  await patch(seed);

  const doc = yaml.load(fs.readFileSync(configFilePath, 'utf8'));
  expect(doc.production.api_url).toEqual(seed); // Check patched file
  expect(fs.readFileSync(backupConfigFilePath, 'utf8')).toEqual(fs.readFileSync(originalAppConfig, 'utf8')); // Check backup

  const uploadJS = fs.readFileSync(uploadLibFilePath, 'utf8');
  expect(uploadJS).toContain('body: buf, headers: { "x-ms-blob-type": "BlockBlob" },') // Check patched file
  expect(fs.readFileSync(backupUploadLibFilePath, 'utf8')).toEqual(fs.readFileSync(originalUploadLib, 'utf8')); // Check backup
});
