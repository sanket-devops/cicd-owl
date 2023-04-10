import React, { useState, useRef, useEffect } from 'react';
import './dashboard.css'
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Toolbar } from 'primereact/toolbar';
import { Column } from 'primereact/column';
import { InputText } from "primereact/inputtext";
import { InputTextarea } from 'primereact/inputtextarea';
import { RadioButton } from 'primereact/radiobutton';
import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { getAllCicd, validateToken } from '../../service/dashboard.service';


function Dashboard() {
    let emptyCicd = {
        "itemName": "",
        "status": "",
        "cicdStages": [],
        "cicdStagesOutput": []
    };
    const navigate = useNavigate();
    let toast = useRef(null);
    let [cicdData, setCicdData] = useState([]);
    let [showCicdData, setShowCicdData] = useState([]);
    const [selectedItems, setSelectedItems] = useState(null);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [cicd, setCicd] = useState(emptyCicd);
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
        fetch('http://192.168.10.108:8888/cicds/cicd-delete', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "data": cicd._id
            })
        })
        setTimeout(() => {
            loadData();
        }, 1000);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Cicd Deleted', life: 3000 });
        setDeleteCicdDialog(false);
        setCicd(emptyCicd);
    };

    const editCicdItem = (rowData) => {
        let _cicd = rowData;
        setCicd(_cicd)
        setEditCicdDialog(true)
        setSubmitted(false);
    };

    const deleteSelectedCicds = () => {
        let _cicd = cicds.filter((val) => !selectedCicds.includes(val));

        setCicds(_cicd);
        setDeleteCicdsDialog(false);
        setSelectedCicds(null);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Cicds Deleted', life: 3000 });
    };

    const saveCicd = () => {
        fetch('http://192.168.10.108:8888/cicds/cicd-save', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "data": cicd
            })
        })
        setTimeout(() => {
            loadData();
        }, 1000);
        setCicdDialog(false);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Cicds Saved', life: 3000 });
    }

    const updateCicd = () => {
        fetch('http://192.168.10.108:8888/cicds/update', {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "id": cicd._id,
                "data": cicd
            })
        })
        setTimeout(() => {
            loadData();
        }, 1000);
        setEditCicdDialog(false);
        setCicd(emptyCicd);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Cicds Updated', life: 3000 });
    }

    const cicdDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveCicd} />
        </React.Fragment>
    );
    const editCicdDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" onClick={updateCicd} />
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
                <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedItems || !selectedItems.length} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return <Button label="Export" icon="pi pi-upload" className="p-button-help" />;
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
        const val = (e.target && e.target.value) || '';
        let _cicd = { ...cicd };

        _cicd[`${itemName}`] = val;

        setCicd(_cicd);
    };

    const onCategoryChange = (e) => {
        let _cicd = { ...cicd };

        _cicd['category'] = e.value;
        setCicd(_cicd);
    };

    const onInputNumberChange = (e, name) => {
        const val = e.value || 0;
        let _cicd = { ...cicd };

        _cicd[`${name}`] = val;

        setCicd(_cicd);
    };
    // const footer = `In total there are ${cicdData ? cicdData.length : 0} cicds.`;

    return (
        <>
            <div>
                <Button label="Logout" type="logout" className="p-button-danger logout-button" onClick={() => LogoutClick()} />
                <Toast ref={toast} />
                <div className="card">
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                    {/* <DataTable value={cicdData} selection={selectedItems} onSelectionChange={(e) => setSelectedItems(e.value)} */}
                    <DataTable value={cicdData} selection={selectedItems} onSelectionChange={(e) => openCicd(e.value) && setSelectedItems(e.value)}
                        dataKey="_id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
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

                <Dialog visible={cicdDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="cicd Details" modal className="p-fluid" footer={cicdDialogFooter} onHide={hideDialog}>
                    {/* {cicd.image && <img src={`https://primefaces.org/cdn/primereact/images/cicd/${cicd.image}`} alt={cicd.image} className="cicd-image block m-auto pb-3" />} */}
                    <div className="field">
                        <label htmlFor="name" className="font-bold">
                            Name
                        </label>
                        <InputText id="name" value={cicd.itemName} onChange={(e) => onInputChange(e, 'itemName')} required autoFocus className={classNames({ 'p-invalid': submitted && !cicd.itemName })} />
                        {submitted && !cicd.itemName && <small className="p-error">Name is required.</small>}
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
                            dataKey="_id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
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