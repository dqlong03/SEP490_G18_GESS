"use client";

import { useEffect, useState, useMemo } from "react";
import { User, fetchUsers } from "@services/admin/manageUserService";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchUsers().then(setUsers);
  }, []);

  const roleOptions = useMemo(
    () => Array.from(new Set(users.map((u) => u.role).filter(Boolean))),
    [users]
  );

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.fullname?.toLowerCase().includes(search.toLowerCase()) ||
        user.userName?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter ? user.role === roleFilter : true;
      const matchesStatus =
        statusFilter === ""
          ? true
          : statusFilter === "active"
            ? user.isActive
            : !user.isActive;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  return {
    users,
    filteredUsers,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    roleOptions,
  };
}
