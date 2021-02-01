/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { Component } from 'react';

type BaseProps = {
  /** Optional prop */
  foo?: string,
  /** Required prop */
  bar: number
};

type TransitionDuration = number | { enter?: number, exit?: number } | 'auto';

type Props = BaseProps & {
  /** Complex union prop */
  baz: TransitionDuration
}

/**
 * This is a typescript class component
 */
export default class TSComponent extends Component<Props> {
  render() {
    return <h1>Hello world</h1>;
  }
}
