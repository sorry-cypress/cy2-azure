import { ConfigFiles } from 'files';
import fs from 'fs';
import path from 'path';
import { debug } from './debug';

import { getConfigFilesPaths_cli } from './discovery-cli';
import { getConfigFromElectronBinary } from './discovery-run-binary';
import { getConfigFilesPaths_stateModule } from './discovery-state-module';

export async function getConfigFilesPaths(
  cypressConfigFilePath: string | null = null
): Promise<ConfigFiles> {
  let explicitConfigPaths = {};
  if (typeof cypressConfigFilePath === 'string') {
    const explicitPath = path.resolve(
      path.normalize(cypressConfigFilePath.trim())
    );
    debug(
      'Explicit package path provided via CYPRESS_PACKAGE_CONFIG_PATH: %s',
      explicitPath
    );

    // verify the path
    fs.statSync(explicitPath);
    explicitConfigPaths = {
      configFilePath: explicitPath,
      backupConfigFilePath: explicitPath.replace('app.yml', '_app.yml'),
    };
  }

  if (typeof process.env.CYPRESS_RUN_BINARY === 'string') {
    debug('CYPRESS_RUN_BINARY: %s', process.env.CYPRESS_RUN_BINARY);
  } else {
    debug('No CYPRESS_RUN_BINARY env var provided')
  }

  const implicitConfigPaths = typeof process.env.CYPRESS_RUN_BINARY === 'string' ? await tryAll(() =>
  getConfigFromElectronBinary(process.env.CYPRESS_RUN_BINARY as string)
  ) : await tryAll(getConfigFilesPaths_stateModule, getConfigFilesPaths_cli);

  return { ...explicitConfigPaths, ...implicitConfigPaths };
}

async function tryAll(...fns) {
  const errors: Error[] = [];
  for (const fn of fns) {
    try {
      // @ts-ignore
      return await fn();
    } catch (e) {
      debug('Discovery error: %s', e);
      errors.push(e);
    }
  }
  console.error(errors);
  throw new Error('Cannot detect cypress location');
}
