import React, { useState } from 'react'; 
import { MdSpaceDashboard } from 'react-icons/md';
import { FaBox, FaShoppingCart, FaUserFriends } from 'react-icons/fa';

const SideBar_Admin = () => {
    const [dangChon, setDangChon] = useState('Dashboard');

    const menuItems = [
        { name: 'Dashboard', icon: <MdSpaceDashboard /> },
        { name: 'Sản phẩm & Kho', icon: <FaBox /> },
        { name: 'Đơn hàng', icon: <FaShoppingCart /> },
        { name: 'Khách hàng', icon: <FaUserFriends /> },
    ];

    return (
        <div>
            <h3>Bạn đang chọn: {dangChon}</h3>

            {menuItems.map((item) => (
                <div
                    key={item.name}

                    onClick={() => setDangChon(item.name)}

                    // 4. Logic đổi màu: Nếu tên trùng với cái đang chọn thì màu Đỏ, ko thì Đen
                    style={{ color: dangChon === item.name ? 'red' : 'black', cursor: 'pointer' }}
                >
                    {item.icon} {item.name}
                </div>
            ))}
        </div>
    );
};

export default SideBar_Admin;