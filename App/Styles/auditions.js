/* @flow */
'use strict';

var React = require('react-native');
var primary = require('./variable').brandPrimary;
var secondary = require('./variable').brandSecondary;

var {
  StyleSheet,
  Dimensions
} = React;

var deviceHeight = Dimensions.get('window').height;
var deviceWidth = Dimensions.get('window').width;

module.exports = StyleSheet.create({
  highlightedFont: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },

  normalFont: {
    fontSize: 16,
    color: '#fff'
  },

  spinnerContainer: {
    position: 'absolute',
    backgroundColor: 'transparent',
    bottom: deviceHeight/2,
    left: deviceWidth/2-25,
  },

  listContainer: {
		flexDirection: 'row'
	},

  separator: {
    height: 1,
    backgroundColor: 'white',
    marginLeft: 10,
    marginRight: 10,
  },

  container: {
    flex: 1,
    flexDirection: 'column',
    padding: 10,
    backgroundColor: 'transparent',
  },

  top: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  left: {
    flex: 2,
    flexDirection: 'column',
  },

  right: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },

  bottom: {
    marginTop: 20,
    padding: 10,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
});
