import React, { useState, useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import './cicd.css'
import { Button } from 'primereact/button';
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { validateToken } from '../../../service/dashboard.service';

export default function Cicd(props) {
    const location = useLocation();
    const navigate = useNavigate();
    let toast = useRef(null);
    const [cicd, setCicd] = useState({});
    const [cicdStagesData, setCicdStagesData] = useState([]);


    let loadDataCicd = async () => {
        setCicd(location.state)
        setCicdStagesData(location.state.cicdStagesOutput.reverse())
    };

    useEffect(() => {
        let token = localStorage.getItem('token');
        if (token) {
            (async function () {
                let res = await validateToken(token);
                if (res.status === 200) {
                    loadDataCicd();
                    // toast.current.show({ severity: 'success', summary: 'Success', detail: 'Login Success' });
                }
                else if (res.status === 401) {
                    navigate("/login");
                }
            }());
        }
        else {
            navigate("/login");
        }
    }, []);

    const stageTime = (endTime, startTime) => {
        let tookTime = ((endTime - startTime) / 1000)
        if (tookTime >= 60) {
            return (Math.floor(tookTime / 60) + 'm');
        }
        else if ((tookTime / 60) >= 60) {
            return (Math.floor((tookTime / 60) / 60) + 'h');
        }
        else {
            return (tookTime + 's');
        }
    }

    const showStageLogs = (logs) => {
        if (logs[0]) {
            // console.log(logs);
            let cicdWindow = window.open("", "", "toolbar=yes,scrollbars=yes,resizable=yes,top=1000,left=1000,width=1000,height=1000");
            cicdWindow.document.write(logs[0].replace(/(?:\r\n|\r|\n)/g, '<br>'));
        }

    }

    const getSeverity = (status) => {
        switch (status) {
            case 'success':
                return 'success';

            case 'running':
                return 'info';

            case 'stoped':
                return 'warning';

            case 'failed':
                return 'danger';

            default:
                return null;
        }
    };

    const listItem = (cicdStagesData) => {
        return (
            <div className="col-12">
                <div className="flex flex-column xl:flex-row xl:align-items-start p-4 gap-4">
                    <div key={cicdStagesData._id} className="flex align-items-center gap-2">
                        {cicdStagesData.buildNumber}
                        {cicdStagesData.cicdStageOutput.map((stageObj) => (
                            <div key={stageObj._id} className="p-2 border-1 surface-border surface-card border-round">
                                {stageObj.stageName}
                                <Button icon="pi" className="p-5 flex align-items-center" severity={getSeverity(stageObj.status)} onClick={(e) => showStageLogs(stageObj.logs)} >
                                    {stageTime(stageObj.endTime, stageObj.startTime)}
                                </Button>
                            </div>
                        )
                        )}
                    </div>
                </div>
            </div>
        );
    };

    let backToDashboard = () => {
        navigate("/Dashboard");
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Dashboard" icon="pi-align-justify" severity="success" onClick={backToDashboard} />
            </div>
        );
    };

    return (
        <div className="card">
            <Toast ref={toast} />
            <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>
            <DataView value={cicdStagesData} itemTemplate={listItem} />
        </div>
    )
}
