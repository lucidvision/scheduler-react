/* @flow */
'use strict';

import React, { Component, ScrollView, Text, View, Image, ListView, TouchableOpacity, Alert, RefreshControl, Linking } from 'react-native';
import styles from '../Styles/style';
import Navbar from './Widgets/Navbar';
import schedule from '../Styles/schedule';
import ButtonRounded from './Widgets/ButtonRounded';
import {brandPrimary as primary} from '../Styles/variable';
import Icon from 'react-native-vector-icons/Ionicons';
import {Actions} from 'react-native-router-flux';
import ActionSheet from '@remobile/react-native-action-sheet';
import Spinner from 'react-native-spinkit';
import _ from 'lodash';
import { getAuditions, putAuditions } from '../Network/Api';

class Schedule extends Component {
	constructor(props) {
		super(props);

		const dummyAuditions = [
			// {
			// 	id: 1,
			// 	actor: "Brad Pitt",
			// 	phone: "7777777",
			// 	role: "Batman",
			// 	date: "Monday Apr 25",
			// 	time: "3:30pm",
			// 	status: "",
			// 	casting: "",
			// 	selected: false
			// },
			// {
			// 	id: 2,
			// 	actor: "Christian Bale",
			// 	phone: "7777777",
			// 	role: "Batman",
			// 	date: "Monday Apr 25",
			// 	time: "3:50pm",
			// 	status: "",
			// 	casting: "",
			// 	selected: false
			// },
			// {
			// 	id: 3,
			// 	actor: "Ben Affleck",
			// 	phone: "7777777",
			// 	role: "Batman",
			// 	date: "Monday Apr 25",
			// 	time: "4:10pm",
			// 	status: "",
			// 	casting: "",
			// 	selected: false
			// }
		]

		var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
		this.state = {
			dataSource: ds.cloneWithRows(dummyAuditions),
			auditions: dummyAuditions,
			forwardActorCount: 0,
			forwardCastingCount: 0,
      selected: [],
      show: false,
			isLoading: false,
			refreshing: false,
		}
	}

	componentDidMount() {
		if (this.props.message)
			Alert.alert(this.props.message);

		this.populateAuditionList();
	}

	render() {
		return(
			<View style={styles.color}>
				<Navbar
					title="Schedule"
					style={styles.toolbar}
					back={true} />
				<Image source={require('../img/glow2.png')} style={styles.container}>
   		    <ScrollView
						style={{backgroundColor: 'transparent'}}
						refreshControl={
							<RefreshControl
								refreshing={this.state.refreshing}
								onRefresh={this._onRefresh.bind(this)} />
						}>
						<View style={styles.verticalCenter}>
							<View style={schedule.listContainer}>
								<ListView
									dataSource={this.state.dataSource}
									renderHeader={this._renderHeader.bind(this)}
									renderRow={this._renderRow.bind(this)}
									renderSeparator={this._renderSeperator} />
							</View>
						</View>
   		    </ScrollView>
					<View style={schedule.footer}>
						<ButtonRounded text="Actions" onPress={this.onOpen.bind(this)} />
					</View>
					<ActionSheet
	          visible={this.state.show}
	          onCancel={this.onCancel.bind(this)}>
	          <ActionSheet.Button onPress={() => this.onAction("SENT")}>Send to {this.state.selected.length} Actor(s)</ActionSheet.Button>
						<ActionSheet.Button onPress={() => this.onAction("SENT+")}>Send to {this.state.selected.length} Actor(s) + Materials</ActionSheet.Button>
	          <ActionSheet.Button onPress={() => this.onAction("CONF")}>Confirm {this.state.selected.length}</ActionSheet.Button>
						<ActionSheet.Button onPress={() => this.onAction("REGR")}>Regret {this.state.selected.length}</ActionSheet.Button>
						<ActionSheet.Button onPress={() => this.onAction("TIME")}>Request {this.state.selected.length} New Time(s)</ActionSheet.Button>
						<ActionSheet.Button onPress={() => this.onAction("CAST")}>Forward {this.state.selected.length} to Casting</ActionSheet.Button>
						{this.generateActionButtons()}
	        </ActionSheet>
					<View style={schedule.spinnerContainer}>
						<Spinner
							isVisible={this.state.isLoading}
							color={'#ffffff'}
							size={50}
							type={'Wave'} />
					</View>
				</Image>
			</View>
		);
	}

	_renderHeader() {
		return (
      <View style={schedule.headerContainer}>
        <Text style={schedule.header}>{this.props.project.title}</Text>
				<View style={schedule.notificationsContainer}>
					{this.generateActorNotification()}
					{this.generateCastingNotification()}
				</View>
      </View>
    )
	}

	_renderRow(audition) {
		return(
			<TouchableOpacity onPress={() => this.onItemSelected(audition.id)}>
				<View style={audition.selected ? schedule.auditionItemSelected : schedule.auditionItem}>
	        <View style={schedule.auditionItemLeft}>
            <Text style={schedule.highlightedFont}>{audition.actor}</Text>
            <Text style={schedule.normalFont}>{audition.role}</Text>
						<View style={schedule.date}>
							<Text style={schedule.normalFont}>{audition.date}</Text>
							<Text style={schedule.normalFont}>{audition.time}</Text>
						</View>
	        </View>
	        <View style={schedule.auditionItemRight}>
						<View style={schedule.statusContainer}>
							{this.generateStatus(audition)}
						</View>
						<TouchableOpacity onPress={() => this.onAuditionPressed(audition.id)}>
							<View style={schedule.auditionItemIconContainer}>
								<Icon name="ios-arrow-forward" style={schedule.auditionItemIcon} />
							</View>
						</TouchableOpacity>
					</View>
	      </View>
			</TouchableOpacity>
		)
	}

	_renderSeperator(sectionID, rowID) {
		return (
      <View key={`${sectionID}-${rowID}`} style={schedule.separator} />
    )
	}

	_onRefresh() {
		console.log("Refresh Triggered")
		this.setState({refreshing: true});
		this.populateAuditionList();
	}

	generateActionButtons() {
		let buttons;
		if(this.state.selected.length == 1)
			buttons = [
				<ActionSheet.Button key="call-actor" onPress={() => this.onAction("CALL")}>Call Selected Actor</ActionSheet.Button>,
				<ActionSheet.Button key="message-actor" onPress={() => this.onMessages()}>Message Selected Actor</ActionSheet.Button>,
			]
		return buttons;
	}

	generateStatus(audition) {
		let statusElement;
		if(audition.casting == 'confirm') {
			statusElement = <Icon name='checkmark' style={[schedule.auditionItemIcon, {color: '#00AD63'}]} />
		} else if(audition.casting == 'regret') {
			statusElement = <Icon name='close' style={[schedule.auditionItemIcon, {color: '#E9556A'}]} />
		} else if(audition.casting == 'time') {
			statusElement = <Icon name='clock' style={[schedule.auditionItemIcon, {color: '#00B5EF'}]} />
		} else {
			if (audition.status == 'SENT')
				statusElement = <Text style={[schedule.highlightedFont, {color: '#00B5EF'}]}>{audition.status}</Text>
			else if (audition.status == 'CONF')
				statusElement = <Text style={[schedule.highlightedFont, {color: '#00AD63'}]}>{audition.status}</Text>
			else
				statusElement = <Text style={[schedule.highlightedFont, {color: '#E9556A'}]}>{audition.status}</Text>
		}

		return statusElement;
	}

	generateActorNotification() {
		let countText;
		if (this.state.forwardActorCount > 1)
			countText = `${this.state.forwardActorCount} need to be sent to Actors`;
		else
			countText = `${this.state.forwardActorCount} needs to be sent to Actor`;

		if (this.state.forwardActorCount > 0) {
			return <View style={schedule.notification}>
							 <Icon name="android-alert" style={schedule.notificationIcon} />
							 <Text style={schedule.notificationFont}>{countText}</Text>
						 </View>
		}
	}

	generateCastingNotification() {
		let countText;
		if (this.state.forwardCastingCount > 1)
			countText = `${this.state.forwardCastingCount} need`;
		else
			countText = `${this.state.forwardCastingCount} needs`;

		if (this.state.forwardCastingCount > 0) {
			return <View style={schedule.notification}>
							 <Icon name="android-alert" style={schedule.notificationIcon} />
							 <Text style={schedule.notificationFont}>{this.state.forwardCastingCount} to be forwarded to Casting</Text>
						 </View>
		}
	}

	onItemSelected(id) {
		let selected;
		if (_.includes(this.state.selected, id))
			selected = _.without(this.state.selected, id);
		else
			selected = _.concat(this.state.selected, id);

    const auditions = _.map(_.cloneDeep(this.state.auditions), (audition) => {
      if (audition.id == id && audition.selected == false) {
        audition.selected = true;
      } else if (audition.id == id && audition.selected == true) {
        audition.selected = false;
      }

      return audition;
    });

    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(auditions),
      auditions,
			selected
    });
	}

	onAuditionPressed(id) {
		this.props.auditionActions.setAudition(_.find(this.state.auditions, { 'id': id }));

		Actions.history();
	}

	onCancel() {
    this.setState({show: false});
  }

  onOpen() {
		if(this.state.selected.length < 1)
			Alert.alert("Please select auditions");
		else
    	this.setState({show: true});
  }

	sendMessageAlert(id) {
		this.setState({show: false});

		Alert.alert(
			'Send Message',
      'Would you like to attach a message to this action?',
      [
        {text: 'Yes', onPress: () => Actions.notes({audition: {id}})},
				{text: 'No', onPress: () => Alert.alert('Action Sent')},
      ]
		)
	}

	onAction(status) {
		this.setState({show: false});
		this.updateStatus(status);

		if ((status != 'CALL') && this.state.selected.length == 1)
			this.sendMessageAlert(this.state.selected[0]);
	}

	onMessages() {
		this.setState({show: false});
    Actions.notes({audition: {id: this.state.selected[0]}});
  }

	async populateAuditionList() {
		let endpoint = `auditions?project_id=${this.props.project.id}`;
		let auditionListData;
		this.setState({isLoading: true});
		try {
			auditionListData = await getAuditions(endpoint, this.props.user.authToken);
		} catch(error) {
			console.error(error);
		}

		let forwardActorCount = 0;
		let forwardCastingCount = 0;
		let auditions = _.map(auditionListData, (audition, index) => {
			if (_.isEmpty(audition.status)) forwardActorCount++;
			if ((audition.status == 'CONF' || audition.status == 'REGR' || audition.status == 'TIME') && _.isEmpty(audition.response))
				forwardCastingCount++;

			let object = {
				id: audition.id,
				actor: audition.actor,
				phone: audition.phone,
				role: audition.role,
				date: audition.date,
				time: audition.time,
				status: audition.status,
				casting: audition.response,
				selected: false
			}

			return object;
		});

		this.setState({
			dataSource: this.state.dataSource.cloneWithRows(auditions),
      auditions,
			forwardActorCount,
			forwardCastingCount,
			isLoading: false,
			refreshing: false,
		});
	}

	async updateStatus(status) {
		let data = {
			project_id: this.props.project.id,
			"selected[]": this.state.selected.toString(),
			status,
		};

		let endpoint = `auditions/update_status`;
		let auditionListData;
		this.setState({isLoading: true});
		try {
			auditionListData = await putAuditions(endpoint, this.props.user.authToken, data);
		} catch(error) {
			console.error(error);
		}

		let forwardActorCount = 0;
		let forwardCastingCount = 0;
		let auditions = _.map(auditionListData, (audition) => {
			if (_.isEmpty(audition.status)) forwardActorCount++;
			if ((audition.status == 'CONF' || audition.status == 'REGR' || audition.status == 'TIME') && _.isEmpty(audition.response))
				forwardCastingCount++;
			let object = {
				id: audition.id,
				actor: audition.actor,
				phone: audition.phone,
				role: audition.role,
				date: audition.date,
				time: audition.time,
				status: audition.status,
				casting: audition.response,
				selected: false
			}
			return object;
		});

		if (status == 'CALL')
				Linking.openURL(`tel:${_.find(this.state.auditions, { 'id': this.state.selected[0] }).phone}`);

		this.setState({
			dataSource: this.state.dataSource.cloneWithRows(auditions),
      auditions,
			forwardActorCount,
			forwardCastingCount,
			selected: [],
			isLoading: false,
		});
	}
}

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
const AuditionActions = require('../Redux/Actions/audition');

function mapStateToProps(state) {
	return {
		user: state.user,
		project: state.project
	}
}

function mapDispatchToProps(dispatch) {
	return {
		auditionActions: bindActionCreators(AuditionActions, dispatch)
	}
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(Schedule);
