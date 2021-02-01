/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

jest.mock('../resolveToValue');

import { statement, noopImporter } from '../../../tests/utils';
import resolveToValue from '../resolveToValue';
import resolveExportDeclaration from '../resolveExportDeclaration';

describe('resolveExportDeclaration', () => {
  const returnValue = {};

  beforeEach(() => {
    resolveToValue.mockReturnValue(returnValue);
  });

  it('resolves default exports', () => {
    const exp = statement('export default 42;');
    const resolved = resolveExportDeclaration(exp, noopImporter);

    expect(resolved).toEqual([returnValue]);
    expect(resolveToValue).toBeCalledWith(exp.get('declaration'), noopImporter);
  });

  it('resolves named exports', () => {
    let exp = statement('export var foo = 42, bar = 21;');
    let resolved = resolveExportDeclaration(exp, noopImporter);

    const declarations = exp.get('declaration', 'declarations');
    expect(resolved).toEqual([returnValue, returnValue]);
    expect(resolveToValue).toBeCalledWith(declarations.get(0), noopImporter);
    expect(resolveToValue).toBeCalledWith(declarations.get(1), noopImporter);

    exp = statement('export function foo(){}');
    resolved = resolveExportDeclaration(exp, noopImporter);

    expect(resolved).toEqual([returnValue]);
    expect(resolveToValue).toBeCalledWith(exp.get('declaration'), noopImporter);

    exp = statement('export class Foo {}');
    resolved = resolveExportDeclaration(exp, noopImporter);

    expect(resolved).toEqual([returnValue]);
    expect(resolveToValue).toBeCalledWith(exp.get('declaration'), noopImporter);
  });

  it('resolves named exports', () => {
    const exp = statement('export {foo, bar, baz}; var foo, bar, baz;');
    const resolved = resolveExportDeclaration(exp, noopImporter);

    const specifiers = exp.get('specifiers');
    expect(resolved).toEqual([returnValue, returnValue, returnValue]);
    expect(resolveToValue).toBeCalledWith(
      specifiers.get(0, 'local'),
      noopImporter,
    );
    expect(resolveToValue).toBeCalledWith(
      specifiers.get(1, 'local'),
      noopImporter,
    );
    expect(resolveToValue).toBeCalledWith(
      specifiers.get(2, 'local'),
      noopImporter,
    );
  });
});
