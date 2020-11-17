import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, View, Text } from 'react-native';
import ArrowLeftIcon from './../../assets/images/icon-arrow-left.svg';
import styles from './styles';
import { colors } from '../../constants';

const Header = ({
  title,
  titlePosition,
  left,
  right,
  center,
  navigation,
  size,
  hasBackButton,
  backRoute,
  hasBorder,
}) => {
  const headerBorderStyle = hasBorder ? styles.headerBordered : {};
  const hasCenter = center !== undefined || titlePosition === 'center';

  if (size === 'compact') {
    return (
      <View style={{ ...styles.headerContainer, ...headerBorderStyle }}>
        <View style={styles.headerLeft}>
          {hasBackButton === true && (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() =>
                backRoute ? navigation.navigate(backRoute) : navigation.pop()
              }
            >
              <ArrowLeftIcon color={colors.black} height={18} width={18} />
            </TouchableOpacity>
          )}
          {left !== undefined && left}
          {left === undefined && titlePosition === 'left' && (
            <Text
              numberOfLines={1}
              style={{ ...styles.headerTitle, ...styles.headerTitleSmall }}
            >
              {title}
            </Text>
          )}
        </View>

        {hasCenter && (
          <View style={styles.headerCenter}>
            {center !== undefined && center}
            {center === undefined && titlePosition === 'center' && (
              <Text
                numberOfLines={1}
                style={{ ...styles.headerTitle, ...styles.headerTitleSmall }}
              >
                {title}
              </Text>
            )}
          </View>
        )}

        <View style={styles.headerRight}>
          {right !== undefined && right}
          {right === undefined && titlePosition === 'right' && (
            <Text
              numberOfLines={1}
              style={{ ...styles.headerTitle, ...styles.headerTitleSmall }}
            >
              {title}
            </Text>
          )}
        </View>
      </View>
    );
  } else if (size === 'normal') {
    return (
      <View style={{ ...styles.headerContainer, ...headerBorderStyle }}>
        <View style={styles.headerLeft}>
          {hasBackButton === true && (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.pop()}
            >
              <ArrowLeftIcon color={colors.black} height={18} width={18} />
            </TouchableOpacity>
          )}
          {left !== undefined && left}
          {left === undefined && titlePosition === 'left' && (
            <Text numberOfLines={1} style={{ ...styles.headerTitle }}>
              {title}
            </Text>
          )}
        </View>

        {hasCenter && (
          <View style={styles.headerCenter}>
            {center !== undefined && center}
            {center === undefined && titlePosition === 'center' && (
              <Text numberOfLines={1} style={{ ...styles.headerTitle }}>
                {title}
              </Text>
            )}
          </View>
        )}

        <View style={styles.headerRight}>
          {right !== undefined && right}
          {right === undefined && titlePosition === 'right' && (
            <Text numberOfLines={1} style={styles.headerTitle}>
              {title}
            </Text>
          )}
        </View>
      </View>
    );
  }
};

Header.defaultProps = {
  hasBackButton: false,
  hasBorder: false,
  size: 'normal', // normal | compact
  titlePosition: 'left',
};

Header.propTypes = {
  left: PropTypes.element,
  center: PropTypes.element,
  right: PropTypes.element,
  hasBackButton: PropTypes.bool,
  hasBorder: PropTypes.bool,
  titlePosition: PropTypes.string.isRequired,
  size: PropTypes.string.isRequired,
};

export default Header;
