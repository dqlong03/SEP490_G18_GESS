// ✅ File: hooks/examination/useRoomManager.ts

"use client";

import { useState, useEffect, ChangeEvent, FormEvent, useRef } from "react";
import {
  Room,
  RoomForm,
  fetchRooms,
  createRoom,
  updateRoom,
} from "@/services/examination/manageRoomService";
import { toast } from "react-toastify";
export function useRoomManager() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<RoomForm>({
    roomName: "",
    description: "",
    status: "",
    capacity: 0,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchName, setSearchName] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchAllRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        name: searchName,
        status: statusFilter,
        pageNumber,
        pageSize,
      };
      const data: Room[] = await fetchRooms(params);
      setRooms(data);
      setTotalPages(data.length < pageSize ? pageNumber : pageNumber + 1); // basic pagination fallback
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, searchName, statusFilter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingId === null) {
        await createRoom(form);
        toast.success("Tạo phòng thành công!");
      } else {
        await updateRoom(editingId, form);
        toast.success("Cập nhật phòng thành công!");
      }
      closePopup();
      fetchAllRooms();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Đã xảy ra lỗi");
    }
    setLoading(false);
  };

  const handleEdit = (room: Room) => {
    setForm({
      roomName: room.roomName,
      description: room.description || "",
      status: room.status || "",
      capacity: room.capacity,
    });
    setEditingId(room.roomId);
    setShowPopup(true);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setPageNumber(1);
    fetchAllRooms();
  };

  const closePopup = () => {
    setShowPopup(false);
    setEditingId(null);
    setForm({ roomName: "", description: "", status: "", capacity: 0 });
  };

  return {
    rooms,
    loading,
    error,
    form,
    editingId,
    showPopup,
    openMenuId,
    menuRef,
    pageNumber,
    pageSize,
    totalPages,
    searchName,
    statusFilter,
    setSearchName,
    setStatusFilter,
    setPageNumber,
    handleChange,
    handleSubmit,
    handleEdit,
    handleSearch,
    closePopup,
    setShowPopup,
    setEditingId,
    setForm,
    setOpenMenuId,
  };
}
