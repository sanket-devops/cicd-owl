import React, { useState, useRef, useCallback, useEffect } from 'react';
import './dashboard.css'
import { Navigate, Route, Routes, useNavigate, Link } from "react-router-dom";
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { DataView } from 'primereact/dataview';
import { Toolbar } from 'primereact/toolbar';
import { Column } from 'primereact/column';
import { InputText } from "primereact/inputtext";
import { InputTextarea } from 'primereact/inputtextarea';
import { OrderList } from 'primereact/orderlist';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { _getAllCicd, _getBuildQueue, _getCurrentBuild, _currentBuildStop, validateToken, _saveCicd, _updateCicd, _deleteCicd, _runCicd, _runStage, _getAllHost, _saveHost, _updateHost, _deleteHost } from '../../service/dashboard.service';
import useWebSocket from 'react-use-websocket';


function Dashboard() {
    // const WebSocketUrl = 'ws://192.168.10.108:8800';
    // const {
    //     sendMessage,
    //     sendJsonMessage,
    //     lastMessage,
    //     lastJsonMessage,
    //     readyState,
    //     getWebSocket,
    // } = useWebSocket(WebSocketUrl, {
    //     onOpen: () => console.log(`Cicd-Owl-Wss is Connected... `),
    //     //Will attempt to reconnect on all close events, such as server shutting down
    //     shouldReconnect: (closeEvent) => true,
    // });

    let emptyHost = {
        "hostName": "",
        "hostAdd": "",
        "hostPort": 22,
        "hostUser": "",
        "hostPass": "",
        "hostPath": ""
    }

    let emptyStage = {
        "stageName": "",
        "remoteHost": "",
        "command": ""
    };

    let emptyCicd = {
        "itemName": "",
        "status": "",
        "cicdStages": [],
        "cicdStagesOutput": []
    };

    const navigate = useNavigate();
    const toast = useRef(null);
    const [cicdData, setCicdData] = useState([]);
    const [cicdBuildQueue, setCicdBuildQueue] = useState([]);
    const [currentBuildData, setCurrentBuildData] = useState([]);
    const [hostData, setHostData] = useState([]);
    const [selectedHost, setSelectedHost] = useState(null);
    const [selectedItems, setSelectedItems] = useState(null);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [globalFilterStage, setGlobalFilterStage] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [cicd, setCicd] = useState(emptyCicd);
    const [stage, setStage] = useState(emptyStage);
    const [newStage, setNewStage] = useState(emptyStage);
    const [host, setHost] = useState(emptyHost);
    const [cicdDialog, setCicdDialog] = useState(false);
    const [stageDialog, setStageDialog] = useState(false);
    const [hostDialog, setHostDialog] = useState(false);
    const [deleteCicdDialog, setDeleteCicdDialog] = useState(false);
    const [deleteCicdStageDialog, setDeleteCicdStageDialog] = useState(false);
    const [deleteHostDialog, setDeleteHostDialog] = useState(false);
    const dt = useRef(null);
    const reloadData = useRef(null);

    let loadData = async () => {
        setCicdData(await _getAllCicd());
        setCicdBuildQueue(await _getBuildQueue());
        setCurrentBuildData(await _getCurrentBuild());
    };
    let loadHost = async () => {
        setHostData(await _getAllHost())
    };

    useEffect(() => {
        let token = localStorage.getItem('token');
        if (token) {
            (async function () {
                let res = await validateToken(token);
                if (res.status === 200) {
                    loadData();
                    loadHost();
                    toast.current.show({ severity: 'success', summary: 'Success', detail: 'Login Success' });
                    reloadData.interval = setInterval(async () => { await loadData() }, 10000);
                }
                else if (res.status === 401) {
                    clearInterval(reloadData.interval);
                    navigate("/login");
                }
            }());
        }
        else {
            clearInterval(reloadData.interval);
            navigate("/login");
        }
    }, []);

    let openNewCicd = () => {
        setCicd(emptyCicd);
        setStage([]);
        setNewStage(emptyStage);
        setSubmitted(false);
        setCicdDialog(true);
    };

    let openNewStage = () => {
        setNewStage(emptyStage);
        setSubmitted(false);
        setStageDialog(true);
    };

    let openNewHost = () => {
        setHost(emptyHost);
        setSubmitted(false);
        setHostDialog(true);
    };

    let openCicd = async (cicdShow) => {
        // if (cicdShow.cicdStagesOutput) {
        clearInterval(reloadData.interval);
        navigate("/cicd", { state: cicdShow });
        // }
    };

    const hideDeleteCicdDialog = () => {
        setDeleteCicdDialog(false);
    };

    const hideDeleteCicStagedDialog = () => {
        setDeleteCicdStageDialog(false);
    };

    const hideDeleteHostDialog = () => {
        setDeleteHostDialog(false);
    };

    const hideDialog = () => {
        setSubmitted(false)
        setCicdDialog(false);
        // setShowCicdDialog(false);
    };

    const hideStageDialog = () => {
        setSubmitted(false);
        setStageDialog(false);
    };

    const hideHostDialog = () => {
        setSubmitted(false);
        setHostDialog(false);
    };

    const deleteCicdItem = (rowData) => {
        let _cicd = rowData;
        setCicd(_cicd);
        setDeleteCicdDialog(true);
    };

    const deleteStageItem = (rowData) => {
        let _newStage = rowData
        setNewStage(_newStage)
        setDeleteCicdStageDialog(true)
    };

    const deleteHostItem = (rowData) => {
        let _newHost = rowData
        setHost(_newHost)
        setDeleteHostDialog(true)
    };

    const deleteCicd = () => {
        _deleteCicd(cicd)
        setTimeout(() => {
            loadData();
        }, 250);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Cicd Deleted', life: 3000 });
        setDeleteCicdDialog(false);
        setCicd(emptyCicd);
    };

    const deleteHost = () => {
        _deleteHost(host)
        setTimeout(() => {
            loadHost();
        }, 250);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Host Deleted', life: 3000 });
        setDeleteHostDialog(false);
        setHost(emptyHost);
    };

    const deleteCicdStage = () => {
        if (newStage._id) {
            for (let index = 0; index < stage.length; index++) {
                if (stage[index]._id === newStage._id) {
                    stage.splice(index, 1)
                    toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Stage Deleted', life: 3000 });
                }
            }
        } else {
            for (let index = 0; index < stage.length; index++) {
                if (stage[index].stageName === newStage.stageName) {
                    stage.splice(index, 1)
                    toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Stage Deleted Using Name', life: 3000 });
                }
            }
        }
        setTimeout(() => {
            loadData();
        }, 250);
        // toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Stage Deleted last', life: 3000 });
        setDeleteCicdStageDialog(false);
        // setCicd(emptyCicd);
    };
    const editCicdItem = (rowData) => {
        setCicd(rowData)
        setStage(rowData.cicdStages)
        setCicdDialog(true)
        setSubmitted(false);
    };

    const runCicd = async (rowData) => {
        // console.log(rowData)
        let body = rowData
        _runCicd(body);
        setTimeout(async () => {
            await loadData();
        }, 3000);
    };

    const runStage = async (rowData) => {
        let body = {
            "stageName": rowData.stageName,
            "remoteHost": rowData.remoteHost,
            "command": rowData.command
        }
        let _testOutput = await _runStage(body)
        let resData = await _testOutput.json();
        // console.log(resData)
        let stageWindow = window.open("", "", "toolbar=yes,scrollbars=yes,resizable=yes,top=800,left=1000,width=800,height=300");
        stageWindow.document.write(resData.output.replace(/(?:\r\n|\r|\n,|\n|,)/g, '<br>'));

        await loadData();
    };

    // const showWindow = async () => {
    //     setTimeout(() => {
    //         if (lastMessage !== null) {
    //             console.log(lastMessage.data.replace(/(?:\r\n|\r|\n)/g, '<br>'));
    //             let stageWindow = window.open("", "", "toolbar=yes,scrollbars=yes,resizable=yes,top=800,left=1000,width=800,height=300");
    //             // stageWindow.document.write(lastMessage.data.replace(/(?:\r\n|\r|\n)/g, '<br>'));
    //             stageWindow.document.write(lastMessage.data.replace(/(?:\r\n|\r|\n)/g, '<br>'));
    //         }
    //     }, 250);
    // }

    // const runSocket = async (rowData) => {
    //     let body = {
    //         "stageName": rowData.stageName,
    //         "remoteHost": rowData.remoteHost,
    //         "command": rowData.command
    //     }
    //     sendJsonMessage(body);
    // };

    const editStageItem = (rowData) => {
        setNewStage(rowData)
        // console.log(host)
        setStageDialog(true)
        setSubmitted(false);
    };

    const editHostItem = (rowData) => {
        setHost(rowData)
        setSubmitted(false);
    };

    // const deleteSelectedCicds = () => {
    //     let _cicd = cicds.filter((val) => !selectedCicds.includes(val));
    //     setCicds(_cicd);
    //     setDeleteCicdsDialog(false);
    //     setSelectedCicds(null);
    //     toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Cicds Deleted', life: 3000 });
    // };

    const saveCicd = async () => {
        setSubmitted(true);
        if (cicd.itemName.trim()) {
            if (cicd._id) {
                console.log(cicd)
                _updateCicd(cicd)
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Cicd Updated', life: 3000 });
            } else {
                console.log(cicd)
                _saveCicd(cicd)
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Cicd Saved', life: 3000 });
            }
            setTimeout(() => {
                loadData();
            }, 250);
            setCicdDialog(false);
        }
    }

    const saveCicdStage = async () => {
        setSubmitted(true);
        if (newStage.stageName.trim()) {
            if (newStage._id) {
                for (let index = 0; index < stage.length; index++) {
                    // console.log(stage[index])
                    if (stage[index]._id === newStage._id) {
                        stage[index] = newStage;
                    }
                }
                cicd.cicdStages = stage
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Stage Updated', life: 3000 });
                // console.log(cicd)
            } else {
                stage.push(newStage)
                cicd.cicdStages = stage
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Stage Saved', life: 3000 });
                // console.log(cicd)
            }
            setTimeout(() => {
                loadData();
            }, 250);
            setStageDialog(false);
        }
    }

    const saveHost = async () => {
        setSubmitted(true);
        if (host.hostAdd.trim() && host.hostPort && host.hostUser.trim() && host.hostPass.trim() && host.hostPath.trim()) {
            if (host._id) {
                _updateHost(host)
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Host Updated', life: 3000 });
            } else {
                _saveHost(host)
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Host Saved', life: 3000 });
            }
            setTimeout(() => {
                loadHost();
            }, 250);
            setHostDialog(false);
        }
    }
    // const findIndexById = (id) => {
    //     let index = -1;

    //     for (let i = 0; i < cicd.length; i++) {
    //         if (cicd[i]._id === id) {
    //             index = i;
    //             break;
    //         }
    //     }
    //     return index;
    // };

    const cicdDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveCicd} />
        </React.Fragment>
    );
    const cicdStageDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideStageDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveCicdStage} />
        </React.Fragment>
    );
    const hostDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideHostDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveHost} />
        </React.Fragment>
    );

    const deleteCicdDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteCicdDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteCicd} />
        </React.Fragment>
    );

    const deleteCicdStageDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteCicStagedDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteCicdStage} />
        </React.Fragment>
    );

    const deleteHostDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteHostDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteHost} />
        </React.Fragment>
    );

    let LogoutClick = async () => {
        localStorage.removeItem('token');
        navigate("/login");
    }

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Cicd" icon="pi pi-plus" severity="success" onClick={openNewCicd} />
                <Button label="Host" icon="pi pi-server" severity="success" onClick={openNewHost} />
                {/* <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedItems || !selectedItems.length} /> */}
            </div>
        );
    };

    const leftToolbarStageTemplate = () => {
        return (
            <div className="flex no-flex-wrap gap-2">
                <Button label="Stage" icon="pi pi-plus" severity="success" onClick={openNewStage} />
                {/* <Button label="Host" icon="pi pi-plus" severity="success" onClick={openNewHost} /> */}
                {/* <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedItems || !selectedItems.length} /> */}
            </div>
        );
    };
    const rightToolbarTemplate = () => {
        // return <Button label="Export" icon="pi pi-upload" className="p-button-help" />;
        return <Button label="Logout" type="logout" className="p-button-danger logout-button" onClick={() => LogoutClick()} />;
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-play" rounded outlined className="mr-2" onClick={(e) => runCicd(rowData)} />
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={(e) => editCicdItem(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={(e) => deleteCicdItem(rowData)} />
            </React.Fragment>
        );
    };

    const actionStageBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                {/* <Button icon="pi pi-eye" rounded outlined className="mr-2" onClick={(e) => showWindow()} />
                <Button icon="pi pi-arrow-right-arrow-left" rounded outlined className="mr-2" onClick={(e) => runSocket(rowData)} /> */}
                <Button icon="pi pi-play" rounded outlined className="mr-2" onClick={(e) => runStage(rowData)} />
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={(e) => editStageItem(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={(e) => deleteStageItem(rowData)} />
            </React.Fragment>
        );
    };
    const actionHostBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                {/* <Button icon="pi pi-play" rounded outlined className="mr-2" onClick={(e) => runStage(rowData)} /> */}
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={(e) => editHostItem(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={(e) => deleteHostItem(rowData)} />
            </React.Fragment>
        );
    };
    const statusBodyTemplate = (rowData) => {
        return <Tag value={rowData.status} severity={getSeverity(rowData)}></Tag>;
    };

    const getSeverity = (cicdData) => {
        switch (cicdData.status) {
            case 'success':
                return 'success';

            case 'running':
                return 'info';

            case 'queue':
                return 'help';

            case 'stopped':
                return 'warning';

            case 'failed':
                return 'danger';

            default:
                return 'secondary';
        }
    };

    const updated = (dateData) => {
        let date = new Date(dateData.updatedAt).toLocaleString("en-US", { timeZone: "America/New_York", timeStyle: "short", dateStyle: "short" });
        return date;
    }
    const created = (dateData) => {
        let date = new Date(dateData.createdAt).toLocaleString("en-US", { timeZone: "America/New_York", timeStyle: "short", dateStyle: "short" });
        return date;
    }

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Cicds</h4>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const headerStage = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Stages</h4>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilterStage(e.target.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const onInputCicdNameChange = (e, itemName) => {
        const val = (e.target && e.target.value) || '';
        let _cicd = { ...cicd };

        _cicd[`${itemName}`] = val;

        setCicd(_cicd);
    };

    const hostChange = (e, hostData) => {
        const val = (e.target && e.target.value) || '';
        let _host = { ...host };

        _host[`${hostData}`] = val;

        setHost(_host);
    };

    const stageChange = (e, stageData) => {
        const val = (e.target && e.target.value) || '';
        let _stage = { ...newStage };

        _stage[`${stageData}`] = val;

        setNewStage(_stage);
    };

    const stageHostChange = (e, stageHostName) => {
        const val = (e.target.value.hostName) || '';
        let _stage = { ...newStage };

        _stage[`${stageHostName}`] = val;

        setNewStage(_stage);
        setSelectedHost(val)
    };

    const cancelCurrentBuild = () => {
        _currentBuildStop()
    }

    const buildQueue = (build) => {
        return (
            <div className="flex flex-wrap p-2 align-items-center gap-3">
                <div key={build._id} className="flex-1 flex flex-column gap-2 xl:mr-8">
                    <span className="font-bold">{build.itemName}</span>
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-tag text-sm"></i>
                        {/* <span>{build.itemName}</span> */}
                    </div>
                    {/* <span className="font-bold text-900">${build._id}</span> */}
                </div>
            </div>

        );
    };

    const currentBuild = (hostData) => {
        return (
            <div className="col-10">
                <div className="flex flex-column xl:flex-row xl:align-items-start p-1 gap-1">
                    <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
                        <div className="flex flex-column align-items-center sm:align-items-start gap-3">
                            <div className="text-2xl font-bold text-900">{hostData.hostName}</div>
                            {/* <Rating value={product.rating} readOnly cancel={false}></Rating> */}
                            <div className="flex align-items-center gap-3">
                                <span className="flex align-items-center gap-2">
                                    {currentBuildData.remoteHost === hostData.hostName ? <><i className="pi pi-spin pi-spinner" style={{ fontSize: '1rem' }}></i>{currentBuildData.itemName}</> : "Idle"}
                                </span>
                            </div>
                        </div>
                        <div className="flex sm:flex-column align-items-center sm:align-items-end gap-1 sm:gap-1">
                            {/* <div className="text-2xl font-bold text-900">
                                <i className="pi pi-circle-fill" style={{ color: 'green', fontSize: '0.8rem' }}></i>
                            </div> */}
                            {currentBuildData.remoteHost === hostData.hostName ? <><Button icon="pi pi-times" rounded text severity="danger" onClick={(e) => cancelCurrentBuild()} aria-label="Cancel" /></> : ""}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <div>
                <Toast ref={toast} />
                <div className="card">
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                    <h1>CICD-Dashboard</h1>
                    <div className="card xl:flex xl:justify-content-center">
                        <div>
                            <OrderList value={cicdBuildQueue} onChange={(e) => setCicdBuildQueue(e.value)} itemTemplate={buildQueue} header="Build Queue" filter filterBy="itemName"></OrderList>
                            <DataView value={hostData} itemTemplate={currentBuild} />
                            {/* <Cbuild /> */}
                        </div>
                        <DataTable value={cicdData} selection={selectedItems} onSelectionChange={(e) => openCicd(e.value) && setSelectedItems(e.value)}
                            dataKey="_id" paginator rows={20} rowsPerPageOptions={[25, 50, 100]}
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} cicds" globalFilter={globalFilter} header={header}>
                            <Column selectionMode="single" exportable={false}></Column>
                            <Column field="itemName" header="Name" sortable style={{ minWidth: '16rem' }}></Column>
                            <Column field="status" header="Status" body={statusBodyTemplate} sortable style={{ minWidth: '5rem' }}></Column>
                            <Column field={updated} header="Updated" sortable></Column>
                            <Column field={created} header="Created" sortable></Column>
                            <Column header="Action" body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
                        </DataTable>
                    </div>
                </div>

                <Dialog visible={cicdDialog} style={{ width: '64rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="cicd Details" modal className="p-fluid" footer={cicdDialogFooter} onHide={hideDialog}>
                    <div className="field">
                        <label htmlFor="name" className="font-bold">
                            Cicd Name
                        </label>
                        <InputText id="name" value={cicd.itemName} onChange={(e) => onInputCicdNameChange(e, 'itemName')} required autoFocus className={classNames({ 'p-invalid': submitted && !cicd.itemName })} />
                        {submitted && !cicd.itemName && <small className="p-error">Cicd Name is required.</small>}
                        <div className="card">
                            <Toolbar className="mb-4" left={leftToolbarStageTemplate}></Toolbar>

                            <DataTable value={stage} selection={selectedItems} onSelectionChange={(e) => setSelectedItems(e.value)}
                                paginator rows={20} rowsPerPageOptions={[25, 50, 100]}
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Stages" globalFilter={globalFilterStage} header={headerStage}>
                                <Column selectionMode="multiple" exportable={false}></Column>
                                <Column field="stageName" header="Name" sortable style={{ minWidth: '16rem' }}></Column>
                                <Column field="remoteHost" header="Remote Host" sortable style={{ minWidth: '16rem' }}></Column>
                                <Column field="command" header="Command" sortable style={{ minWidth: '16rem' }}></Column>
                                <Column header="Action" body={actionStageBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
                            </DataTable>
                        </div>
                    </div>
                </Dialog>

                <Dialog visible={stageDialog} style={{ width: '64rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Add Stage" modal className="p-fluid" footer={cicdStageDialogFooter} onHide={hideStageDialog}>
                    <div className="field">
                        <div className="card">
                            <label htmlFor="integer" className="font-bold block mb-2">
                                Stages
                            </label>
                        </div>
                        <div className="card">
                            <div id="stage" className="flex flex-wrap gap-3 mb-4">
                                <div className="flex-auto">
                                    <span className="p-float-label">
                                        <InputText id="stageName" value={newStage.stageName} onChange={(e) => stageChange(e, 'stageName')} className="w-full" />
                                        <label htmlFor="Stage Name">Stage Name</label>
                                    </span>
                                </div>
                                <div className="flex-auto">
                                    <span className="p-float-label">
                                        <Dropdown value={newStage.remoteHost} onChange={(e) => stageHostChange(e, 'remoteHost')} options={hostData} optionLabel="hostName" placeholder={selectedHost} className="w-full md:w-14rem" />
                                        <label htmlFor="Host Name">Host Name</label>
                                    </span>
                                </div>
                                <div className="flex-auto">
                                    <span className="p-float-label">
                                        <InputTextarea id="command" value={newStage.command} onChange={(e) => stageChange(e, 'command')} autoResize rows={1} cols={25} />
                                        <label htmlFor="Command">Command</label>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Dialog>

                <Dialog visible={hostDialog} style={{ width: '64rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="cicd Details" modal className="p-fluid" footer={hostDialogFooter} onHide={hideDialog}>
                    {/* {cicd.image && <img src={`https://primefaces.org/cdn/primereact/images/cicd/${cicd.image}`} alt={cicd.image} className="cicd-image block m-auto pb-3" />} */}
                    <div className="field">
                    </div>
                </Dialog>

                <Dialog visible={deleteCicdDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteCicdDialogFooter} onHide={hideDeleteCicdDialog}>
                    <div className="confirmation-content">
                        <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                        {cicd && (<span>Are you sure you want to delete cicd <b>{cicd.itemName}</b> ?</span>)}
                    </div>
                </Dialog>

                <Dialog visible={deleteCicdStageDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteCicdStageDialogFooter} onHide={hideDeleteCicStagedDialog}>
                    <div className="confirmation-content">
                        <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                        {stage && <span>Are you sure you want to delete the selected stage <b>{stage.stageName}</b> ?</span>}
                    </div>
                </Dialog>

                <Dialog visible={deleteHostDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteHostDialogFooter} onHide={hideDeleteHostDialog}>
                    <div className="confirmation-content">
                        <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                        {host && <span>Are you sure you want to delete the selected host <b>{host.hostName}</b> ?</span>}
                    </div>
                </Dialog>

                <Dialog visible={hostDialog} style={{ width: '64rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Add Host" modal className="p-fluid" footer={hostDialogFooter} onHide={hideHostDialog}>
                    <div className="field">
                        <label htmlFor="hostName" className="font-bold">
                            Host Name
                        </label>
                        <InputText id="hostName" value={host.hostName} onChange={(e) => hostChange(e, 'hostName')} required autoFocus className={classNames({ 'p-invalid': submitted && !host.hostName })} />
                        {submitted && !host.hostName && <small className="p-error">Host Name is required.</small>}
                        <div className="field">
                            <div className="flex-auto">
                                {/* <label htmlFor="integer" className="font-bold block mb-2">
                                    Host Profile
                                </label> */}
                            </div>
                            <div className="card">
                                <div id="stage" className="flex flex-wrap gap-3 mb-4">
                                    <div className="flex-auto">
                                        <span className="p-float-label">
                                            <InputText id="stageName" value={host.hostAdd} onChange={(e) => hostChange(e, 'hostAdd')} className="w-full" />
                                            {submitted && !host.hostAdd && <small className="p-error">Host Address is required.</small>}
                                            <label htmlFor="Stage Name">Host Address</label>
                                        </span>
                                    </div>
                                    <div className="flex-auto">
                                        <span className="p-float-label">
                                            <InputText id="stageName" value={host.hostPort} onChange={(e) => hostChange(e, 'hostPort')} className="w-full" />
                                            {submitted && !host.hostPort && <small className="p-error">Host Port is required.</small>}
                                            <label htmlFor="Stage Name">Host Port</label>
                                        </span>
                                    </div>
                                    <div className="flex-auto">
                                        <span className="p-float-label">
                                            <InputText id="stageName" value={host.hostUser} onChange={(e) => hostChange(e, 'hostUser')} className="w-full" />
                                            {submitted && !host.hostUser && <small className="p-error">Host Username is required.</small>}
                                            <label htmlFor="Stage Name">Username</label>
                                        </span>
                                    </div>
                                    <div className="flex-auto">
                                        <span className="p-float-label">
                                            <InputText id="stageName" value={host.hostPass} onChange={(e) => hostChange(e, 'hostPass')} className="w-full" />
                                            {submitted && !host.hostPass && <small className="p-error">Host Password is required.</small>}
                                            <label htmlFor="Stage Name">Password</label>
                                        </span>
                                    </div>
                                    <div className="flex-auto">
                                        <span className="p-float-label">
                                            <InputText id="stageName" value={host.hostPath} onChange={(e) => hostChange(e, 'hostPath')} className="w-full" />
                                            {submitted && !host.hostPath && <small className="p-error">Host Path is required.</small>}
                                            <label htmlFor="Stage Name">Host Path</label>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* <Toolbar className="mb-4" left={leftToolbarStageTemplate}>Added Hosts</Toolbar> */}
                        <DataTable value={hostData} selection={selectedItems} onSelectionChange={(e) => setSelectedItems(e.value)}
                            paginator rows={20} rowsPerPageOptions={[25, 50, 100]}
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Stages" globalFilter={globalFilterStage} header={headerStage}>
                            <Column selectionMode="multiple" exportable={false}></Column>
                            <Column field="hostName" header="Host Name" sortable style={{ minWidth: '15rem' }}></Column>
                            <Column field="hostAdd" header="Host Address" sortable style={{ minWidth: '11rem' }}></Column>
                            <Column field="hostPort" header="Port" sortable style={{ minWidth: '2rem' }}></Column>
                            <Column field="hostPath" header="Host Path" sortable style={{ minWidth: '15rem' }}></Column>
                            <Column field={updated} header="Updated" sortable style={{ minWidth: '11rem' }}></Column>
                            <Column field={created} header="Created" sortable style={{ minWidth: '11rem' }}></Column>
                            <Column header="Action" body={actionHostBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
                        </DataTable>
                    </div>
                </Dialog>
            </div>
        </>
    )
}

export default Dashboard;