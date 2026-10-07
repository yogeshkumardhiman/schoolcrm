"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@bprogress/next/app";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "@/lib/client";
import { toast } from "react-hot-toast";

export const CLASSES_LIST = [
  "NURSERY",
  "LKG",
  "UKG",
  "1ST",
  "2ND",
  "3RD",
  "4TH",
  "5TH",
  "6TH",
  "7TH",
  "8TH",
  "9TH",
  "10TH",
  "11TH",
  "12TH",
];
export const SECTIONS_LIST = ["A", "B", "C", "D"];

export function useStudentsState() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [selectedSection, setSelectedSection] = useState("All Sections");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  const [userRole] = useState(() => {
    if (typeof window !== "undefined") {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.role?.toUpperCase() || "ADMIN";
    }
    return "ADMIN";
  });

  const isTeacher = userRole === "TEACHER" || userRole === "CLASS_TEACHER";

  useEffect(() => {
    if (isTeacher) {
      router.replace("/staff/my-students");
    }
  }, [isTeacher, router]);

  const { data: response, isLoading, isPlaceholderData } = useQuery({
    queryKey: ["students", currentPage, selectedClass, selectedSection],
    queryFn: () => {
      let url = `/students?page=${currentPage}&limit=${pageSize}`;
      if (selectedClass && selectedClass !== "All Classes") {
        url += `&class=${encodeURIComponent(selectedClass)}`;
      }
      if (selectedSection && selectedSection !== "All Sections") {
        url += `&section=${encodeURIComponent(selectedSection)}`;
      }
      return client.get(url);
    },
    staleTime: 0,
    refetchOnMount: true,
    placeholderData: (previousData) => previousData,
  });

  const students = Array.isArray(response)
    ? response
    : Array.isArray(response?.students)
    ? response.students
    : [];
  const totalPages =
    response?.totalPages ||
    (Array.isArray(response) ? Math.ceil(response.length / pageSize) || 1 : 1);
  const totalItems =
    response?.totalItems ?? (Array.isArray(response) ? response.length : 0);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => client.delete(`/students/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Scholar registry purged.");
    },
    onError: () => toast.error("Purge failed."),
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: (data: any) =>
      client.post('/students/bulk-section', { ids: data.ids, section: data.section }),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success(
        `Relocated ${variables.ids.length} scholars to Section ${variables.section}`
      );
      setSelectedIds([]);
    },
    onError: () => toast.error("Bulk relocation failed"),
  });

  const handleBulkSectionUpdate = (newSection: string) => {
    if (selectedIds.length === 0) return;
    bulkUpdateMutation.mutate({ ids: selectedIds, section: newSection });
  };

  const filteredStudents = students.filter((student: any) => {
    const matchesSearch =
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo?.toString().includes(searchQuery) ||
      student.admissionNo?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass =
      selectedClass === "All Classes" || student.class === selectedClass;
    const matchesSection =
      selectedSection === "All Sections" ||
      student.section === selectedSection ||
      (selectedSection === "UNASSIGNED" && !student.section);
    return matchesSearch && matchesClass && matchesSection;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.length === filteredStudents.length
        ? []
        : filteredStudents.map((s: any) => String(s._id || s.id))
    );
  };

  const handleDelete = (id: string) => {
    setStudentToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      deleteMutation.mutate(studentToDelete);
      setDeleteConfirmOpen(false);
      setStudentToDelete(null);
    }
  };

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "SC"
    );
  };

  return {
    router,
    searchQuery,
    setSearchQuery,
    selectedClass,
    setSelectedClass,
    selectedSection,
    setSelectedSection,
    selectedIds,
    setSelectedIds,
    currentPage,
    setCurrentPage,
    pageSize,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    studentToDelete,
    setStudentToDelete,
    userRole,
    isTeacher,
    response,
    isLoading,
    isPlaceholderData,
    students,
    totalPages,
    totalItems,
    deleteMutation,
    bulkUpdateMutation,
    handleBulkSectionUpdate,
    filteredStudents,
    toggleSelect,
    toggleSelectAll,
    handleDelete,
    confirmDelete,
    getInitials,
  };
}
