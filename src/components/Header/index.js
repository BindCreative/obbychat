import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity } from 'react-native';
import { View, Text } from 'native-base';
import ArrowLeftIcon from './../../assets/images/icon-arrow-left.svg';
import styles from './styles';


class Header extends React.Component {
  
  render() {
    const title = this.props.scene ? this.props.scene.descriptor.options.title : '';
    return (
      <View style={this.props.size === 'compact' ? styles.headerCompact : styles.headerNormal }>
        <View style={styles.headerLeft}>
          {this.props.hasBackButton === true &&
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => this.props.navigation.pop()}
            >
              <ArrowLeftIcon color='#000000' height={24} width={24} />
            </TouchableOpacity>
          }
          {this.props.left !== undefined && this.props.left}
          {this.props.left === undefined && this.props.titlePosition === 'left' &&
            <Text style={styles.headerTitle}>{title}</Text>
          }
        </View>
        <View style={styles.headerCenter}>
          {this.props.center !== undefined && this.props.center}
          {this.props.center === undefined && this.props.titlePosition === 'center' &&
            <Text style={{ ...styles.headerTitle, ...styles.headerTitleSmall }} > {title}</Text>
          }
        </View>
        <View style={styles.headerRight}>
          {this.props.right !== undefined && this.props.right}
          {this.props.right === undefined && this.props.titlePosition === 'right' &&
            <Text style={styles.headerTitle}>{title}</Text>
          }
        </View>
      </View>
    );
  }
}

Header.defaultProps = {
  hasBackButton: false,
  size: 'normal', // normal | compact
  titlePosition: 'left',
};

Header.propTypes = {
  left: PropTypes.element,
  center: PropTypes.element,
  right: PropTypes.element,
  hasBackButton: PropTypes.bool,
  titlePosition: PropTypes.string.isRequired,
  size: PropTypes.string.isRequired,
};

export default Header;