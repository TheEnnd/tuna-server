import React from 'react'
import Layout from './../layout/layout'
import View from './../playlist/playlist'
import { nowLayoutSmall } from './../actions/actions'

export default class extends React.Component {

    componentWillMount(){
        nowLayoutSmall()
    }

    render(){
        return (
            <Layout>
                <View />
            </Layout>
        )
    }
}
