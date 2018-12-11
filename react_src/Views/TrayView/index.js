import React from 'react';
import ReactDOM from 'react-dom';
import { ipcRenderer as ipc } from 'electron';
import RecentlyUsed from './RecentlyUsed/index';
import MostUsed from './MostUsed/index';
import Saved from './Saved/index';
import styles from './index.css';
import logo from '../../images/logo.svg';

class App extends React.Component
{
    constructor (props)
    {
        super(props);
        this.state = {
            data: [],
            searchData: [],
            searchValue: "",
            category: 'recent',
        };
        
        this.recentlyUsedData = this.recentlyUsedData.bind(this);
        this.savedData = this.savedData.bind(this);
        this.mostUsedData = this.mostUsedData.bind(this);
        this.getData = this.getData.bind(this);
        this.initListeners = this.initListeners.bind(this);
        this.clickedOn = this.clickedOn.bind(this);
        this.changeCategory = this.changeCategory.bind(this);
        this.displayCategory = this.displayCategory.bind(this);
        this.searchBarChange = this.searchBarChange.bind(this);
        this.isSearching = this.isSearching.bind(this);
        this.updateDataWithSearchBar = this.updateDataWithSearchBar.bind(this);
        

        this.initListeners();
        this.getData('recent');
        
    }

    initListeners() {
        window.onfocus = () => {
            //console.log('Yeah, got focus');
            this.getData(this.state.category);
        }

        ipc.on('response-recent-data', (event, data) => {            
            this.setState({ data: data, category: 'recent' });
            if(this.isSearching())
                this.updateDataWithSearchBar(this.state.searchValue);
        });

        ipc.on('response-most-data', (event, data) => {            
            this.setState({ data: data, category: 'most' });
            if(this.isSearching())
                this.updateDataWithSearchBar(this.state.searchValue);
        });

        ipc.on('response-saved-data', (event, data) => { 
            this.setState({ data: data, category: 'saved' });
            if(this.isSearching())
                this.updateDataWithSearchBar(this.state.searchValue);
        });

        ipc.on('response-update-save-data', (event, data) => {
            if (this.state.category == 'recent') {
                this.recentlyUsedData();
            }
            else if (this.state.category == 'most') {
                this.mostUsedData();
            }
            else if (this.state.category == 'saved') {
                this.savedData();
            }
            else {
                console.log("This shouldn't get executed");
            }
        });

        ipc.on('error-log', (event, data) => {
            console.log(data);
        });
    }

    getData(category) {
        if (category == 'recent') {
            this.recentlyUsedData();
        }
        else if (category == 'most') {
            this.mostUsedData();
        }
        else if (category == 'saved') {
            this.savedData();
        }
        else {
            console.log("Something is wrong! This should not be executed!: 01", category)
        }
    }

    recentlyUsedData() {
        ipc.send('request-recent-data', "");
        
    }

    mostUsedData() {
        ipc.send('request-most-data', "");
        
    }

    savedData() {
        ipc.send('request-saved-data', "");
        
    }

    clickedOn(context, value)
    {
        if (context == 'copy') {
            ipc.send('copy-to-clipboard', value.command);
        }
        else if (context == 'execute') {
            ipc.send('execute-command', { dir: value.dir, command: value.command });
        }
        else if (context == 'save') {
            ipc.send('update-save-data', value);
        }
        else {
            console.log("Something is wrong! This should not be executed!: 02")
        }
        
    }

    searchBarChange(event) {
        this.updateDataWithSearchBar(event.target.value);
    }

    updateDataWithSearchBar(input) {
        let newData = [];
        this.state.data.forEach(value => {
            if (value.command.indexOf(input) > -1) {
                newData.push(value);
            }
        });
        this.setState({ searchData: newData, searchValue: input });
    }

    changeCategory(category) {
        console.log("category changed: ", category);
        this.getData(category);
    
    }

    displayCategory() {
        if (this.state.category == 'recent') {
            return (<RecentlyUsed data={this.isSearching() ? this.state.searchData : this.state.data} clickedOn={this.clickedOn} />);
        }
        else if (this.state.category == 'most') {
            return (<MostUsed data={this.isSearching() ? this.state.searchData : this.state.data} clickedOn={this.clickedOn} />);
        }
        else if (this.state.category == 'saved') {
            return (<Saved data={this.isSearching() ? this.state.searchData : this.state.data} clickedOn={this.clickedOn} />);
        }
    }

    isSearching() {
        return this.state.searchValue != "";
    }

    render()
    {
        return (
            <div>
                <div className={styles['logo-name-info-container']}>
                    <div className={styles['logo-name']}>
                        <img src={logo} height='32px' />
                        <div className={styles['app-name']}>
                            <span style={{ color: 'rgb(70, 96, 172' }}>Command</span>
                            <span>\ </span>
                            <span style={{ color: 'rgb(187, 75, 66' }}>Cache</span>
                        </div>
                    </div>
                    <div>
                        <div className={styles['info-button']} onClick={() => ipc.send('settings', '')}>i</div>
                    </div>
                </div>
                

                <div className={styles['category-box']}>
                    <span onClick={() => this.changeCategory('recent')} className={this.state.category == 'recent' ? styles['category'] + ' ' +styles['category-active'] : styles['category']}>Recently Used</span>
                    <span onClick={() => this.changeCategory('most')} className={this.state.category == 'most' ? styles['category'] + ' ' + styles['category-active'] : styles['category']}>Most Used</span>
                    <span onClick={() => this.changeCategory('saved')} className={this.state.category == 'saved' ? styles['category'] + ' ' + styles['category-active'] : styles['category']}>Saved</span>
                </div>

                <div>
                    <input className={styles['search-box']} onChange={this.searchBarChange} value={this.state.searchValue} placeholder="Search for command..." type="search" />
                </div>
                
                {this.displayCategory()}

            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('app'));
