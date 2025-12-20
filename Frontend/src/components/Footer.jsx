import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-4">SHOE.SHOP</h3>
            <p className="text-gray-400 text-sm">
              Nền tảng thương mại điện tử chuyên về giày dép công nghệ cao. 
              Trải nghiệm 3D và thử giày ảo độc đáo.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">MUA SẮM</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><button className="hover:text-white">Giày nam</button></li>
              <li><button className="hover:text-white">Giày nữ</button></li>
              <li><button className="hover:text-white">Khuyến mãi</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">HỖ TRỢ</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><button className="hover:text-white">Chính sách đổi trả</button></li>
              <li><button className="hover:text-white">Hướng dẫn chọn size</button></li>
              <li><button className="hover:text-white">Liên hệ</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">NEWSLETTER</h4>
            <div className="flex">
              <input 
                type="text" 
                placeholder="Email của bạn" 
                className="bg-gray-800 text-white px-4 py-2 w-full text-sm focus:outline-none"
              />
              <button className="bg-white text-black px-4 py-2 text-sm font-bold">GỬI</button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
          &copy; 2025 Smart-Step Tech. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;