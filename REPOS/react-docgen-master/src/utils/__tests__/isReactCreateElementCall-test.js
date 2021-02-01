/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  parse,
  statement,
  noopImporter,
  makeMockImporter,
} from '../../../tests/utils';
import isReactCreateElementCall from '../isReactCreateElementCall';

describe('isReactCreateElementCall', () => {
  function parsePath(src) {
    const root = parse(src);
    return root.get('body', root.node.body.length - 1, 'expression');
  }

  const mockImporter = makeMockImporter({
    foo: statement(`
      export default React.createElement;
      import React from 'react';
    `).get('declaration'),
  });

  describe('built in React.createElement', () => {
    it('accepts createElement called on React', () => {
      const def = parsePath(`
        var React = require("React");
        React.createElement({
          render() {}
        });
      `);
      expect(isReactCreateElementCall(def, noopImporter)).toBe(true);
    });

    it('accepts createElement called on aliased React', () => {
      const def = parsePath(`
        var other = require("React");
        other.createElement({
          render() {}
        });
      `);
      expect(isReactCreateElementCall(def, noopImporter)).toBe(true);
    });

    it('ignores other React calls', () => {
      const def = parsePath(`
        var React = require("React");
        React.isValidElement({});
      `);
      expect(isReactCreateElementCall(def, noopImporter)).toBe(false);
    });

    it('ignores non React calls to createElement', () => {
      const def = parsePath(`
        var React = require("bob");
        React.createElement({
          render() {}
        });
      `);
      expect(isReactCreateElementCall(def, noopImporter)).toBe(false);
    });

    it('accepts createElement called on destructed value', () => {
      const def = parsePath(`
        var { createElement } = require("react");
        createElement({});
      `);
      expect(isReactCreateElementCall(def, noopImporter)).toBe(true);
    });

    it('accepts createElement called on destructed aliased value', () => {
      const def = parsePath(`
        var { createElement: foo } = require("react");
        foo({});
      `);
      expect(isReactCreateElementCall(def, noopImporter)).toBe(true);
    });

    it('accepts createElement called on imported value', () => {
      const def = parsePath(`
        import { createElement } from "react";
        createElement({});
      `);
      expect(isReactCreateElementCall(def, noopImporter)).toBe(true);
    });

    it('accepts createElement called on imported aliased value', () => {
      const def = parsePath(`
        import { createElement as foo } from "react";
        foo({});
      `);
      expect(isReactCreateElementCall(def, noopImporter)).toBe(true);
    });

    it('can resolve createElement imported from an intermediate module', () => {
      const def = parsePath(`
        import foo from "foo";
        foo({});
      `);
      expect(isReactCreateElementCall(def, mockImporter)).toBe(true);
    });
  });
});
