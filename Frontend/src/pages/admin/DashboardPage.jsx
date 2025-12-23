import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaShoppingBag, FaClipboardList, FaExclamationTriangle } from 'react-icons/fa';

// START: API CONFIGURATION
// Note: Hardcoded token as found in InventoryPage.jsx. Should be moved to env/context in production.
const adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYzQ4Nzg1MjYtNDYyNi00ZWM0LWI4ZDMtODE3MWM4NjhjNGUwIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY2Mzk0NjA1fQ._Yix4G-8VPJZ_V_E6abiNplMX71e0OiJjsFqQBjCM98";
const BASE_URL = 'http://localhost:5000'; // Assuming base URL
// Endpoints assumed based on user request
const API_STATS = `${BASE_URL}/admin/stats`;
const API_TOP_SELLING = `${BASE_URL}/admin/top-selling`;
// END: API CONFIGURATION

const DashboardPage = () => {
    const [stats, setStats] = useState({
        revenue: 0,
        total_orders: 0,
        pending_orders: 0,
        low_stock_variants: 0
    });
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Stats
                const statsRes = await fetch(API_STATS, {
                    headers: { "Authorization": `Bearer ${adminToken}` }
                });
                const statsData = await statsRes.json();
                if (statsRes.ok) {
                    setStats(statsData.data);
                }

                // Fetch Top Selling
                const topRes = await fetch(API_TOP_SELLING, {
                    headers: { "Authorization": `Bearer ${adminToken}` }
                });
                const topData = await topRes.json();
                if (topRes.ok) {
                    setTopProducts(topData.data);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="p-10 text-center text-gray-500">Đang tải dữ liệu Dashboard...</div>;
    }

    const statCards = [
        {
            title: 'Doanh thu',
            value: formatCurrency(stats.revenue),
            icon: <FaMoneyBillWave className="w-6 h-6 text-green-600" />,
            color: 'bg-green-100',
            textColor: 'text-green-600'
        },
        {
            title: 'Tổng đơn hàng',
            value: stats.total_orders,
            icon: <FaShoppingBag className="w-6 h-6 text-blue-600" />,
            color: 'bg-blue-100',
            textColor: 'text-blue-600'
        },
        {
            title: 'Đơn chờ xử lý',
            value: stats.pending_orders,
            icon: <FaClipboardList className="w-6 h-6 text-orange-600" />,
            color: 'bg-orange-100',
            textColor: 'text-orange-600'
        },
        {
            title: 'Sắp hết hàng',
            value: stats.low_stock_variants,
            icon: <FaExclamationTriangle className="w-6 h-6 text-red-600" />,
            color: 'bg-red-100',
            textColor: 'text-red-600'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{card.value}</h3>
                        </div>
                        <div className={`p-3 rounded-lg ${card.color}`}>
                            {card.icon}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Top 5 Sản Phẩm Bán Chạy Nhất</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold text-center">
                            <tr>
                                <th className="px-4 py-3 text-left">Tên sản phẩm</th>
                                <th className="px-4 py-3">SKU</th>
                                <th className="px-4 py-3">Phân loại</th>
                                <th className="px-4 py-3">Đã bán</th>
                                <th className="px-4 py-3">Tồn kho</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700 text-center">
                            {topProducts.length > 0 ? (
                                topProducts.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50/50">
                                        <td className="px-4 py-3 font-medium text-gray-900 text-left">{item.product_name}</td>
                                        <td className="px-4 py-3 font-mono text-gray-500">{item.sku}</td>
                                        <td className="px-4 py-3">{item.attribute}</td>
                                        <td className="px-4 py-3 font-bold text-blue-600">{item.total_sold}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${item.current_stock <= 5 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700'}`}>
                                                {item.current_stock}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                        Chưa có dữ liệu bán hàng
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
