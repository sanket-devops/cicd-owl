import React, { useState, useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import './cicd.css'
import { CicdService } from '../../../service/cicd.service';
import { Button } from 'primereact/button';
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { Rating } from 'primereact/rating';
import { Tag } from 'primereact/tag';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { validateToken } from '../../../service/dashboard.service';

export default function Cicd(props) {
    const location = useLocation();
    const navigate = useNavigate();
    let toast = useRef(null);
    // const [products, setProducts] = useState([]);
    const [cicd, setCicd] = useState({});
    const [cicdStagesData, setCicdStagesData] = useState([]);
    const [cicdStageData, setCicdStageData] = useState([]);
    const [layout, setLayout] = useState('list');
    const [selectedItems, setSelectedItems] = useState(null);
    const [globalFilter, setGlobalFilter] = useState(null);



    let loadDataCicd = async () => {
        setCicd(location.state)
        setCicdStagesData(location.state.cicdStagesOutput)
        let _stageData = [];
        for (const stages of cicdStagesData) {
            _stageData.push({ "stage": stages.cicdStageOutput })
        }
        setCicdStageData(_stageData)
        console.log(cicdStageData)

    };

    useEffect(() => {
        let token = localStorage.getItem('token');
        if (token) {
            (async function () {
                let res = await validateToken(token);
                if (res.status === 200) {
                    loadDataCicd();
                    // setCicdStagesData(location.state.cicdStagesOutput)
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

    // const getSeverity = (product) => {
    //     switch (product.inventoryStatus) {
    //         case 'INSTOCK':
    //             return 'success';

    //         case 'LOWSTOCK':
    //             return 'warning';

    //         case 'OUTOFSTOCK':
    //             return 'danger';

    //         default:
    //             return null;
    //     }
    // };

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

    const loadStage = () => {
        // console.log(cicdStageData)

        for (let id = 0; id < cicdStagesData.length; id++) {
            console.log(cicdStagesData[id])
            
        }

        for (const stages of cicdStagesData) {
            for (const stage of stages.cicdStageOutput) {
                // console.log(stages[])
                // return (
                //     <div className="flex align-items-center gap-2">
                //         <div className="p-4 border-1 surface-border surface-card border-round">
                //             <div className="flex flex-wrap align-items-center justify-content-between gap-2">
                //                 <div className="flex align-items-center gap-2">{stage.stageName}
                                
                //                 </div>
                //             </div>
                //         </div>
                //         <div className="p-4 border-1 surface-border surface-card border-round">
                //             <div className="flex flex-wrap align-items-center justify-content-between gap-2">
                //                 <div className="flex align-items-center gap-2">{stage.status}
                //                 </div>
                //             </div>
                //         </div>
                //     </div>
                // )
            }

        }

    }

    const listItem = (cicd, stageData) => {
        return (
            <div className="col-12">
                <div className="flex flex-column xl:flex-row xl:align-items-start p-4 gap-4">
                    {/* <img className="w-9 sm:w-16rem xl:w-10rem shadow-2 block xl:block mx-auto border-round" src={`https://primefaces.org/cdn/primereact/images/product/${product.image}`} alt={product.name} /> */}
                    <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
                        <div className="flex flex-column align-items-center sm:align-items-start gap-3">
                            <div className="text-2xl font-bold text-900">{cicd.buildNumber}
                                <div className="flex align-items-center gap-3">
                                    <div className="flex flex-wrap align-items-center justify-content-between gap-2">
                                        <div className="flex align-items-center gap-2">
                                            {/* {loadStage()} */}

                                        </div>

                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
                            {/* <span className="text-2xl font-semibold">${cicd.endTime}</span> */}
                            {/* <Button icon="pi pi-shopping-cart" className="p-button-rounded" disabled={cicd.inventoryStatus === 'OUTOFSTOCK'}></Button> */}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const gridItem = (cicd, stageData) => {
        return (
            <div>

                <div className="col-12 sm:col-6 lg:col-12 xl:col-4 p-2">
                    <div className="p-4 border-1 surface-border surface-card border-round">
                        <div className="flex flex-wrap align-items-center justify-content-between gap-2">
                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-tag"></i>
                                <span className="font-semibold">{cicd.buildNumber}</span>
                            </div>
                            <Tag value={cicd.status} severity={getSeverity(cicd)}></Tag>
                        </div>
                        <div className="flex flex-wrap align-items-center justify-content-between gap-2">
                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-tag"></i>
                                {/* <span className="font-semibold">{cicd.cicdStagesOutput.stageName}</span> */}

                            </div>
                            <Tag value={stageData.status} severity={getSeverity(stageData)}></Tag>
                        </div>
                        {/* <div className="flex flex-column align-items-center gap-3 py-5">
                        <img className="w-9 shadow-2 border-round" src={`https://primefaces.org/cdn/primereact/images/product/${product.image}`} alt={product.name} />
                        <div className="text-2xl font-bold">{product.name}</div>
                        <Rating value={product.rating} readOnly cancel={false}></Rating>
                    </div>
                    <div className="flex align-items-center justify-content-between">
                        <span className="text-2xl font-semibold">${product.price}</span>
                        <Button icon="pi pi-shopping-cart" className="p-button-rounded" disabled={product.inventoryStatus === 'OUTOFSTOCK'}></Button>
                    </div> */}
                    </div>
                </div>
            </div>
        );
    };

    // const gridItem = (product) => {
    //     return (
    //         <div className="col-12 sm:col-6 lg:col-12 xl:col-4 p-2">
    //             <div className="p-4 border-1 surface-border surface-card border-round">
    //                 <div className="flex flex-wrap align-items-center justify-content-between gap-2">
    //                     <div className="flex align-items-center gap-2">
    //                         <i className="pi pi-tag"></i>
    //                         <span className="font-semibold">{product.category}</span>
    //                     </div>
    //                     <Tag value={product.inventoryStatus} severity={getSeverity(product)}></Tag>
    //                 </div>
    //                 <div className="flex flex-column align-items-center gap-3 py-5">
    //                     <img className="w-9 shadow-2 border-round" src={`https://primefaces.org/cdn/primereact/images/product/${product.image}`} alt={product.name} />
    //                     <div className="text-2xl font-bold">{product.name}</div>
    //                     <Rating value={product.rating} readOnly cancel={false}></Rating>
    //                 </div>
    //                 <div className="flex align-items-center justify-content-between">
    //                     <span className="text-2xl font-semibold">${product.price}</span>
    //                     <Button icon="pi pi-shopping-cart" className="p-button-rounded" disabled={product.inventoryStatus === 'OUTOFSTOCK'}></Button>
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // };

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

    const itemTemplate = (cicdStagesData, layout) => {
        if (!cicdStagesData) {
            return;
        }
        else if (layout === 'grid') return gridItem(cicdStagesData, cicdStageData);
        if (layout === 'list') return listItem(cicdStagesData, cicdStageData);
    };

    const header = () => {
        return (
            <div className="flex justify-content-end">
                <DataViewLayoutOptions layout={layout} onChange={(e) => setLayout(e.value)} />
            </div>
        );
    };

    const statusBodyTemplate = (rowData) => {
        return <Tag value={rowData.status} severity={getSeverity(rowData)}></Tag>;
    };


    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-play" rounded outlined className="mr-2" />
                {/* <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={(e) => editCicdItem(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={(e) => deleteCicdItem(rowData)} /> */}
            </React.Fragment>
        );
    };

    return (
        <div className="card">
            <Toast ref={toast} />
            <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>
            <DataView value={cicdStagesData} itemTemplate={itemTemplate} layout={layout} header={header()} />
            {/* <div> */}
            {/* <DataTable value={cicdStagesData} selection={selectedItems} onSelectionChange={(e) => setSelectedItems(e.value)}
                    dataKey="_id" paginator rows={20} rowsPerPageOptions={[25, 50, 100]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} cicds" globalFilter={globalFilter} header={header}> */}
            {/* <Column selectionMode="single" exportable={false}></Column> */}
            {/* <Column field="buildNumber" header="Build No." sortable style={{ minWidth: '5rem' }}></Column> */}
            {/* <Column field="buildNumber" header="Name" sortable style={{ minWidth: '16rem' }}></Column> */}
            {/* <Column field="status" header="Status" body={statusBodyTemplate} sortable style={{ minWidth: '5rem' }}></Column> */}
            {/* <Column field={startTime} header="Start" sortable></Column>
                            <Column field={endTime} header="End" sortable></Column> */}
            {/* <Column header="Action" body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column> */}
            {/* </DataTable> */}
            {/* </div> */}
        </div>
    )
}
