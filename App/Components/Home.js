/* @flow */
'use strict';

import React, {Component, Text, View, Image, ScrollView, ListView, BackAndroid, TouchableOpacity} from 'react-native';
import styles from '../Styles/style';
import Navbar from './Widgets/Navbar';
import home from '../Styles/home';
import {primary} from '../Styles/variable';
import {secondary} from '../Styles/variable';
import Login from './Login';
import Icon from 'react-native-vector-icons/Ionicons';
import {Actions} from 'react-native-router-flux';
import _ from 'lodash';

export default class Home extends Component {
	constructor(props) {
    super(props);

		const dummyProjects = [
			{
				name: "Batman Returns",
				director: "Brad Richardson",
				roles: ["Batman", "Robin", "Joker"],
				actions: 3
			},
			{
				name: "Forrest Gump",
				director: "Natalie Low",
				roles: ["Forrest Gump", "Jenny Curran", "Mom"],
				actions: 0
			},
			{
				name: "Brian the Great",
				director: "Bill Gates",
				roles: ["Brian Park", "Susan Fox", "Trevar"],
				actions: 2
			}
		];

		var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
		this.state = {
			dataSource: ds.cloneWithRows(dummyProjects)
		}
  }

	render() {
		return(
    	<View style={home.color}>
     		<Navbar
   		    title="Projects"
   		    style={home.toolbar}
					back={false} />
     		<Image source={require('../img/glow2.png')} style={home.container}>
					<ScrollView style={{backgroundColor: 'transparent'}}>
						<View style={styles.verticalCenter}>
							<View style={home.listContainer}>
								<ListView
				          dataSource={this.state.dataSource}
				          renderRow={this._renderRow}
									renderSeparator={this._renderSeperator} />
				 			</View>
			 			</View>
					</ScrollView>
        </Image>
    	</View>
		);
	}

	_renderRow(project) {
		let roles = _.map(project.roles, (role, index) => {
			if (index < 2)
				return <Text key={index} style={home.normalFont}>{role}</Text>
		});

		return(
			<View style={home.projectItem}>
				<View style={home.projectItemLeft}>
					<Text style={home.highlightedFont}>{project.name}</Text>
					<Text style={home.normalFont}>{project.director}</Text>
					<View style={home.projectItemRoles}>
						{roles}
					</View>
				</View>
				<View style={home.projectItemRight}>
					<View style={project.actions > 0 ? home.activeActions : home.inactiveActions}>
						<Text>{project.actions}</Text>
					</View>
					<TouchableOpacity>
						<Icon name="ios-telephone" style={home.projectItemIcon} />
					</TouchableOpacity>
					<TouchableOpacity onPress={Actions.schedule}>
						<Icon name="ios-arrow-forward" style={home.projectItemIcon} />
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	_renderSeperator(sectionID, rowID) {
		return (
      <View key={`${sectionID}-${rowID}`} style={home.separator} />
    )
	}
}