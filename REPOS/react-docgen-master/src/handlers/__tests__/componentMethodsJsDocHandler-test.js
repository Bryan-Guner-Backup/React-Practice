/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Documentation from '../../Documentation';
import componentMethodsJsDocHandler from '../componentMethodsJsDocHandler';

describe('componentMethodsJsDocHandler', () => {
  let documentation;

  beforeEach(() => {
    documentation = new Documentation();
  });

  it('stays the same when no docblock is present', () => {
    const methods = [
      {
        name: 'foo',
        docblock: null,
        modifiers: [],
        returns: null,
        params: [
          {
            name: 'test',
            type: null,
          },
        ],
      },
    ];
    documentation.set('methods', methods);
    componentMethodsJsDocHandler(documentation, null);
    expect(documentation.get('methods')).toEqual(methods);
  });

  it('adds js doc types when no flow types', () => {
    documentation.set('methods', [
      {
        name: 'foo',
        docblock: `
        @param {string} test
        @returns {string}
      `,
        modifiers: [],
        returns: null,
        params: [
          {
            name: 'test',
            type: null,
          },
        ],
      },
    ]);
    componentMethodsJsDocHandler(documentation, null);
    expect(documentation.get('methods')).toEqual([
      {
        name: 'foo',
        description: null,
        docblock: `
        @param {string} test
        @returns {string}
      `,
        modifiers: [],
        returns: {
          type: { name: 'string' },
          description: null,
        },
        params: [
          {
            name: 'test',
            description: null,
            optional: false,
            type: { name: 'string' },
          },
        ],
      },
    ]);
  });

  it('keeps flow types over js doc types', () => {
    documentation.set('methods', [
      {
        name: 'foo',
        docblock: `
        @param {string} test
        @returns {string}
      `,
        modifiers: [],
        returns: {
          type: { name: 'number' },
        },
        params: [
          {
            name: 'test',
            type: { name: 'number' },
          },
        ],
      },
    ]);
    componentMethodsJsDocHandler(documentation, null);
    expect(documentation.get('methods')).toEqual([
      {
        name: 'foo',
        description: null,
        docblock: `
        @param {string} test
        @returns {string}
      `,
        modifiers: [],
        returns: {
          type: { name: 'number' },
          description: null,
        },
        params: [
          {
            name: 'test',
            description: null,
            optional: false,
            type: { name: 'number' },
          },
        ],
      },
    ]);
  });

  it('adds descriptions', () => {
    documentation.set('methods', [
      {
        name: 'foo',
        docblock: `
        The foo method.
        @param test The test
        @returns The number
      `,
        modifiers: [],
        returns: null,
        params: [
          {
            name: 'test',
            type: null,
          },
        ],
      },
    ]);
    componentMethodsJsDocHandler(documentation, null);
    expect(documentation.get('methods')).toEqual([
      {
        name: 'foo',
        description: 'The foo method.',
        docblock: `
        The foo method.
        @param test The test
        @returns The number
      `,
        modifiers: [],
        returns: {
          description: 'The number',
          type: null,
        },
        params: [
          {
            name: 'test',
            description: 'The test',
            optional: false,
            type: null,
          },
        ],
      },
    ]);
  });
});
