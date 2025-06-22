// ✅ File: services/examination/roomService.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/Room";

export type Room = {
  roomId: number;
  roomName: string;
  description?: string;
  status?: string;
  capacity: number;
};

export type RoomForm = {
  roomName: string;
  description?: string;
  status?: string;
  capacity: number;
};

export async function fetchRooms(
  params: Record<string, string | number | undefined>
) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") searchParams.append(k, String(v));
  });

  const res = await fetch(`${API_URL}?${searchParams.toString()}`);
  if (!res.ok) throw new Error("Không thể tải danh sách phòng học");
  return res.json();
}

export async function createRoom(form: RoomForm) {
  const res = await fetch(`${API_URL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  if (!res.ok) throw new Error("Không thể thêm phòng học mới");
}

export async function updateRoom(id: number, form: RoomForm) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomId: id, ...form }),
  });
  if (!res.ok) throw new Error("Không thể cập nhật phòng học");
}
