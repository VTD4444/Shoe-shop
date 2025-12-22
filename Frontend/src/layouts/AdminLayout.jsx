import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // 1. Import cái này
import { MdSpaceDashboard } from 'react-icons/md';
import { FaBox, FaShoppingCart, FaUserFriends } from 'react-icons/fa';

const SideBar_Admin = () => {
    const navigate = useNavigate(); // Dùng để chuyển trang
    const location = useLocation(); // Dùng để lấy URL hiện tại

    const menuItems = [
        // path: Đường dẫn tương ứng khi bấm vào
        { name: 'Dashboard', icon: <MdSpaceDashboard />, path: '/admin' },
        { name: 'Sản phẩm', icon: <FaBox />, path: '/admin/products' },
        { name: 'Đơn hàng', icon: <FaShoppingCart />, path: '/admin/orders' },
        { name: 'Khách hàng', icon: <FaUserFriends />, path: '/admin/users' },
    ];

    return (
        <div className="py-6 px-4">
            <div className="mb-6 px-4 font-bold text-2xl text-blue-600">
                Shoe Admin
            </div>

            <div className="space-y-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <div
                            key={item.name}
                            onClick={() => navigate(item.path)}
                            className={isActive ? 'bg-blue-600 text-white' : ''}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SideBar_Admin;