import React, { useState, useRef, useEffect } from 'react';
import './dashboard.css'
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Toolbar } from 'primereact/toolbar';
import { Column } from 'primereact/column';
import { InputText } from "primereact/inputtext";
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { RadioButton } from 'primereact/radiobutton';
import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { getAllCicd, validateToken, __saveCicd, __updateCicd, __deleteCicd } from '../../service/dashboard.service';


function Dashboard() {
    let emptyStage = {
        "stageName": "",
        "remoteHost": "",
        "command": ""
    };
    let emptyCicd = {
        "itemName": "",
        "status": "",
        "cicdStages": [
            {
                "stageName": "",
                "remoteHost": "",
                "command": ""
            }],
        "cicdStagesOutput": []
    };
    const hosts = [
        { name: 'New York', code: 'NY' },
        { name: 'Rome', code: 'RM' },
        { name: 'London', code: 'LDN' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Paris', code: 'PRS' }
    ];
    const navigate = useNavigate();
    let toast = useRef(null);
    let [cicdData, setCicdData] = useState([]);
    const [selectedHost, setSelectedHost] = useState(null);
    let [showCicdData, setShowCicdData] = useState([]);
    const [selectedItems, setSelectedItems] = useState(null);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [cicd, setCicd] = useState(emptyCicd);
    const [stage, setStage] = useState(emptyStage);
    const [cicdDialog, setCicdDialog] = useState(false);
    const [editCicdDialog, setEditCicdDialog] = useState(false);
    const [showCicdDialog, setShowCicdDialog] = useState(false);
    const [cicds, setCicds] = useState(null);
    const [deleteCicdDialog, setDeleteCicdDialog] = useState(false);
    const [deleteCicdsDialog, setDeleteCicdsDialog] = useState(false);
    const [selectedCicds, setSelectedCicds] = useState(null);
    const dt = useRef(null);

    let loadData = async () => {
        setCicdData(await getAllCicd());
    };

    useEffect(() => {
        let token = localStorage.getItem('token');
        if (token) {
            (async function () {
                let res = await validateToken(token);
                if (res.status === 200) {
                    loadData();
                    toast.current.show({ severity: 'success', summary: 'Success', detail: 'Login Success' });
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

    let openNew = () => {
        setCicd(emptyCicd);
        setStage(emptyStage);
        setSubmitted(false);
        setCicdDialog(true);
    };

    let openCicd = (cicdShow) => {
        if (cicdShow.cicdStagesOutput[0]) {
            setShowCicdData([cicdShow.cicdStagesOutput[0]]);
            setSubmitted(false);
            setShowCicdDialog(true);
        }
    };

    const hideDeleteCicdDialog = () => {
        setDeleteCicdDialog(false);
    };

    const hideDeleteCicdsDialog = () => {
        setDeleteCicdsDialog(false);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setCicdDialog(false);
        setEditCicdDialog(false);
        setShowCicdDialog(false);
    };

    const deleteCicdItem = (rowData) => {
        let _cicd = rowData;
        setCicd(_cicd);
        setDeleteCicdDialog(true);
    };

    const deleteCicd = () => {
        __deleteCicd(cicd)
        setTimeout(() => {
            loadData();
        }, 250);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Cicd Deleted', life: 3000 });
        setDeleteCicdDialog(false);
        setCicd(emptyCicd);
    };

    const editCicdItem = (rowData) => {
        setCicd(rowData)
        setStage(rowData.cicdStages[0])
        setCicdDialog(true)
        setSubmitted(false);
    };

    const deleteSelectedCicds = () => {
        let _cicd = cicds.filter((val) => !selectedCicds.includes(val));

        setCicds(_cicd);
        setDeleteCicdsDialog(false);
        setSelectedCicds(null);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Cicds Deleted', life: 3000 });
    };

    const saveCicd = async () => {
        setSubmitted(true);
        if (cicd.itemName.trim()) {
            if (cicd._id) {
                cicd.cicdStages = [stage]
                console.log(cicd)
                __updateCicd(cicd)
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Cicds Updated', life: 3000 });
            } else {
                cicd.cicdStages = [stage]
                console.log(cicd)
                __saveCicd(cicd)
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Cicds Saved', life: 3000 });
            }
            setTimeout(() => {
                loadData();
            }, 250);
            setCicdDialog(false);
            // toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Cicds Saved', life: 3000 });
        }
    }
    const findIndexById = (id) => {
        let index = -1;

        for (let i = 0; i < cicd.length; i++) {
            if (cicd[i]._id === id) {
                index = i;
                break;
            }
        }
        return index;
    };

    // const updateCicd = () => {
    //     setSubmitted(true);
    //     __updateCicd(cicd)
    //     setTimeout(() => {
    //         loadData();
    //     }, 250);
    //     setEditCicdDialog(false);
    //     setCicd(emptyCicd);
    //     toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Cicds Updated', life: 3000 });
    // }

    const cicdDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveCicd} />
        </React.Fragment>
    );
    const editCicdDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveCicd} />
        </React.Fragment>
    );
    const showCicdDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
            {/* <Button label="Save" icon="pi pi-check" onClick={saveCicd} /> */}
        </React.Fragment>
    );
    const deleteCicdDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteCicdDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteCicd} />
        </React.Fragment>
    );

    const deleteCicdsDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteCicdsDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteSelectedCicds} />
        </React.Fragment>
    );

    const confirmDeleteSelected = () => {
        setDeleteCicdsDialog(true);
    };

    let LogoutClick = async () => {
        localStorage.removeItem('token');
        navigate("/login");
    }

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} />
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
                <Button icon="pi pi-play" rounded outlined className="mr-2" />
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={(e) => editCicdItem(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={(e) => deleteCicdItem(rowData)} />
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

            case 'stoped':
                return 'warning';

            case 'failed':
                return 'danger';

            default:
                return null;
        }
    };

    const updated = (cicdData) => {
        let date = new Date(cicdData.updatedAt).toLocaleString("en-US", { timeZone: "America/New_York", timeStyle: "short", dateStyle: "short" });
        return date;
    }
    const created = (cicdData) => {
        let date = new Date(cicdData.createdAt).toLocaleString("en-US", { timeZone: "America/New_York", timeStyle: "short", dateStyle: "short" });
        return date;
    }
    const startTime = (showCicdData) => {
        let date = new Date(showCicdData.startTime).toLocaleString("en-US", { timeZone: "America/New_York", timeStyle: "short", dateStyle: "short" });
        return date;
    }
    const endTime = (showCicdData) => {
        let date = new Date(showCicdData.endTime).toLocaleString("en-US", { timeZone: "America/New_York", timeStyle: "short", dateStyle: "short" });
        return date;
    }
    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Manage cicds</h4>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const onInputChange = (e, itemName) => {
        // console.log(cicd)
        const val = (e.target && e.target.value) || '';
        let _cicd = { ...cicd };

        _cicd[`${itemName}`] = val;

        setCicd(_cicd);
    };

    // const stageNameChange = (e, stageName) => {
    //     const val = (e.target && e.target.value) || '';
    //     let _stage = { ...stage };

    //     _stage[`${stageName}`] = val;

    //     setStage(_stage);
    // };

    const stageChange = (e, stageData) => {
        const val = (e.target && e.target.value) || '';
        let _stage = { ...stage };

        _stage[`${stageData}`] = val;

        setStage(_stage);
    };


    const removeStageRow = (index) => {
        cicd.cicdStages.splice(index, 1);
    }

    const addStageRow = () => {
        cicd.cicdStages.push({});
    }
    // const footer = `In total there are ${cicdData ? cicdData.length : 0} cicds.`;

    return (
        <>
            <div>
                {/* <Button label="Logout" type="logout" className="p-button-danger logout-button" onClick={() => LogoutClick()} /> */}
                <Toast ref={toast} />
                <div className="card">
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                    {/* <DataTable value={cicdData} selection={selectedItems} onSelectionChange={(e) => setSelectedItems(e.value)} */}
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

                <Dialog visible={cicdDialog} style={{ width: '64rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="cicd Details" modal className="p-fluid" footer={cicdDialogFooter} onHide={hideDialog}>
                    {/* {cicd.image && <img src={`https://primefaces.org/cdn/primereact/images/cicd/${cicd.image}`} alt={cicd.image} className="cicd-image block m-auto pb-3" />} */}
                    <div className="field">
                        <label htmlFor="name" className="font-bold">
                            Name
                        </label>
                        <InputText id="name" value={cicd.itemName} onChange={(e) => onInputChange(e, 'itemName')} required autoFocus className={classNames({ 'p-invalid': submitted && !cicd.itemName })} />
                        {submitted && !cicd.itemName && <small className="p-error">Name is required.</small>}


                        <div className="card">
                            <label htmlFor="integer" className="font-bold block mb-2">
                                Stages
                            </label>
                            <div id="stage" className="flex flex-wrap gap-3 mb-4">
                                <div className="flex-auto">
                                    <span className="p-float-label">
                                        <InputText id="stageName" value={stage.stageName} onChange={(e) => stageChange(e, 'stageName')} className="w-full" />
                                        <label htmlFor="Stage Name">Stage Name</label>
                                    </span>
                                </div>
                                <div className="flex-auto">
                                    <span className="p-float-label">
                                        {/* <InputText id="hostName" keyfilter="num" className="w-full" /> */}
                                        {/* <Dropdown value={selectedCity} onChange={(e) => setSelectedCity(e.value)} options={cities} optionLabel="name" placeholder="Select a City" className="w-full md:w-14rem" /> */}
                                        <Dropdown value={stage.remoteHost} onChange={(e) => setSelectedHost(e.value)} options={hosts} optionLabel="Host Name" placeholder="Host Name" className="w-full md:w-14rem" />
                                        <label htmlFor="Host Name">Host Name</label>
                                    </span>
                                </div>
                                <div className="flex-auto">
                                    <span className="p-float-label">
                                        <InputTextarea id="command" autoResize rows={1} cols={25} />
                                        <label htmlFor="Command">Command</label>
                                    </span>
                                </div>
                                <div className="flex-auto">
                                    <Button type="button" icon="pi pi-plus" className="p-button-rounded p-button-success ml-2"></Button>
                                    <Button type="button" icon="pi pi-minus" className="p-button-rounded p-button-danger ml-2"></Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Dialog>

                <Dialog visible={editCicdDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Edit cicd" modal className="p-fluid" footer={editCicdDialogFooter} onHide={hideDialog}>
                    {/* {cicd.image && <img src={`https://primefaces.org/cdn/primereact/images/cicd/${cicd.image}`} alt={cicd.image} className="cicd-image block m-auto pb-3" />} */}
                    <div className="field">
                        <label htmlFor="name" className="font-bold">
                            Name
                        </label>
                        <InputText id="name" value={cicd.itemName} onChange={(e) => onInputChange(e, 'itemName')} required autoFocus className={classNames({ 'p-invalid': submitted && !cicd.itemName })} />
                        {submitted && !cicd.itemName && <small className="p-error">Name is required.</small>}
                    </div>
                </Dialog>

                <Dialog visible={deleteCicdDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteCicdDialogFooter} onHide={hideDeleteCicdDialog}>
                    <div className="confirmation-content">
                        <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                        {cicd && (
                            <span>
                                Are you sure you want to delete <b>{cicd.name}</b>?
                            </span>
                        )}
                    </div>
                </Dialog>

                <Dialog visible={deleteCicdsDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteCicdsDialogFooter} onHide={hideDeleteCicdsDialog}>
                    <div className="confirmation-content">
                        <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                        {cicd && <span>Are you sure you want to delete the selected cicds?</span>}
                    </div>
                </Dialog>

                <Dialog visible={showCicdDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Cicd Details" modal className="p-fluid" footer={showCicdDialogFooter} onHide={hideDialog}>
                    <div>
                        <DataTable value={showCicdData} selection={selectedItems} onSelectionChange={(e) => setSelectedItems(e.value)}
                            dataKey="_id" paginator rows={20} rowsPerPageOptions={[25, 50, 100]}
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} cicds" globalFilter={globalFilter} header={header}>
                            <Column selectionMode="single" exportable={false}></Column>
                            <Column field="buildNumber" header="Name" sortable style={{ minWidth: '16rem' }}></Column>
                            <Column field="status" header="Status" body={statusBodyTemplate} sortable style={{ minWidth: '5rem' }}></Column>
                            <Column field={updated} header="Updated" sortable></Column>
                            <Column field={created} header="Created" sortable></Column>
                            <Column header="Action" body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
                        </DataTable>
                    </div>
                </Dialog>

            </div>
        </>
    )
}

export default Dashboard;