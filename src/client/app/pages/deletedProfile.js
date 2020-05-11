import React from 'react'
import Layout from './../layout/layout'
import View from './../deletedProfile/deletedProfile'
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


