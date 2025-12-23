import React, { useState } from 'react';

// Hardcoded for now
const adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYzQ4Nzg1MjYtNDYyNi00ZWM0LWI4ZDMtODE3MWM4NjhjNGUwIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY2Mzk0NjA1fQ._Yix4G-8VPJZ_V_E6abiNplMX71e0OiJjsFqQBjCM98";

const AddVariantModal = ({ isOpen, onClose, product, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);

    // Default form data
    const [formData, setFormData] = useState({
        sku: '',
        color_name: 'Đen',
        color_hex: '#000000',
        size: '40',
        stock_quantity: 0,
        price_modifier: 0
    });

    const handleSave = async () => {
        if (!formData.sku) {
            alert("Vui lòng nhập SKU");
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`http://localhost:5000/products/${product.product_id}/variants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                alert("Thêm biến thể thành công!");
                setFormData({
                    sku: '',
                    color_name: 'Đen',
                    color_hex: '#000000',
                    size: '40',
                    stock_quantity: 0,
                    price_modifier: 0
                });
                onSuccess();
                onClose();
            } else {
                alert(data.message || "Có lỗi xảy ra");
            }
        } catch (error) {
            console.error(error);
            alert("Lỗi kết nối");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-fade-in-up">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Thêm Biến Thể</h2>
                        <p className="text-sm text-gray-500 mt-1">Cho sản phẩm: <span className="font-semibold">{product?.product_name}</span></p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[80vh] bg-white">
                    <div className="space-y-4">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mã SKU <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase"
                                placeholder={`SKU-${product?.product_id?.slice(0, 4) || 'XXXX'}-...`}
                                value={formData.sku}
                                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên Màu</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.color_name}
                                    onChange={e => setFormData({ ...formData, color_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mã Màu (Hex)</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                                        value={formData.color_hex}
                                        onChange={e => setFormData({ ...formData, color_hex: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        className="flex-1 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                                        value={formData.color_hex}
                                        onChange={e => setFormData({ ...formData, color_hex: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="VN 40"
                                    value={formData.size}
                                    onChange={e => setFormData({ ...formData, size: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tồn</label>
                                <input
                                    type="number"
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.stock_quantity}
                                    onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá chênh lệch (Price Modifier)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    className="w-full border border-gray-300 rounded-lg p-2.5 pl-4 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.price_modifier}
                                    onChange={e => setFormData({ ...formData, price_modifier: e.target.value })}
                                />
                                <span className="absolute right-4 top-2.5 text-gray-400 font-medium">VND</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Ví dụ: Nhập 50000 nếu biến thể này đắt hơn giá gốc 50k.</p>
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
                        {isLoading ? 'Đang lưu...' : 'Lưu Biến Thể'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddVariantModal;
