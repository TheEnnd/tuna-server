import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import playlistHelper from './../playlist/playlistHelper'
import ajax from './../ajax/asyncAjax'
import { View as Button } from './../glu_button/index'
import appSettings from './../appSettings/appSettings'
import { playListSetAll } from './../actions/actions'
import { Link } from 'react-router-dom'

class View extends React.Component {
    
    constructor(props) {
        super(props)

        this.state = {
            isBusyCreating : false
        }
    }

    async createPlaylist(){
        const playlist = playlistHelper.createNew()

        this.setState({
            isBusyCreating : true
        })

        const result = await ajax.post(`${appSettings.serverUrl}/v1/playlists`, playlist)
        playListSetAll(result.payload.playlists)
        this.setState({
            isBusyCreating : false
        })
    }

    render(){
        return (
            <div className="playlists">
                <h1>Playlists</h1>

                {
                    this.props.playlists &&
                        <ul className="playlists-list">
                            {
                                this.props.playlists.map(function(playlist, index){
                                    return(<li className="playlists-listItem" key={index}>
                                        <div className="playlists-listItemContent">
                                            <Link to={`playlist/${playlist.id}`}>{playlist.name}{playlist.songs.length ? ` (${playlist.songs.length})` : ''} </Link>
                                        </div>
                                    </li>)
                                })
                            }
                        </ul>
                }

                {
                    !this.props.playlists &&
                    <Fragment>
                        You haven't created any playlists yet
                    </Fragment>
                }

                <Button 
                    onClick={this.createPlaylist.bind(this)} 
                    disabledText="contacting server" 
                    text="New playlist" 
                    isDisabled={this.state.isBusyCreating} />

            </div>
        )
    }
}

export default connect(
    (state)=>{
        return {
            playlists : state.session.playlists ? state.session.playlists : []
        }
    }
)(View)