/**
 * Định dạng ngày/thời gian về dạng HH:mm (giờ:phút 24h)
 * @param timeStr Chuỗi thời gian, có thể là "23:05:00", "2025-08-18T23:05:00Z", hoặc Date object
 * @returns Chuỗi "HH:mm"
 */
export function formatTimeHHmm(timeStr: string | Date): string {
  if (!timeStr) return "";
  if (typeof timeStr === "string") {
    // Nếu là dạng "HH:mm:ss"
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) {
      return timeStr.slice(0, 5);
    }
    // Nếu là ISO string
    const date = new Date(timeStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
    return "";
  }
  // Nếu là Date object
  return timeStr.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
