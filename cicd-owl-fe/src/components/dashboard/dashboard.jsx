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
import CicdItem from './cicd/cicd'


function Dashboard() {
    let emptyCicd = {
        id: null,
        name: '',
        image: null,
        description: '',
        category: null,
        price: 0,
        quantity: 0,
        rating: 0,
        inventoryStatus: 'INSTOCK'
    };
    const navigate = useNavigate();
    let toast = useRef(null);
    let [cicdData, setCicdData] = useState([]);
    const [selectedItems, setSelectedItems] = useState(null);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [cicd, setCicd] = useState(emptyCicd);
    const [cicdDialog, setCicdDialog] = useState(false);
    const [cicds, setCicds] = useState(null);
    const [deleteCicdDialog, setDeleteCicdDialog] = useState(false);
    const [deleteCicdsDialog, setDeleteCicdsDialog] = useState(false);
    const [selectedCicds, setSelectedCicds] = useState(null);
    const dt = useRef(null);

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
                        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Login Success' });
                        // console.log(cicdData)
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

    let openNew = () => {
        setCicd(emptyCicd);
        setSubmitted(false);
        setCicdDialog(true);
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
    };

    const deleteCicd = () => {
        let _cicd = cicds.filter((val) => val.id !== cicd.id);

        setCicds(_cicd);
        setDeleteCicdDialog(false);
        setCicd(emptyCicd);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
    };

    const deleteSelectedCicds = () => {
        let _cicd = cicds.filter((val) => !selectedCicds.includes(val));

        setCicds(_cicd);
        setDeleteCicdsDialog(false);
        setSelectedCicds(null);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Cicds Deleted', life: 3000 });
    };

    const saveCicd = () => {
        console.log("Cicd Save...")
    }

    const cicdDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveCicd} />
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
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Logout Success' });
        setTimeout(() => {
            navigate("/login");
        }, 5000);

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
        let date = new Date(cicdData.updatedAt).toLocaleString("en-US", { timeZone: "America/New_York", timeStyle: "short", dateStyle: "short" });
        return date;
    }
    const created = (cicdData) => {
        let date = new Date(cicdData.createdAt).toLocaleString("en-US", { timeZone: "America/New_York", timeStyle: "short", dateStyle: "short" });
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

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _cicd = { ...cicd };

        _cicd[`${name}`] = val;

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

    let openCicd = async (cicdId) => {
        console.log(cicdId)
        navigate("/cicd");
    }
    // const footer = `In total there are ${cicdData ? cicdData.length : 0} cicds.`;

    return (
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
                {cicd.image && <img src={`https://primefaces.org/cdn/primereact/images/cicd/${cicd.image}`} alt={cicd.image} className="cicd-image block m-auto pb-3" />}
                <div className="field">
                    <label htmlFor="name" className="font-bold">
                        Name
                    </label>
                    <InputText id="name" value={cicd.name} onChange={(e) => onInputChange(e, 'name')} required autoFocus className={classNames({ 'p-invalid': submitted && !cicd.name })} />
                    {submitted && !cicd.name && <small className="p-error">Name is required.</small>}
                </div>
                <div className="field">
                    <label htmlFor="description" className="font-bold">
                        Description
                    </label>
                    <InputTextarea id="description" value={cicd.description} onChange={(e) => onInputChange(e, 'description')} required rows={3} cols={20} />
                </div>

                <div className="field">
                    <label className="mb-3 font-bold">Category</label>
                    <div className="formgrid grid">
                        <div className="field-radiobutton col-6">
                            <RadioButton inputId="category1" name="category" value="Accessories" onChange={onCategoryChange} checked={cicd.category === 'Accessories'} />
                            <label htmlFor="category1">Accessories</label>
                        </div>
                        <div className="field-radiobutton col-6">
                            <RadioButton inputId="category2" name="category" value="Clothing" onChange={onCategoryChange} checked={cicd.category === 'Clothing'} />
                            <label htmlFor="category2">Clothing</label>
                        </div>
                        <div className="field-radiobutton col-6">
                            <RadioButton inputId="category3" name="category" value="Electronics" onChange={onCategoryChange} checked={cicd.category === 'Electronics'} />
                            <label htmlFor="category3">Electronics</label>
                        </div>
                        <div className="field-radiobutton col-6">
                            <RadioButton inputId="category4" name="category" value="Fitness" onChange={onCategoryChange} checked={cicd.category === 'Fitness'} />
                            <label htmlFor="category4">Fitness</label>
                        </div>
                    </div>
                </div>

                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="price" className="font-bold">
                            Price
                        </label>
                        <InputNumber id="price" value={cicd.price} onValueChange={(e) => onInputNumberChange(e, 'price')} mode="currency" currency="USD" locale="en-US" />
                    </div>
                    <div className="field col">
                        <label htmlFor="quantity" className="font-bold">
                            Quantity
                        </label>
                        <InputNumber id="quantity" value={cicd.quantity} onValueChange={(e) => onInputNumberChange(e, 'quantity')} />
                    </div>
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
        </div>
    )
}

export default Dashboard;