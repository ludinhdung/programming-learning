/**
 * Định dạng ngày tháng theo định dạng cụ thể
 * @param dateString - Chuỗi ngày tháng cần định dạng
 * @param format - Định dạng mong muốn (mặc định: dd/MM/yyyy)
 * @returns Chuỗi ngày tháng đã định dạng
 */
export const formatDate = (dateString: string, format: string = 'dd/MM/yyyy'): string => {
  const date = new Date(dateString);
  
  // Kiểm tra xem date có hợp lệ không
  if (isNaN(date.getTime())) {
    return 'Ngày không hợp lệ';
  }
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return format
    .replace('dd', day)
    .replace('MM', month)
    .replace('yyyy', year.toString())
    .replace('HH', hours)
    .replace('mm', minutes);
};

/**
 * Kiểm tra xem một ngày có phải là trong tương lai không
 * @param dateString - Chuỗi ngày tháng cần kiểm tra
 * @returns true nếu ngày trong tương lai, false nếu không
 */
export const isFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  
  return date > now;
};

/**
 * Tính số ngày giữa hai ngày
 * @param startDate - Ngày bắt đầu
 * @param endDate - Ngày kết thúc
 * @returns Số ngày giữa hai ngày
 */
export const daysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};
