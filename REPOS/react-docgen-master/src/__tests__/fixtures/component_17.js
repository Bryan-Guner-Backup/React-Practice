/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Testing descriptions of shape and oneOfType values
 */

import React from 'react';
import PropTypes from 'prop-types';

export default function Foo(props) {
  return <div />;
}

Foo.propTypes = {
  shapeProp: PropTypes.shape({
    /** Comment for property a */
    a: PropTypes.string,
    b: PropTypes.number
  }),
  exactProp: PropTypes.exact({
    /** Comment for property c */
    c: PropTypes.string,
    d: PropTypes.number
  }),
  oneOfTypeProp: PropTypes.oneOfType([
    /** Comment for type string */
    PropTypes.string,
    PropTypes.number
  ])
};
