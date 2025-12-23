import React, { useState, useEffect, useCallback } from 'react';
// Import Modal
import EditProductModal from '../../components/admin/EditProductModal';
import AddProductModal from '../../components/admin/AddProductModal';

const BASE_URL = 'http://localhost:5000/products';
const API_INVENTORY = `${BASE_URL}/inventory`;
const adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYzQ4Nzg1MjYtNDYyNi00ZWM0LWI4ZDMtODE3MWM4NjhjNGUwIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY2Mzk0NjA1fQ._Yix4G-8VPJZ_V_E6abiNplMX71e0OiJjsFqQBjCM98";
const API_METADATA = `${BASE_URL}/filters`;

const IconSearch = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const IconFilter = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>);
const IconPlus = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>);
const IconLayers = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>);
const IconChevronDown = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>);

const InventoryPage = () => {
    const [data, setData] = useState([]);
    const [metadata, setMetadata] = useState({ brands: [], categories: [] });
    const [loading, setLoading] = useState(false);

    const [isEditMasterOpen, setIsEditMasterOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);

    const [filters, setFilters] = useState({
        page: 1, limit: 10, search: '', sort: 'latest', brand_id: '', category_id: ''
    });
    const [pagination, setPagination] = useState({ total_pages: 1, current_page: 1 });

    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const fetchInventory = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(API_INVENTORY, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${adminToken}`
                },
                body: JSON.stringify(filters),
            });
            const result = await response.json();
            if (response.ok) {
                setData(result.data);
                setPagination(result.meta);
            }
        } finally { setLoading(false); }
    }, [filters]);

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const res = await fetch(API_METADATA);
                const data = await res.json();
                setMetadata(data);
            } catch (e) { console.error(e) }
        };
        fetchMeta();
    }, []);

    useEffect(() => { fetchInventory(); }, [fetchInventory]);

    const handleEditProductClick = (product) => {
        setSelectedProduct(product);
        setIsEditMasterOpen(true);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-800">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản Lý Sản Phẩm & Kho</h1>
                    <p className="text-gray-500 text-sm mt-1">Quản lý danh sách sản phẩm, biến thể và tình trạng kho hàng</p>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-all"
                >
                    <IconPlus className="w-5 h-5" /> Thêm Mới
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-[400px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <IconSearch className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="Tìm tên sản phẩm hoặc mã SKU..."
                        className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <select
                        className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none"
                        value={filters.brand_id}
                        onChange={(e) => setFilters(prev => ({ ...prev, brand_id: e.target.value, page: 1 }))}
                    >
                        <option value="">Tất cả Thương hiệu</option>
                        {metadata.brands.map(b => <option key={b.brand_id} value={b.brand_id}>{b.name}</option>)}
                    </select>

                    <select
                        className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none"
                        value={filters.category_id}
                        onChange={(e) => setFilters(prev => ({ ...prev, category_id: e.target.value, page: 1 }))}
                    >
                        <option value="">Tất cả Danh mục</option>
                        {metadata.categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
                    </select>

                    <select
                        className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none"
                        value={filters.sort}
                        onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value, page: 1 }))}
                    >
                        <option value="latest">Mới nhất</option>
                        <option value="stock_asc">Tồn kho tăng dần</option>
                        <option value="stock_desc">Tồn kho giảm dần</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">Đang tải dữ liệu...</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4 w-[10%]">Hình ảnh</th>
                                <th className="px-6 py-4 w-[25%]">Thông tin sản phẩm</th>
                                <th className="px-6 py-4 w-[45%]">Danh sách biến thể & Tồn kho</th>
                                <th className="px-6 py-4 w-[20%] text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.map((product) => (
                                <tr key={product.product_id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-5 align-top">
                                        <div className="w-20 h-20 rounded-lg border border-gray-100 overflow-hidden bg-white p-1 shadow-sm">
                                            <img src={product.image} alt="" className="w-full h-full object-contain" onError={(e) => e.target.src = 'https://via.placeholder.com/150'} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 align-top">
                                        <h3 className="text-base font-bold text-gray-900 mb-1">{product.product_name}</h3>
                                        <div className="text-sm text-gray-500 space-y-1">
                                            <p>Thương hiệu: <span className="text-gray-700 font-medium">{product.brand_name || '---'}</span></p>
                                            <p>Loại: <span className="text-gray-700 font-medium">{product.category_name || '---'}</span></p>
                                            <p className="text-blue-600 font-bold text-base mt-2">{formatCurrency(product.variants[0]?.original_price || 0)}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 align-top">
                                        <div className="space-y-3">
                                            {product.variants.map((variant) => (
                                                <div key={variant.variant_id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-gray-800">{variant.attribute}</span>
                                                        <span className="text-[11px] text-gray-400 font-mono uppercase mt-0.5">{variant.sku || 'NO-SKU'}</span>
                                                    </div>
                                                    <span className={`px-2.5 py-1 rounded text-xs font-bold min-w-[30px] text-center ${variant.stock_quantity <= 5 ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-700'}`}>
                                                        {variant.stock_quantity}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 align-top text-right">
                                        <div className="flex flex-col gap-2 items-end">
                                            <button
                                                onClick={() => alert("Tính năng thêm biến thể chưa làm")}
                                                className="flex items-center justify-center gap-1.5 w-40 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all"
                                            >
                                                <IconPlus className="w-4 h-4" /> Thêm biến thể
                                            </button>
                                            <button
                                                onClick={() => handleEditProductClick(product)}
                                                className="flex items-center justify-center gap-1.5 w-40 px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg shadow-sm transition-all"
                                            >
                                                <IconLayers className="w-4 h-4" /> Sửa sản phẩm
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODALS */}
            {isEditMasterOpen && selectedProduct && (
                <EditProductModal
                    isOpen={isEditMasterOpen}
                    onClose={() => setIsEditMasterOpen(false)}
                    product={selectedProduct}
                    metadata={metadata}
                    onSuccess={fetchInventory}
                />
            )}

            {isAddOpen && (
                <AddProductModal
                    isOpen={isAddOpen}
                    onClose={() => setIsAddOpen(false)}
                    metadata={metadata}
                    onSuccess={fetchInventory}
                />
            )}
        </div>
    );
};

export default InventoryPage;