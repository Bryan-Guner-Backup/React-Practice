/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import { namedTypes as t } from 'ast-types';
import getPropType from '../utils/getPropType';
import getPropertyName from '../utils/getPropertyName';
import getMemberValuePath from '../utils/getMemberValuePath';
import isReactModuleName from '../utils/isReactModuleName';
import isRequiredPropType from '../utils/isRequiredPropType';
import printValue from '../utils/printValue';
import resolveToModule from '../utils/resolveToModule';
import resolveToValue from '../utils/resolveToValue';
import type Documentation from '../Documentation';
import type { Importer } from '../types';

function isPropTypesExpression(path, importer) {
  const moduleName = resolveToModule(path, importer);
  if (moduleName) {
    return isReactModuleName(moduleName) || moduleName === 'ReactPropTypes';
  }
  return false;
}

function amendPropTypes(getDescriptor, path, importer) {
  if (!t.ObjectExpression.check(path.node)) {
    return;
  }

  path.get('properties').each(propertyPath => {
    switch (propertyPath.node.type) {
      case t.Property.name: {
        const propName = getPropertyName(propertyPath, importer);
        if (!propName) return;

        const propDescriptor = getDescriptor(propName);
        const valuePath = resolveToValue(propertyPath.get('value'), importer);
        const type = isPropTypesExpression(valuePath, importer)
          ? getPropType(valuePath, importer)
          : { name: 'custom', raw: printValue(valuePath) };

        if (type) {
          propDescriptor.type = type;
          propDescriptor.required =
            type.name !== 'custom' && isRequiredPropType(valuePath);
        }
        break;
      }
      case t.SpreadElement.name: {
        const resolvedValuePath = resolveToValue(
          propertyPath.get('argument'),
          importer,
        );
        switch (resolvedValuePath.node.type) {
          case t.ObjectExpression.name: // normal object literal
            amendPropTypes(getDescriptor, resolvedValuePath, importer);
            break;
        }
        break;
      }
    }
  });
}

function getPropTypeHandler(propName: string) {
  return function (
    documentation: Documentation,
    path: NodePath,
    importer: Importer,
  ) {
    let propTypesPath = getMemberValuePath(path, propName, importer);
    if (!propTypesPath) {
      return;
    }
    propTypesPath = resolveToValue(propTypesPath, importer);
    if (!propTypesPath) {
      return;
    }
    let getDescriptor;
    switch (propName) {
      case 'childContextTypes':
        getDescriptor = documentation.getChildContextDescriptor;
        break;
      case 'contextTypes':
        getDescriptor = documentation.getContextDescriptor;
        break;
      default:
        getDescriptor = documentation.getPropDescriptor;
    }
    amendPropTypes(getDescriptor.bind(documentation), propTypesPath, importer);
  };
}

export const propTypeHandler = getPropTypeHandler('propTypes');
export const contextTypeHandler = getPropTypeHandler('contextTypes');
export const childContextTypeHandler = getPropTypeHandler('childContextTypes');
