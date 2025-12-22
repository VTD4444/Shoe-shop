import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import addressService from '../../services/addressService';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const AddressBookPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [isEditing, setIsEditing] = useState(false); // Trạng thái đóng mở form
  const [editingId, setEditingId] = useState(null); // ID đang sửa (null nếu là thêm mới)
  
  const { register, handleSubmit, reset, setValue } = useForm();

  // 1. Load danh sách địa chỉ
  const fetchAddresses = async () => {
    try {
      const res = await addressService.getAll();
      setAddresses(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // 2. Xử lý mở form Thêm mới
  const handleAddNew = () => {
    setIsEditing(true);
    setEditingId(null);
    reset({ is_default: false }); // Reset form
  };

  // 3. Xử lý mở form Sửa
  const handleEdit = (addr) => {
    setIsEditing(true);
    setEditingId(addr.address_id); // Giả sử id là address_id
    // Fill data vào form
    setValue('recipient_name', addr.recipient_name);
    setValue('phone', addr.phone);
    setValue('city', addr.city);
    setValue('district', addr.district);
    setValue('ward', addr.ward);
    setValue('street', addr.street);
    setValue('is_default', addr.is_default);
  };

  // 4. Xử lý Submit Form (Add hoặc Update)
  const onSubmit = async (data) => {
    try {
      if (editingId) {
        // Update
        await addressService.update(editingId, data);
        toast.success("Cập nhật địa chỉ thành công");
      } else {
        // Create
        await addressService.create(data);
        toast.success("Thêm địa chỉ mới thành công");
      }
      setIsEditing(false);
      fetchAddresses(); // Reload list
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  // 5. Xử lý Xóa
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
      try {
        await addressService.delete(id);
        toast.success("Đã xóa địa chỉ");
        fetchAddresses();
      } catch (error) {
        toast.error("Không thể xóa địa chỉ");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-2xl font-black uppercase">Sổ địa chỉ</h2>
        {!isEditing && (
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 text-sm font-bold uppercase hover:bg-gray-800"
          >
            <FiPlus /> Thêm địa chỉ mới
          </button>
        )}
      </div>

      {/* FORM SECTION (Hiện khi bấm Thêm/Sửa) */}
      {isEditing && (
        <div className="bg-gray-50 p-6 mb-8 border border-black animate-fade-in">
          <h3 className="font-bold mb-4">{editingId ? 'CẬP NHẬT ĐỊA CHỈ' : 'THÊM ĐỊA CHỈ MỚI'}</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input {...register('recipient_name', { required: true })} placeholder="Tên người nhận" className="border p-3 w-full" />
              <input {...register('phone', { required: true })} placeholder="Số điện thoại" className="border p-3 w-full" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input {...register('city', { required: true })} placeholder="Tỉnh/Thành phố" className="border p-3 w-full" />
              <input {...register('district', { required: true })} placeholder="Quận/Huyện" className="border p-3 w-full" />
              <input {...register('ward', { required: true })} placeholder="Phường/Xã" className="border p-3 w-full" />
            </div>

            <input {...register('street', { required: true })} placeholder="Địa chỉ cụ thể (Số nhà, đường...)" className="border p-3 w-full" />

            <label className="flex items-center space-x-2">
              <input type="checkbox" {...register('is_default')} className="accent-black w-4 h-4" />
              <span className="text-sm font-medium">Đặt làm địa chỉ mặc định</span>
            </label>

            <div className="flex gap-4 pt-2">
              <button type="submit" className="bg-black text-white px-6 py-2 font-bold uppercase text-sm">Lưu lại</button>
              <button type="button" onClick={() => setIsEditing(false)} className="border border-black px-6 py-2 font-bold uppercase text-sm hover:bg-gray-100">Hủy</button>
            </div>
          </form>
        </div>
      )}

      {/* LIST SECTION */}
      <div className="space-y-4">
        {addresses.length === 0 && !isEditing && (
          <p className="text-gray-500 text-center py-8">Bạn chưa lưu địa chỉ nào.</p>
        )}

        {addresses.map((addr) => (
          <div key={addr.address_id} className="border p-4 flex justify-between items-start hover:border-black transition-colors bg-white">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-bold uppercase">{addr.recipient_name}</span>
                {addr.is_default && (
                  <span className="text-[10px] bg-black text-white px-2 py-0.5 font-bold uppercase">Mặc định</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-1">{addr.phone}</p>
              <p className="text-sm text-gray-500">
                {addr.street}, {addr.ward}, {addr.district}, {addr.city}
              </p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => handleEdit(addr)}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="Sửa"
              >
                <FiEdit2 />
              </button>
              <button 
                onClick={() => handleDelete(addr.address_id)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Xóa"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressBookPage;