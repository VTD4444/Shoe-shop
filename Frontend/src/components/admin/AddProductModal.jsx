import React, { useState } from 'react';

// Hardcoded for now as per existing pattern in EditProductModal
const adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYzQ4Nzg1MjYtNDYyNi00ZWM0LWI4ZDMtODE3MWM4NjhjNGUwIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY2Mzk0NjA1fQ._Yix4G-8VPJZ_V_E6abiNplMX71e0OiJjsFqQBjCM98";

const AddProductModal = ({ isOpen, onClose, metadata, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        base_price: '',
        brand_id: '',
        category_id: '',
        image_url: '',
        is_active: true
    });

    const handleSave = async () => {
        if (!formData.name || !formData.base_price) {
            alert("Vui lòng nhập tên và giá sản phẩm");
            return;
        }

        try {
            setIsLoading(true);

            const payload = {
                ...formData,
                base_price: Number(formData.base_price),
                brand_id: formData.brand_id ? Number(formData.brand_id) : null,
                category_id: formData.category_id ? Number(formData.category_id) : null
            };

            const response = await fetch(`http://localhost:5000/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                alert("Thêm sản phẩm thành công!");
                setFormData({
                    name: '',
                    description: '',
                    base_price: '',
                    brand_id: '',
                    category_id: '',
                    image_url: '',
                    is_active: true
                });
                onSuccess();
                onClose();
            } else {
                alert(data.message || "Có lỗi xảy ra");
            }

        } catch (error) {
            console.error("Error creating product:", error);
            alert("Lỗi kết nối server");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-fade-in-up">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Thêm Sản Phẩm Mới</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[80vh] bg-gray-50">
                    <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Nhập tên sản phẩm..."
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        {/* Price & Image */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc (VND) <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="0"
                                    value={formData.base_price}
                                    onChange={e => setFormData({ ...formData, base_price: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Link Ảnh (URL)</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="https://..."
                                    value={formData.image_url}
                                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Brand & Category */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.brand_id}
                                    onChange={e => setFormData({ ...formData, brand_id: e.target.value })}
                                >
                                    <option value="">-- Chọn thương hiệu --</option>
                                    {metadata?.brands?.map(b => (
                                        <option key={b.brand_id} value={b.brand_id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.category_id}
                                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                >
                                    <option value="">-- Chọn danh mục --</option>
                                    {metadata?.categories?.map(c => (
                                        <option key={c.category_id} value={c.category_id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                            <textarea
                                className="w-full border border-gray-300 rounded-lg p-2.5 h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder="Mô tả sản phẩm..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Active Status */}
                        <div>
                            <label className="inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={formData.is_active}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                <span className="ml-3 text-sm font-medium text-gray-700">Hiển thị sản phẩm ngay</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-70"
                    >
                        {isLoading ? 'Đang xử lý...' : 'Thêm Mới'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddProductModal;