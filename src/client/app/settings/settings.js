import React from 'react'
import { connect } from 'react-redux'
import ajax from './../ajax/asyncAjax'
import appSettings from './../appSettings/appSettings'
import { playStop, clearSession , removeLastfm, sessionSet, } from './../actions/actions'
import { Link } from 'react-router-dom'
import { View as Button } from './../glu_button/index'
import { View as GluSlidingCheckbox } from './../glu_slidingCheckbox/index'
import { Label, Divider, Row, Description } from './../form/form'
import { View as GluConfirmModal } from './../glu_confirmModal/index'
import history from './../history/history'
import store from './../store/store'

class View extends React.Component {

    constructor(props){

        super(props)

        this.state = {
            startDelete : false,
            showConfirmDropboxConnect : false,
            showConfirmDropboxDisconnect : false,
            showConfirmLastfmConnect : false,
            showConfirmLastfmDisconnect : false,
            showDeleteAccountConfirm : false,
            showEmailChangeCancelPrompt : false
        }
    }

    async logout(){
        if (!confirm('Are you sure you want to log out?'))
            return

        // need to clear everything !
        playStop()
        clearSession()
        history.push('/')
    }

    changeScrobbling(willEnable){
        if (willEnable)
            this.setState({ showConfirmLastfmConnect : true })
        else
            this.setState({ showConfirmLastfmDisconnect : true})

        return false
    }

    cancelEmailChange(){
        this.setState({ showEmailChangeCancelPrompt : true })
    }

    onEmailChangeCancelAcceptReject(){
        this.setState({ showEmailChangeCancelPrompt : false })
    }

    onLastFmConnectAccept(){
        window.location = '/v1/oauth/lastfm/start'
    }

    onLastFmConnectReject(){
        this.setState({ showConfirmLastfmConnect : false })
    }

    onLastFmDisconnectReject(){
        this.setState({ showConfirmLastfmDisconnect : false })
    }

    async onLastFmDisconnectAccept(){
        const response = await ajax.authGet(`${appSettings.serverUrl}/v1/lastfm/delete`)
        this.setState({ showConfirmLastfmDisconnect : false })
        if (!response.code)
            return removeLastfm()

        // todo : handle error better
        console.log(response.message)
    }

    async onUpdateProfile(){
        // todo : check email format?
        const data = {
            email : this.refs.email.value.trim().toLowerCase()
        }

        const response = await ajax.post(`${appSettings.serverUrl}/v1/profile`, data)
        if (!response.code){
            sessionSet(response.payload.session)
            alert('Updated')
        } else {
            // todo : better handle error
            console.log(response.message )
        }

    }

    async resendValidationEmail(){
        const response = await ajax.authGet(`${appSettings.serverUrl}/v1/profile/resendValidationEmail`)
        if (!response.code)
            alert('Email sent')
        else 
            // todo : better handle error
            console.log(response.message)
    }

    changeDropbox(willConnect){
        if (willConnect)
            this.setState({ showConfirmDropboxConnect : true })
        else 
            this.setState({ showConfirmDropboxDisconnect : true })

        // always return false, actual result is obtained only after full reload
        return false
    }

    onDropboxConnectAccept(){
        const session = store.getState().session || {}
        window.location = `/v1/oauth/source/start?origin=profile&token=${session.token}`
    }

    onDropboxConnectReject(){
        this.setState({ showConfirmDropboxConnect : false })
    }

    async onDropboxDisconnectAccept(){
        const response = await ajax.delete(`${appSettings.serverUrl}/v1/profile/source`)
        this.setState({ showConfirmDropboxDisconnect : false })
        if (!response.code){
            sessionSet(response.payload)
            return
        }

        // todo : handle error
        console.log(response.message)
    }

    onDropboxDisconnectReject(){
        this.setState({ showConfirmDropboxDisconnect : false })
    }

    async deleteAllData(){
        const response = await ajax.authGet(`${appSettings.serverUrl}/v1/profile/startdelete`)
        this.setState({ showDeleteAccountConfirm : false })
        if (!response.code)
            return this.setState({ showDeleteAccountConfirm : true })

        // todo : handle error
        console.log(response.message)
    }

    onAccountDeleteClose(){
         this.setState({ showDeleteAccountConfirm : false })
    }

    render(){
        return (
            <div className="settings">
                <div className="settings-gridScaffold">

                    <GluConfirmModal onAccept={this.onDropboxConnectAccept.bind(this)} onReject={this.onDropboxConnectReject.bind(this)} show={this.state.showConfirmDropboxConnect }>
                        <h2>Connect {appSettings.sourceLabel}</h2>
                        <p>
                            You will be temporarily redirected to {appSettings.sourceLabel}, where you can give our app permission to access your music. Proceed?
                       </p>
                    </GluConfirmModal>

                    <GluConfirmModal onAccept={this.onDropboxDisconnectAccept.bind(this)} onReject={this.onDropboxDisconnectReject.bind(this)} show={this.state.showConfirmDropboxDisconnect }>
                        <h2>Disconnect {appSettings.sourceLabel}</h2>
                        <p>
                            You will be temporarily redirected to {appSettings.sourceLabel}, where you can disconnect our app. Proceed?
                       </p>
                    </GluConfirmModal>

                    <GluConfirmModal onAccept={this.onLastFmConnectAccept.bind(this)} onReject={this.onLastFmConnectReject.bind(this)} show={this.state.showConfirmLastfmConnect }>
                        <h2>Connect Last.fm</h2>
                        <p>
                            You will be temporarily redirected to last.fm, where you can give our app permission to scrobble your plays. Proceed?
                       </p>
                    </GluConfirmModal>

                    <GluConfirmModal onAccept={this.onLastFmDisconnectAccept.bind(this)} onReject={this.onLastFmDisconnectReject.bind(this)} show={this.state.showConfirmLastfmDisconnect }>
                        <h2>Disconnect Last.fm</h2>
                        <p>
                            This will disable play tracking with last.fm. You can re-enable tracking at any time.
                       </p>
                    </GluConfirmModal>

                    <GluConfirmModal reject={null} confirm="Ok" onAccept={this.onAccountDeleteClose.bind(this)} show={this.state.showDeleteAccountConfirm }>
                        <h2>Delete account</h2>
                        <p>
                            We've sent you an email with final delete instructions. If you want to proceed, follow the instructions in the mail.
                       </p>
                    </GluConfirmModal>

                    <Divider>
                        Session
                    </Divider>

                    <Row>
                        <button className={`glu_button`} onClick={this.logout.bind(this)}>Logout</button>
                    </Row>

                    <Divider>
                        Music
                    </Divider>

                    {
                        this.props.isSourceConnected &&
                            <Row>
                                <Link className={`glu_button`} to="/import" >Import songs</Link>
                            </Row>
                    }

                    {
                        !this.props.isSourceConnected &&
                            <Row>
                                You cannot import music from {appSettings.sourceLabel} until you enable the connection
                            </Row>
                    }

                    <Row>
                        <GluSlidingCheckbox isChecked={this.props.isSourceConnected} onChanged={this.changeDropbox.bind(this)} />
                    </Row>

                    <Description>
                        Required if you want to stream songs from {appSettings.sourceLabel}
                    </Description>

                    <Label>
                        Last.fm
                    </Label>

                    <Row>
                        <GluSlidingCheckbox isChecked={this.props.isScrobbling} onChanged={this.changeScrobbling.bind(this)} />
                    </Row>

                    <Description>
                        Track your playing history - <a href="http://www.last.fm" target="_new">read more</a>.
                    </Description>

                    <Divider>
                        Email
                    </Divider>

                    <Row>
                        <input ref="email" className="form-textField" type="text" placeholder="Email" defaultValue={this.props.email}/>
                    </Row>

                    <Description>
                        Used to send you a new password if you forget your current. Optional.
                    </Description>

                    <Row>
                        <Button text="Update" onClick={this.onUpdateProfile.bind(this)} />
                    </Row>

                    <Row>
                        <Link to="newPassword">Want to change password? Try here</Link>
                    </Row>

                    <Divider>
                        Account
                    </Divider>

                    <Label>
                        Permanently delete your account
                    </Label>

                    <Row>
                        <button className={`glu_button`} onClick={this.deleteAllData.bind(this)}>Delete me</button>
                    </Row>

                    <Description>
                        WARNING : Cannot be undone. This will delete all your data on this node and reset it. To remove the node itself
                        contanct your server administrator.
                    </Description>

                </div>
            </div>
        )
    }
}

// redux mapping
export default connect(
    (state) => {
        let session = state.session || {}
        
        return {
            email: session.email,
            newEmail : session.newEmail,
            isSourceConnected : session.isSourceConnected,
            isScrobbling : session.isScrobbling,
        }
    }
)(View)