import {SuperCustomButton} from './component_37';
import PropTypes from 'prop-types';

export function SuperDuperCustomButton({color, ...otherProps}) {
  return <SuperCustomButton {...otherProps} style={{color}} />;
}

SuperDuperCustomButton.propTypes = SuperCustomButton.propTypes;
