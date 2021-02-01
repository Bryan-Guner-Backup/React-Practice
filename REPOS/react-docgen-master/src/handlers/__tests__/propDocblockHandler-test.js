/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

jest.mock('../../Documentation');

import {
  expression,
  statement,
  noopImporter,
  makeMockImporter,
} from '../../../tests/utils';

describe('propDocBlockHandler', () => {
  let documentation;
  let propDocBlockHandler;

  beforeEach(() => {
    documentation = new (require('../../Documentation'))();
    propDocBlockHandler = require('../propDocBlockHandler').default;
  });

  const mockImporter = makeMockImporter({
    props: statement(`
      export default {
        /**
          * A comment on imported props
          */
        foo: Prop.bool,
      };
    `).get('declaration'),
  });

  function test(getSrc, parse) {
    it('finds docblocks for prop types', () => {
      const definition = parse(
        getSrc(
          `{
          /**
           * Foo comment
           */
          foo: Prop.bool,
          /**
           * Bar comment
           */
          bar: Prop.bool,
        }`,
        ),
      );

      propDocBlockHandler(documentation, definition, noopImporter);
      expect(documentation.descriptors).toEqual({
        foo: {
          description: 'Foo comment',
        },
        bar: {
          description: 'Bar comment',
        },
      });
    });

    it('can handle multline comments', () => {
      const definition = parse(
        getSrc(
          `{
          /**
           * Foo comment with
           * many lines!
           *
           * even with empty lines in between
           */
          foo: Prop.bool,
        }`,
        ),
      );

      propDocBlockHandler(documentation, definition, noopImporter);
      expect(documentation.descriptors).toEqual({
        foo: {
          description:
            'Foo comment with\nmany lines!\n\neven with empty lines in between',
        },
      });
    });

    it('ignores non-docblock comments', () => {
      const definition = parse(
        getSrc(
          `{
          /**
           * Foo comment
           */
          // TODO: remove this comment
          foo: Prop.bool,
          /**
           * Bar comment
           */
          /* This is not a doc comment */
          bar: Prop.bool,
        }`,
        ),
      );

      propDocBlockHandler(documentation, definition, noopImporter);
      expect(documentation.descriptors).toEqual({
        foo: {
          description: 'Foo comment',
        },
        bar: {
          description: 'Bar comment',
        },
      });
    });

    it('only considers the comment with the property below it', () => {
      const definition = parse(
        getSrc(
          `{
          /**
           * Foo comment
           */
          foo: Prop.bool,
          bar: Prop.bool,
        }`,
        ),
      );

      propDocBlockHandler(documentation, definition, noopImporter);
      expect(documentation.descriptors).toEqual({
        foo: {
          description: 'Foo comment',
        },
        bar: {
          description: '',
        },
      });
    });

    it('understands and ignores the spread operator', () => {
      const definition = parse(
        getSrc(
          `{
          ...Bar.propTypes,
          /**
           * Foo comment
           */
          foo: Prop.bool,
        }`,
        ),
      );

      propDocBlockHandler(documentation, definition, noopImporter);
      expect(documentation.descriptors).toEqual({
        foo: {
          description: 'Foo comment',
        },
      });
    });

    it('resolves variables', () => {
      const definition = parse(`
        ${getSrc('Props')}
        var Props = {
          /**
           * Foo comment
           */
          foo: Prop.bool,
        };
      `);

      propDocBlockHandler(documentation, definition, noopImporter);
      expect(documentation.descriptors).toEqual({
        foo: {
          description: 'Foo comment',
        },
      });
    });

    it('resolves imported variables', () => {
      const definition = parse(`
        ${getSrc('Props')}
        import Props from 'props';
      `);

      propDocBlockHandler(documentation, definition, mockImporter);
      expect(documentation.descriptors).toEqual({
        foo: {
          description: 'A comment on imported props',
        },
      });
    });

    it('resolves imported variables that are spread', () => {
      const definition = parse(`
        ${getSrc('Props')}
        import ExtraProps from 'props';
        var Props = {
          ...ExtraProps,
          /**
           * Bar comment
           */
          bar: Prop.bool,
        }
      `);

      propDocBlockHandler(documentation, definition, mockImporter);
      expect(documentation.descriptors).toEqual({
        foo: {
          description: 'A comment on imported props',
        },
        bar: {
          description: 'Bar comment',
        },
      });
    });
  }

  describe('React.createClass', () => {
    test(
      propTypesSrc => `({propTypes: ${propTypesSrc}})`,
      src => statement(src).get('expression'),
    );
  });

  describe('ClassDefinition', () => {
    describe('class property', () => {
      test(
        propTypesSrc => `
          class Foo{
            static propTypes = ${propTypesSrc};
          }
        `,
        src => statement(src),
      );
    });

    describe('static getter', () => {
      test(
        propTypesSrc => `
          class Foo{
            static get propTypes() {
              return ${propTypesSrc};
            }
          }
        `,
        src => statement(src),
      );
    });
  });

  it('does not error if propTypes cannot be found', () => {
    let definition = expression('{fooBar: 42}');
    expect(() =>
      propDocBlockHandler(documentation, definition, noopImporter),
    ).not.toThrow();

    definition = statement('class Foo {}');
    expect(() =>
      propDocBlockHandler(documentation, definition, noopImporter),
    ).not.toThrow();
  });
});
