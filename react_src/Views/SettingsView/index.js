import React from 'react';
import ReactDOM from 'react-dom';
import { ipcRenderer as ipc } from 'electron';
import styles from './index.css';
import logo from '../../images/logo.svg';

class App extends React.Component{
    constructor (props) {
        super(props);
        this.state = {
            versions: {},
            startAtLoginStatus: true,
        };

        this.quitApp = this.quitApp.bind(this);
        this.getStartAtLoginStatus = this.getStartAtLoginStatus.bind(this);
        this.startAtLoginChanged = this.startAtLoginChanged.bind(this);
        this.getVersions = this.getVersions.bind(this);
        this.initListeners = this.initListeners.bind(this);

        this.initListeners();
        this.getStartAtLoginStatus();
        this.getVersions();
    }

    initListeners() {
        ipc.on('response-versions', (event, data) => {
            this.setState({ versions: data });
        });
        
        ipc.on('response-startup-at-login-changed', (event, data) => {
            this.setState({ startAtLoginStatus: data });
        });

        ipc.on('response-startup-at-login-status', (event, data) => {
            this.setState({ startAtLoginStatus: data });
        });
    }

    getVersions() {
        ipc.send('request-versions','');
    }

    getStartAtLoginStatus() {
        ipc.send('request-startup-at-login-status');
    }

    startAtLoginChanged(e) {
        ipc.send('request-startup-at-login-changed', !this.state.startAtLoginStatus);
    }

    quitApp() {
        ipc.send('quit');
    }

    render() {
        return (
            <div>
                <div className={styles['logo-info']}>
                    <img src={logo} height='50px' />
                    <div className={styles['app-name']}>
                        <span style={{ color: 'rgb(70, 96, 172' }}>Command</span>
                        <span>\ </span>
                        <span style={{ color: 'rgb(187, 75, 66' }}>Cache</span>
                        <span style={{color:'grey', fontSize:'12px'}}> v1.0.0</span>
                    </div>
                </div>
                

                <div style={{ color: 'grey', textAlign: 'center', }}>
                        Logs a detailed history of terminal commands for easy access.
                </div>
                <br />
                <br />

                
                <h1>Project</h1>
                <div className={styles['card']}>
                    <div>
                        Found a bug? <a href='https://github.com/SkrewEverything/Command-Cache/issues' target='_blank'>Open new issue in GitHub</a>
                    </div>
                    <br/>
                    <div>
                        Want to see the source? <a href='https://github.com/SkrewEverything/Command-Cache' target='_blank'>Open GitHub</a>
                    </div>
                    <br/>
                    <div>
                        Want to contact me? <a href='mailto:me@skreweverything.com' target='_blank'>me@skreweverything.com</a>, <a href='mailto:skreweverything@gmail.com' target='_blank'>skreweverything@gmail.com</a>
                    </div>
                    <br/>
                    <div>
                        Twitter? <a href='https://twitter.com/SkrewEverything' target='_blank'>@SkrewEverything</a>
                    </div>
                </div>
                

                <h1>Settings</h1>
                <div className={styles['settings-container'] + ' ' + styles['card']}>
                    <div className={styles['startup-button']}>
                        <span>Start at Login: </span>
                        <input onChange={this.startAtLoginChanged} checked={this.state.startAtLoginStatus} type="checkbox" />
                    </div>
                    <br/>
                    <div className={styles['quit-button']} onClick={this.quitApp}>QUIT</div>
                </div>
                

                <h1>Built Using</h1>
                <div className={styles['card']}>
                    <p>Nodejs: {this.state.versions.nodejs}</p>
                    <p>Chrome: {this.state.versions.chrome}</p>
                    <p>Electron: {this.state.versions.electron}</p>

                </div>

            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('app'));