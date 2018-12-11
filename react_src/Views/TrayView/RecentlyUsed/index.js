import React from 'react';
import Card from '../../../Components/Card/index';

export default class RecentlyUsed extends React.Component{
    
    render() {
        let elements = [];
        console.log("Recent: ",this.props.data);
        for (let i = 0; i < this.props.data.length; i++) {
            elements.push(
                <Card
                    key={i}
                    time={this.props.data[i].time}
                    dir={this.props.data[i].dir}
                    command={this.props.data[i].command}
                    id={this.props.data[i].id}
                    onClick={this.props.clickedOn}
                />
            );
        }
        
        return (
            <div>
                {elements}    
            </div>  
        ); 
    }
}