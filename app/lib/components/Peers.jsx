import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import * as appPropTypes from './appPropTypes';
import { Appear } from './transitions';
import Peer from './Peer';
import ResizeObserver from 'resize-observer-polyfill';

const RATIO = 1.334;

class Peers extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			peerWidth  : 400,
			peerHeight : 300
		};
	}

	updateDimensions = () =>
	{
		const n = this.props.boxes;

		if (n === 0)
		{
			return;
		}

		const width = this.refs.peers.clientWidth;
		const height = this.refs.peers.clientHeight;

		let x, y, space;

		for (let rows = 1; rows < 100; rows = rows + 1)
		{
			x = width / Math.ceil(n / rows);
			y = x / RATIO;
			if (height < (y * rows))
			{
				y = height / rows;
				x = RATIO * y;
				break;
			}
			space = height - (y * (rows));
			if (space < y)
			{
				break;
			}
		}
		if (Math.ceil(this.state.peerWidth) !== Math.ceil(0.9 * x))
		{
			this.setState({
				peerWidth  : 0.9 * x,
				peerHeight : 0.9 * y
			});
		}
	};

	componentDidMount()
	{
		window.addEventListener('resize', this.updateDimensions);
		const observer = new ResizeObserver(this.updateDimensions);

		observer.observe(this.refs.peers);
	}

	componentWillUnmount()
	{
		window.removeEventListener('resize', this.updateDimensions);
	}

	componentDidUpdate()
	{
		this.updateDimensions();
	}

	render()
	{
		const {
			advancedMode,
			activeSpeakerName,
			peers,
			toolAreaOpen
		} = this.props;

		const style =
		{
			'width'  : this.state.peerWidth,
			'height' : this.state.peerHeight
		};

		return (
			<div data-component='Peers' ref='peers'>
				{
					peers.map((peer) =>
					{
						return (
							<Appear key={peer.name} duration={1000}>
								<div
									className={classnames('peer-container', {
										'active-speaker' : peer.name === activeSpeakerName
									})}
								>
									<Peer
										advancedMode={advancedMode}
										name={peer.name}
										style={style}
										toolAreaOpen={toolAreaOpen}
									/>
								</div>
							</Appear>
						);
					})
				}
			</div>
		);
	}
}

Peers.propTypes =
	{
		advancedMode      : PropTypes.bool,
		peers             : PropTypes.arrayOf(appPropTypes.Peer).isRequired,
		boxes             : PropTypes.number,
		activeSpeakerName : PropTypes.string,
		toolAreaOpen      : PropTypes.bool
	};

const mapStateToProps = (state) =>
{
	const peers = Object.values(state.peers);

	const boxes = peers.length + Object.values(state.consumers)
		.filter((consumer) => consumer.source === 'screen').length;

	return {
		peers,
		boxes,
		activeSpeakerName : state.room.activeSpeakerName,
		toolAreaOpen      : state.toolarea.toolAreaOpen
	};
};

const PeersContainer = connect(
	mapStateToProps
)(Peers);

export default PeersContainer;
