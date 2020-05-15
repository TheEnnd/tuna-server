import React from 'react'
import Layout from './../layout/layout'
import View from './../login/login'
import { nowLayoutNone } from './../actions/actions'

export default class extends React.Component {

    componentWillMount(){
        nowLayoutNone()
    }

    render(){
        return (
            <Layout>
                <View />
            </Layout>
        )
    }
}
