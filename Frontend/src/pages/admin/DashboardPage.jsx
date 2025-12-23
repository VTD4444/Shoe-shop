import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMoneyBillWave, FaShoppingBag, FaClipboardList, FaExclamationTriangle, FaCalendarAlt } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import axiosClient from '../../services/axiosClient';

const DashboardPage = () => {
    const [stats, setStats] = useState({
        revenue: 0,
        total_orders: 0,
        pending_orders: 0,
        low_stock_variants: 0
    });
    const [topProducts, setTopProducts] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [timeRange, setTimeRange] = useState('7days');
    const [loading, setLoading] = useState(true);

    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, topRes] = await Promise.all([
                    axiosClient.get('/dashboard/stats'),
                    axiosClient.get('/dashboard/top-products')
                ]);

                if (statsRes && statsRes.data) {
                    setStats(statsRes.data);
                }

                if (topRes && topRes.data) {
                    setTopProducts(topRes.data);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchRevenue = async () => {
            try {
                const res = await axiosClient.get(`/dashboard/revenue-chart?period=${timeRange}`);
                if (res && res.data) {
                    const formattedData = res.data.map(item => ({
                        ...item,
                        displayDate: new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
                    }));
                    setRevenueData(formattedData);
                }
            } catch (error) {
                console.error("Error fetching revenue data:", error);
            }
        };
        fetchRevenue();
    }, [timeRange]);

    if (loading) {
        return <div className="p-10 text-center text-gray-500">Đang tải dữ liệu Dashboard...</div>;
    }

    const statCards = [
        {
            title: 'Doanh thu',
            value: formatCurrency(stats.revenue),
            icon: <FaMoneyBillWave className="w-6 h-6 text-green-600" />,
            color: 'bg-green-100',
            textColor: 'text-green-600',
            link: '/admin/orders'
        },
        {
            title: 'Tổng đơn hàng',
            value: stats.total_orders,
            icon: <FaShoppingBag className="w-6 h-6 text-blue-600" />,
            color: 'bg-blue-100',
            textColor: 'text-blue-600',
            link: '/admin/orders'
        },
        {
            title: 'Đơn chờ xử lý',
            value: stats.pending_orders,
            icon: <FaClipboardList className="w-6 h-6 text-orange-600" />,
            color: 'bg-orange-100',
            textColor: 'text-orange-600',
            link: '/admin/orders?status=pending'
        },
        {
            title: 'Sắp hết hàng',
            value: stats.low_stock_variants,
            icon: <FaExclamationTriangle className="w-6 h-6 text-red-600" />,
            color: 'bg-red-100',
            textColor: 'text-red-600',
            link: '/admin/products'
        }
    ];

    const getStockStatusColor = (status) => {
        switch (status) {
            case 'In Stock': return 'text-green-600 bg-green-100';
            case 'Out of Stock': return 'text-red-600 bg-red-100';
            case 'Low Stock': return 'text-orange-600 bg-orange-100';
            case 'High Stock': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => (
                    <Link to={card.link} key={index} className="block">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition-transform hover:scale-105 duration-200 cursor-pointer h-full">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                                <h3 className="text-2xl font-bold text-gray-800 mt-1">{card.value}</h3>
                            </div>
                            <div className={`p-3 rounded-lg ${card.color}`}>
                                {card.icon}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Revenue Chart Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FaMoneyBillWave className="text-green-600" />
                        Biểu đồ Doanh thu
                    </h2>
                    <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="bg-transparent border-none text-sm focus:ring-0 text-gray-700 font-medium py-1 px-2 cursor-pointer outline-none"
                        >
                            <option value="7days">7 ngày qua</option>
                            <option value="30days">30 ngày qua</option>
                            <option value="90days">90 ngày qua</option>
                        </select>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="displayDate"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                tickFormatter={(value) => `${value / 1000000}M`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                                labelStyle={{ color: '#6B7280', marginBottom: '4px' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#10B981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-800">Hiệu quả Kinh doanh theo Loại</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">PRODUCT</th>
                                <th className="px-6 py-4">VARIANT (SIZE/COLOR)</th>
                                <th className="px-6 py-4 text-center">TOTAL SOLD</th>
                                <th className="px-6 py-4 text-right">STOCK STATUS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {topProducts.length > 0 ? (
                                topProducts.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                                    {item.product_image ? (
                                                        <img
                                                            src={item.product_image}
                                                            alt={item.product_name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <FaShoppingBag />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{item.product_name}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">SKU: {item.sku}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 font-medium">
                                            {item.variant}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-md font-bold text-xs">
                                                {item.total_sold} Sold
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="font-bold text-gray-900">{item.current_stock}</span>
                                                <span className={`text-[10px] uppercase font-bold tracking-wider ${item.stock_status === 'In Stock' ? 'text-green-500' :
                                                    item.stock_status === 'Out of Stock' ? 'text-red-500' :
                                                        item.stock_status === 'Low Stock' ? 'text-orange-500' : 'text-blue-500'
                                                    }`}>
                                                    {item.stock_status}
                                                </span>
                                                {/* Progress bar visual for stock */}
                                                <div className="w-24 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${item.stock_status === 'In Stock' ? 'bg-green-500' :
                                                            item.stock_status === 'Out of Stock' ? 'bg-red-500' :
                                                                item.stock_status === 'Low Stock' ? 'bg-orange-500' : 'bg-blue-500'
                                                            }`}
                                                        style={{ width: `${Math.min((item.current_stock / 100) * 100, 100)}%` }} // Giả sử max stock visual là 100
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <FaShoppingBag className="w-8 h-8 text-gray-300" />
                                            <p>Chưa có dữ liệu bán hàng</p>
                                        </div>
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
