// Trích xuất mã đơn hàng từ content, ví dụ: "DH1001 chuyen tien" => "DH1001"
export function extractOrderId(content) {
  if (!content) return null;
  const match = content.match(/(DH\d+)/i);
  return match ? match[1] : null;
}
