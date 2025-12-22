import React, { useState, useEffect } from 'react';

const adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYzQ4Nzg1MjYtNDYyNi00ZWM0LWI4ZDMtODE3MWM4NjhjNGUwIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY2Mzk0NjA1fQ._Yix4G-8VPJZ_V_E6abiNplMX71e0OiJjsFqQBjCM98";

const EditProductModal = ({ isOpen, onClose, product, metadata, onSuccess }) => {
    const [activeTab, setActiveTab] = useState('general');
    const [isLoading, setIsLoading] = useState(false);

    // State cho thông tin chung
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        base_price: 0,
        brand_id: '',
        category_id: '',
        is_active: true,
        ar_model_url: ''
    });

    // State cho danh sách variants
    const [variants, setVariants] = useState([]);

    useEffect(() => {
        if (product && isOpen) {
            setFormData({
                name: product.product_name || '',
                description: product.description || '',
                base_price: product.variants[0]?.original_price || 0, // Lấy giá gốc từ variant đầu tiên hoặc product nếu có
                brand_id: product.brand_id || '',
                category_id: product.category_id || '',
                is_active: product.status !== 'inactive', // Giả sử logic là vậy
                ar_model_url: product.ar_model_url || ''
            });

            // Map variants data
            setVariants(product.variants.map(v => ({
                variant_id: v.variant_id,
                sku: v.sku || '',
                attribute: v.attribute || '',
                stock_quantity: v.stock_quantity || 0,
                final_price: v.final_price || 0, // Giá bán (Backend sẽ tự tính modifier)
            })));
        }
    }, [product, isOpen]);

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);

            const payload = {
                ...formData,
                base_price: Number(formData.base_price),
                variants_update: variants.map(v => ({
                    variant_id: v.variant_id,
                    stock_quantity: Number(v.stock_quantity),
                    final_price: Number(v.final_price),
                    sku: v.sku
                }))
            };

            const response = await fetch(`http://localhost:5000/products/${product.product_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                alert("Cập nhật thành công!");
                onSuccess(); // Reload table
                onClose();
            } else {
                alert(data.message || "Có lỗi xảy ra");
            }

        } catch (error) {
            console.error("Error updating product:", error);
            alert("Lỗi kết nối server");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Sửa sản phẩm: {formData.name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'general' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('general')}
                    >
                        Thông tin chung
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'variants' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('variants')}
                    >
                        Biến thể & Giá
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">

                    {/* --- TAB GENERAL --- */}
                    {activeTab === 'general' && (
                        <div className="space-y-4 max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.brand_id}
                                        onChange={e => setFormData({ ...formData, brand_id: Number(e.target.value) })}
                                    >
                                        <option value="">Chọn thương hiệu</option>
                                        {metadata.brands.map(b => (
                                            <option key={b.brand_id} value={b.brand_id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.category_id}
                                        onChange={e => setFormData({ ...formData, category_id: Number(e.target.value) })}
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {metadata.categories.map(c => (
                                            <option key={c.category_id} value={c.category_id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc (Base Price)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded-lg p-2.5 pl-4 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.base_price}
                                        onChange={e => setFormData({ ...formData, base_price: e.target.value })}
                                    />
                                    <span className="absolute right-4 top-2.5 text-gray-400 font-medium">VND</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Lưu ý: Thay đổi giá gốc sẽ ảnh hưởng đến tính toán giá của các biến thể.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg p-2.5 h-32 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.is_active}
                                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-700">Đang hoạt động (Hiển thị sản phẩm)</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* --- TAB VARIANTS --- */}
                    {activeTab === 'variants' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100 uppercase text-xs font-semibold text-gray-600">
                                    <tr>
                                        <th className="px-4 py-3">Biến thể</th>
                                        <th className="px-4 py-3">SKU</th>
                                        <th className="px-4 py-3 text-right">Giá bán (VND)</th>
                                        <th className="px-4 py-3 text-center">Tồn kho</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {variants.map((v, idx) => (
                                        <tr key={v.variant_id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-800">{v.attribute}</td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    className="w-full border border-gray-300 rounded px-2 py-1.5 focus:border-blue-500 outline-none text-xs"
                                                    value={v.sku}
                                                    onChange={e => handleVariantChange(idx, 'sku', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <input
                                                    type="number"
                                                    className="w-32 border border-gray-300 rounded px-2 py-1.5 focus:border-blue-500 outline-none text-right font-mono"
                                                    value={v.final_price}
                                                    onChange={e => handleVariantChange(idx, 'final_price', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <input
                                                    type="number"
                                                    className={`w-20 border rounded px-2 py-1.5 outline-none text-center font-bold ${v.stock_quantity < 10 ? 'text-red-500 border-red-200 bg-red-50' : 'border-gray-300'}`}
                                                    value={v.stock_quantity}
                                                    onChange={e => handleVariantChange(idx, 'stock_quantity', e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {variants.length === 0 && (
                                <div className="p-8 text-center text-gray-400">Sản phẩm này chưa có biến thể nào.</div>
                            )}
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-3 transition-all">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-70"
                    >
                        {isLoading && <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        {isLoading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProductModal;