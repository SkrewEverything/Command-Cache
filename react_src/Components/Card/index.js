import React from 'react';
import styles from './index.css';

export default class Card extends React.Component {
    render() {

        return (
            <div className={styles['outer-container']}>
                <div>
                    <div className={styles['time']}>{this.props.time}</div>
                    <div style={{ clear: 'both' }}></div>
                    <div className={styles['command']}>{this.props.command}</div>
                    <div className={styles['directory']}><span style={{userSelect:'none'}}>📂: </span>{this.props.dir}</div>
                </div>

                <div className={styles['horizontal-line']}></div>

                <div className={styles['buttons-container']}>
                    <span className={styles['button'] + ' ' + styles['copy-button']} onClick={() => this.props.onClick('copy', this.props)}>Copy</span>
                    <span className={this.props.id ? styles['button'] + ' ' + styles['save-button-active'] : styles['button'] + ' ' + styles['save-button']} onClick={() => this.props.onClick('save', this.props)}>{this.props.id ? 'Saved' : 'Save'}</span>
                    <span className={styles['button'] + ' ' + styles['execute-button']} onClick={() => this.props.onClick('execute', this.props)}>Execute</span>
                </div>
            </div>
        );
    }
}