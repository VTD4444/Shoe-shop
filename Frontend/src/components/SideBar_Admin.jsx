import React from 'react';
import { MdSpaceDashboard } from 'react-icons/md';
import { FaBox, FaShoppingCart, FaUserFriends } from 'react-icons/fa';

const SideBar_Admin = () => {
    const activeItem = 'Sản phẩm & Kho';

    const menuItems = [
        { name: 'Dashboard', icon: <MdSpaceDashboard className="text-xl" /> },
        { name: 'Sản phẩm & Kho', icon: <FaBox className="text-xl" /> },
        { name: 'Đơn hàng', icon: <FaShoppingCart className="text-xl" /> },
        { name: 'Khách hàng', icon: <FaUserFriends className="text-xl" /> },
    ];

    return (
        <div className="h-screen w-64 bg-white border-r border-gray-200 py-6 px-4 flex flex-col">
            <div className="space-y-2">
                {menuItems.map((item) => (
                    <div
                        key={item.name}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors font-medium ${activeItem === item.name
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`}>
                        {item.icon}
                        <span>{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SideBar_Admin;
