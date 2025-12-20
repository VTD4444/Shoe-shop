export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Hàm helper để hiển thị màu sắc trạng thái
export const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'text-green-600 bg-green-50 border-green-200';
    case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
    case 'shipped': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const getStatusText = (status) => {
   const map = {
     pending: 'Chờ xử lý',
     processing: 'Đang chuẩn bị',
     shipped: 'Đang giao',
     completed: 'Hoàn thành',
     cancelled: 'Đã hủy',
     returned: 'Trả hàng'
   };
   return map[status] || status;
};