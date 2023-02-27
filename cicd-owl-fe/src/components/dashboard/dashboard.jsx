import React, { useState, useRef, useEffect } from 'react';
import './dashboard.css'
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { DataTable } from 'primereact/datatable';
import { Toolbar } from 'primereact/toolbar';
import { Column } from 'primereact/column';
import { InputText } from "primereact/inputtext";
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';


function Dashboard() {
    const navigate = useNavigate();
    let toast = useRef(null);
    let [cicdData, setCicdData] = useState([]);
    const [selectedItems, setSelectedItems] = useState(null);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [deleteItemsDialog, setDeleteItemsDialog] = useState(false);

    let openNew = () => {
        // setProduct(emptyProduct);
        // setSubmitted(false);
        // setProductDialog(true);
    };


    useEffect(() => {
        let token = localStorage.getItem('token');
        if (token) {
            const validateToken = async () => {
                let res = await fetch('http://192.168.10.108:8888/users/login/token', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "data": token
                    })
                })
                if (res.status === 200) {
                    await fetch('http://192.168.10.108:8888/cicds').then(res => res.json()).then((res) => {
                        setCicdData(res.data)
                        console.log(cicdData)
                    });
                }
                else if (res.status === 401) {
                    navigate("/login");
                }
            }
            validateToken();
        }
        else {
            navigate("/login");
        }
    }, []);

    const confirmDeleteSelected = () => {
        setDeleteItemsDialog(true);
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
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" />
                <Button icon="pi pi-trash" rounded outlined severity="danger" />
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
        let date = new Date(cicdData.updatedAt).toLocaleString("en-US", {timeZone: "America/New_York",timeStyle: "short",dateStyle: "short"});
        return date;
    }
    const created = (cicdData) => {
        let date = new Date(cicdData.createdAt).toLocaleString("en-US", {timeZone: "America/New_York",timeStyle: "short",dateStyle: "short"});
        return date;
    }

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Manage Products</h4>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </span>
        </div>
    );

    // const footer = `In total there are ${cicdData ? cicdData.length : 0} products.`;

    return (
        <>
            <Button label="Logout" type="logout" className="p-button-danger logout-button" onClick={() => LogoutClick()} />
            <Toast ref={toast} />

            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
            <DataTable value={cicdData} selection={selectedItems} onSelectionChange={(e) => setSelectedItems(e.value)}
                dataKey="_id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products" globalFilter={globalFilter} header={header}>
                <Column selectionMode="multiple" exportable={false}></Column>
                <Column field="itemName" header="Name" sortable style={{ minWidth: '16rem' }}></Column>
                <Column field="status" header="Status" body={statusBodyTemplate} sortable style={{ minWidth: '5rem' }}></Column>
                <Column field={updated} header="Updated" sortable></Column>
                <Column field={created} header="Created" sortable></Column>
                <Column header="Action" body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
            </DataTable>
        </>
    )
}

export default Dashboard;