/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import fs from 'fs';
import temp from 'temp';
import { expression, noopImporter } from '../../tests/utils';
import parse, { ERROR_MISSING_DEFINITION } from '../parse';

describe('parse', () => {
  it('allows custom component definition resolvers', () => {
    const path = expression('{foo: "bar"}');
    const resolver = jest.fn(() => path);
    const handler = jest.fn();
    parse('//empty', resolver, [handler], noopImporter);

    expect(resolver).toBeCalled();
    expect(handler.mock.calls[0][1]).toBe(path);
  });

  it('errors if component definition is not found', () => {
    const resolver = jest.fn();
    expect(() => parse('//empty', resolver, [], noopImporter)).toThrowError(
      ERROR_MISSING_DEFINITION,
    );
    expect(resolver).toBeCalled();

    expect(() => parse('//empty', resolver, [], noopImporter)).toThrowError(
      ERROR_MISSING_DEFINITION,
    );
    expect(resolver).toBeCalled();
  });

  it('uses local babelrc', () => {
    const dir = temp.mkdirSync();

    try {
      // Write and empty babelrc to override the parser defaults
      fs.writeFileSync(`${dir}/.babelrc`, '{}');

      expect(() =>
        parse('const chained  = () => a |> b', () => {}, [], noopImporter, {
          cwd: dir,
          filename: `${dir}/component.js`,
        }),
      ).toThrowError(
        /.*Support for the experimental syntax 'pipelineOperator' isn't currently enabled.*/,
      );
    } finally {
      fs.unlinkSync(`${dir}/.babelrc`);
      fs.rmdirSync(dir);
    }
  });

  it('supports custom parserOptions with plugins', () => {
    expect(() =>
      parse('const chained: Type = 1;', () => {}, [], noopImporter, {
        parserOptions: {
          plugins: [
            // no flow
            'jsx',
          ],
        },
      }),
    ).toThrowError(/.*\(1:13\).*/);
  });

  it('supports custom parserOptions without plugins', () => {
    expect(() =>
      parse('const chained: Type = 1;', () => {}, [], noopImporter, {
        parserOptions: {
          allowSuperOutsideMethod: true,
        },
      }),
    ).toThrowError(ERROR_MISSING_DEFINITION);
  });
});
