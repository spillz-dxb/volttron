'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import BaseComponent from './base-component';
import ConfigureRegistry from './configure-registry';
import ConfigDeviceForm from './config-device-form';

import Select from 'react-select-me';

var devicesActionCreators = require('../action-creators/devices-action-creators');
var devicesStore = require('../stores/devices-store');


class ReconfigureDevice extends BaseComponent {    
    constructor(props) {
        super(props);
        this._bind('_onStoresChange', '_onConfigChange', '_validateDataFile');

        var state = getStateFromStore();
    }
    componentDidMount() {
        
        devicesStore.addChangeListener(this._onStoresChange);
    }
    componentWillUnmount() {
        devicesStore.removeChangeListener(this._onStoresChange);
    }
    _onStoresChange() {
        this.setState(getStateFromStore());
    }
    _onConfigChange(selection) {
        this.setState({ configFile: selection.value });
    }
    _validateDataFile(data, callback) {
        
        var keyCells = ["Volttron Point Name", "BACnet Object Type", "Index"];
        var cellsNotFound = JSON.parse(JSON.stringify(keyCells));

        keyCells.forEach(function(keyCell) {

            data.forEach(function (cell) {

                if (keyCell === cell.label)
                {
                    var index = cellsNotFound.indexOf(keyCell);
                    cellsNotFound.splice(index, 1);
                }
            });

        });

        var valid = true;
        if (cellsNotFound.length) 
        {
            valid = false;

            var keyCellsString = cellsNotFound.map(function(cell) { 
                return "\"" + cell + "\""; 
            }).join(", ");

            callback(keyCellsString);
        }

        return valid;
    }
    render() {        
        
        var registryConfig, deviceConfig, configuration, defaultMessage;

        if (this.state) 
        {
            var configOptions = [
                { value: "registryConfig", label: "Registry Config"},
                { value: "deviceConfig", label: "Device Config"}
            ];

            var configSelect = (
                <Select
                    name="config-select"
                    options={configOptions}
                    value={this.state.configFile}
                    onChange={this._onConfigChange}>
                </Select>
            );

            configuration = (
                <div className="">
                    <table className="config-devices-table reconfig">
                        <tbody>
                            <tr>
                                <td className="plain" style={cellStyle}>
                                    <b>Registry Config: </b>
                                </td>
                                <td className="plain" style={cellStyle}>{this.state.configuration.registryFile}</td>
                                <td className="plain" style={cellStyle}></td>
                                <td className="plain" style={cellStyle}></td>
                            </tr>
                            <tr>
                                <td className="plain" style={cellStyle}>
                                    <b>Device Config: </b>
                                </td>
                                <td className="plain" style={cellStyle}>{this.state.device.name}</td>
                                <td className="plain" style={cellStyle}></td>
                                <td className="plain" style={cellStyle}></td>
                            </tr>
                            <tr>
                                <td className="plain" style={cellStyle}><b>Config File: </b></td>
                                <td className="plain" style={cellStyle}>{configSelect}</td>  
                                <td className="plain" style={cellStyle}></td>
                                <td className="plain" style={cellStyle}></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            );
            
            var cellStyle = {
                verticalAlign: "top"
            };

            if (this.state.configFile === "registryConfig")
            {
                registryConfig = (
                    <ConfigureRegistry device={this.state.device} 
                        dataValidator={this._validateDataFile}
                        registryFile={this.state.configuration.registryFile}/>
                );
            }
            else
            {
                deviceConfig = (
                    <ConfigDeviceForm device={this.state.device} 
                        registryFile={this.state.configuration.deviceConfig}/>
                );
            }
        }
        else
        {
            defaultMessage = (
                <div>To reconfigure a device, click on the <i className="fa fa-wrench"></i> button next to the device in the side tree.</div>
            );
        }

        return (
            <div className="view">   
                <h2>Reconfigure Device</h2> 
                {defaultMessage}      
                {configuration} 
                <div className="device-box device-container">
                    {registryConfig}
                    {deviceConfig}
                </div> 

            </div> 
        );
    }
};

function getStateFromStore() {

    var state = {};
    var reconfiguration = devicesStore.getReconfiguration();

    if (!objectIsEmpty(reconfiguration))
    {
        var deviceId = reconfiguration.driver_config.device_id;
        var deviceAddress = reconfiguration.driver_config.device_address;

        state = {
            device: devicesStore.getDeviceRef(deviceId, deviceAddress),
            configuration: reconfiguration,
            configFile: "registryConfig"
        };
    }

    return state;
}

function objectIsEmpty(obj)
{
    return Object.keys(obj).length === 0;
}

export default ReconfigureDevice;