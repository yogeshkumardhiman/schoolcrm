"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@bprogress/next/app";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  User,
  Users,
  Phone,
  MapPin,
  GraduationCap,
  ShieldCheck,
  Camera,
  UploadCloud,
  ChevronDown,
  Info,
  Mail,
  Loader2,
  Briefcase,
  ArrowLeft,
  ArrowRight,
  Lock,
  Copy,
  Check,
  FileText,
  Trash2,
  FileCheck,
  Sparkles,
  BookOpen,
  School,
  Building,
  Calendar
} from "lucide-react";
import client from "@/lib/client";
import toast from "react-hot-toast";
import { DocumentCropperModal } from "@/components/ui/DocumentCropperModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
} from "@/components/dialogbox/dialog";
import { INDIAN_STATES_AND_UTS, DEFAULT_STATE } from "@/constants/indiaStates";

// 📋 Zod Validation Schema
const staffSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  religion: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  address: z.string().optional(),
  image: z.string().optional(),

  // Step 2: Employment
  role: z.string().min(1, "Please select an institutional role"),
  roleId: z.string().optional(),
  designation: z.string().optional(),
  joiningDate: z.string().optional(),
  experience: z.string().optional(),

  // Role conditional fields
  subject: z.string().optional(),
  class: z.string().optional(),
  section: z.string().optional(),
  qualification: z.string().optional(),
  about: z.string().optional(),

  // Documents array
  documents: z
    .array(
      z.object({
        title: z.string(),
        type: z.string(),
        url: z.string(),
        fileName: z.string().optional()
      })
    )
    .optional()
});

type StaffFormData = z.infer<typeof staffSchema>;

const CLASSES = [
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
  "12TH"
];
const SECTIONS = ["A", "B", "C", "D"];
const RELIGIONS = ["HINDU", "MUSLIM", "SIKH", "CHRISTIAN", "JAIN", "OTHER"];

const STEPS = [
  { step: 1, id: "BASIC", label: "Basic Profile", sub: "Personal details & address", icon: User },
  { step: 2, id: "EMPLOYMENT", label: "Employment & Role", sub: "Role, tenure & assignments", icon: Briefcase },
  { step: 3, id: "DOCUMENTS", label: "Document Vault", sub: "Proofs, degrees & security", icon: FileText }
];

export default function TeacherForm() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stepper state
  const [currentStep, setCurrentStep] = useState(1);
  const [liveRoles, setLiveRoles] = useState<{ id: string; name: string }[]>([]);
  const [staffLoginId, setStaffLoginId] = useState<string | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🛡️ DEFERRED IN-MEMORY ATTACHMENTS (Zero S3 waste until final submit)
  const [pendingAvatarBlob, setPendingAvatarBlob] = useState<Blob | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pendingDocs, setPendingDocs] = useState<
    Record<string, { file: File; title: string; fileName: string }>
  >({});

  // Credentials Modal State for Newly Created Staff
  const [createdCredentials, setCreatedCredentials] = useState<{
    loginId: string;
    email: string;
    name: string;
    role: string;
  } | null>(null);

  // React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors }
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema) as any,
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      name: "",
      email: "",
      phone: "",
      dob: "",
      gender: "Male",
      religion: "HINDU",
      addressLine1: "",
      addressLine2: "",
      city: "",
      district: "",
      state: "Uttar Pradesh",
      pincode: "",
      address: "",
      image: "",
      role: "TEACHER",
      designation: "",
      joiningDate: "",
      experience: "",
      subject: "",
      class: "",
      section: "A",
      qualification: "",
      about: "",
      documents: []
    }
  });

  const selectedRole = watch("role");
  const avatarUrl = watch("image");
  const documents = watch("documents") || [];

  // Fetch Live Roles from RBAC (Excluding ADMIN and SUPER_ADMIN)
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data: any = await client.get("/rbac/roles");
        if (Array.isArray(data) && data.length > 0) {
          const filtered = data.filter((r: any) => r.name !== "SUPER_ADMIN" && r.name !== "ADMIN");
          setLiveRoles(filtered);
          if (!id && filtered.length > 0) {
            setValue("role", filtered[0].name);
            setValue("roleId", filtered[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load live roles:", err);
      }
    };
    fetchRoles();
  }, [id, setValue]);

  // Fetch existing staff for edit mode
  useEffect(() => {
    if (!id) return;
    const fetchStaffData = async () => {
      try {
        const data: any = await client.get(`/staff/${id}`);
        if (data) {
          if (data.loginId) setStaffLoginId(data.loginId);
          if (data.image) setAvatarPreview(data.image);
          const fName = data.firstName || (data.name ? data.name.split(" ")[0] : "");
          const lName =
            data.lastName || (data.name ? data.name.split(" ").slice(1).join(" ") : "");

          reset({
            firstName: fName,
            lastName: lName,
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            dob: data.dob || "",
            gender: data.gender || "Male",
            religion: data.religion || "HINDU",
            addressLine1: data.address || "",
            addressLine2: "",
            city: "Moradabad",
            district: "Moradabad",
            state: "Uttar Pradesh",
            pincode: "244001",
            address: data.address || "",
            image: data.image || "",
            role: data.role || "TEACHER",
            roleId: data.roleId ? String(data.roleId) : undefined,
            designation: data.designation || "",
            joiningDate: data.joiningDate || "",
            experience: data.experience || "",
            subject: data.subject || "",
            class: data.class || "",
            section: data.section || "A",
            qualification: data.qualification || "",
            about: data.about || "",
            documents: Array.isArray(data.documents) ? data.documents : []
          });
        }
      } catch (err) {
        console.error("Failed to load faculty record:", err);
        toast.error("Failed to load faculty member details");
      }
    };
    fetchStaffData();
  }, [id, reset]);

  // Avatar file select handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageToCrop(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Avatar crop handler (Keeps in memory, zero S3 call)
  const handleAvatarCropped = (croppedBlob: Blob) => {
    const previewUrl = URL.createObjectURL(croppedBlob);
    setPendingAvatarBlob(croppedBlob);
    setAvatarPreview(previewUrl);
    setImageToCrop(null);
    toast.success("Photo attached (will upload on submit)");
  };

  // Document file selection (Keeps in memory, zero S3 call)
  const handleDocumentSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: string,
    docTitle: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingDocs((prev) => ({
      ...prev,
      [docType]: { file, title: docTitle, fileName: file.name }
    }));
    toast.success(`${docTitle} attached`);
  };

  // Remove document handler
  const handleRemoveDoc = (docType: string) => {
    setPendingDocs((prev) => {
      const copy = { ...prev };
      delete copy[docType];
      return copy;
    });
    setValue(
      "documents",
      documents.filter((d) => d.type !== docType)
    );
    toast.success("Document removed");
  };

  // Stepper Next Step validation
  const handleNextStep = async () => {
    if (currentStep === 1) {
      const valid = await trigger(["firstName", "email", "phone", "gender"]);
      if (!valid) {
        toast.error("Please fill in required basic fields correctly");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const valid = await trigger(["role"]);
      if (!valid) {
        toast.error("Please select an institutional role");
        return;
      }
      setCurrentStep(3);
    }
  };

  // 🚀 ATOMIC FINAL SUBMIT: UPLOADS ONLY COMMITTED FILES TO S3
  const onSubmit = async (data: StaffFormData) => {
    setIsSubmitting(true);
    try {
      let finalImageUrl = data.image || "";

      // 1. Upload Pending Avatar if attached
      if (pendingAvatarBlob) {
        const file = new File([pendingAvatarBlob], `staff-avatar-${Date.now()}.jpg`, {
          type: "image/jpeg"
        });
        const formData = new FormData();
        formData.append("file", file);

        const folderParam = staffLoginId
          ? `folder=staff/${staffLoginId}/avatars`
          : `folder=staff/avatars`;
        const uploadRes: any = await client.upload(`/upload?${folderParam}`, formData);
        finalImageUrl = uploadRes?.url || "";
      }

      // 2. Upload Pending Documents if attached
      const finalDocs = [...documents];
      const pendingKeys = Object.keys(pendingDocs);

      for (const docType of pendingKeys) {
        const item = pendingDocs[docType];
        const formData = new FormData();
        formData.append("file", item.file);

        const folderMap: Record<string, string> = {
          ID_PROOF: "id-proofs",
          QUALIFICATION: "qualifications",
          APPOINTMENT_LETTER: "appointment-letters"
        };
        const subFolder = folderMap[docType] || "documents";
        const targetFolder = staffLoginId
          ? `staff/${staffLoginId}/${subFolder}`
          : `staff/${subFolder}`;

        const uploadRes: any = await client.upload(`/upload?folder=${targetFolder}`, formData);
        if (uploadRes?.url) {
          const filtered = finalDocs.filter((d) => d.type !== docType);
          filtered.push({
            title: item.title,
            type: docType,
            url: uploadRes.url,
            fileName: item.fileName
          });
          finalDocs.length = 0;
          finalDocs.push(...filtered);
        }
      }

      // 3. Assemble Name and Formatted Address
      const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
      const formattedAddress = [
        data.addressLine1,
        data.addressLine2,
        data.city,
        data.district ? `Dist: ${data.district}` : "",
        data.state && data.pincode ? `${data.state} - ${data.pincode}` : data.state || data.pincode
      ]
        .filter(Boolean)
        .join(", ") || data.address;

      // 4. Persist Staff Record with final S3 URLs
      const payload = {
        ...data,
        name: fullName,
        firstName: data.firstName,
        lastName: data.lastName,
        address: formattedAddress,
        image: finalImageUrl,
        documents: finalDocs,
        email: data.email.trim().toLowerCase(),
        loginId: undefined // backend auto-generates staff login ID
      };

      // 🛡️ Single Principal Guard: Check if Principal already exists
      const isSelectingPrincipal = 
        data.role?.toUpperCase() === "PRINCIPAL" || 
        data.designation?.toLowerCase().includes("principal");

      if (isSelectingPrincipal && !id) {
        try {
          const existingList: any = await client.get("/staff");
          const list = Array.isArray(existingList) ? existingList : existingList?.data || [];
          const currentPrincipal = list.find((s: any) => 
            s.role?.toUpperCase() === "PRINCIPAL" || 
            s.designation?.toLowerCase().includes("principal")
          );
          if (currentPrincipal) {
            toast.error(
              `⚠️ Principal profile already exists (${currentPrincipal.name}). Only 1 Principal is permitted per institution. Please edit the existing Principal profile instead.`,
              { duration: 7000 }
            );
            setIsSubmitting(false);
            return;
          }
        } catch {
          // ignore
        }
      }

      if (id) {
        await client.put(`/staff/${id}`, payload);
        toast.success("Faculty member updated successfully!");
        setTimeout(() => router.push("/staff"), 800);
      } else {
        const res: any = await client.post("/staff", payload);
        toast.success("Faculty member registered successfully!");
        setCreatedCredentials({
          name: fullName,
          email: data.email.toLowerCase().trim(),
          loginId: res?.loginId || "EMP-2026-001",
          role: data.role
        });
      }
    } catch (err: any) {
      console.error("Staff save error:", err);
      toast.error(err?.message || err?.error || "Failed to register staff account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTeacher = selectedRole === "TEACHER";

  return (
    <div className="p-8 md:p-10 space-y-8 bg-[#F8FAFC] min-h-screen font-sans">
      {/* 🧭 HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/staff")}
            className="h-11 w-11 p-0 rounded-2xl border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase font-heading">
                {id ? "Edit Employee Profile" : "Add New Employee"}
              </h1>
              <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[10px] uppercase py-0.5 px-2.5 rounded-md">
                {selectedRole}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              3-Step Guided Registration: Complete profile, set role, and attach compliance proofs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/staff")}
            className="h-11 px-6 rounded-xl border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* 📊 INTERACTIVE 3-STEP WIZARD PROGRESS BAR */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  if (s.step < currentStep) setCurrentStep(s.step);
                }}
                disabled={s.step > currentStep}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left",
                  isCurrent
                    ? "bg-indigo-50/70 border-indigo-500 shadow-sm"
                    : isCompleted
                    ? "bg-slate-50 border-slate-200 hover:bg-slate-100 cursor-pointer"
                    : "bg-white border-slate-200/60 opacity-60 cursor-not-allowed"
                )}
              >
                <div
                  className={cn(
                    "h-11 w-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all",
                    isCompleted
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : isCurrent
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "bg-slate-100 text-slate-400"
                  )}
                >
                  {isCompleted ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Step 0{s.step}
                    </span>
                    {isCurrent && (
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 leading-tight">{s.label}</h4>
                  <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">{s.sub}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 📝 MULTI-STEP FORM */}
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ========================================================
            STEP 1: BASIC INFORMATION
        ======================================================== */}
        {currentStep === 1 && (
          <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/80 shadow-sm space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                01
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight font-heading">
                  Basic Personal Information
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Core identity details, contact numbers, and permanent address.
                </p>
              </div>
            </div>

            {/* Profile Photo Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-slate-50/80 rounded-2xl border border-slate-200/60">
              <div className="relative group shrink-0">
                <div className="w-28 h-36 sm:w-32 sm:h-40 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shadow-md ring-4 ring-slate-100">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Faculty Passport Photo" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-center p-3 text-slate-400">
                      <Camera size={26} className="mx-auto mb-1 text-slate-400" />
                      <span className="text-[9px] font-black uppercase tracking-wider block text-slate-600">
                        35mm × 45mm
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase">Passport Frame</span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg hover:bg-indigo-600 transition-all cursor-pointer"
                  title="Upload & Crop Passport Photo"
                >
                  <Camera size={15} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  hidden
                  accept="image/*"
                />
              </div>

              <div className="space-y-1.5 text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h4 className="text-sm font-black text-slate-900 uppercase font-heading">
                    Faculty Passport Photograph
                  </h4>
                  <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-md text-[9px] font-black uppercase">
                    3.5 × 4.5 cm
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Upload an official passport photo with clear face visibility. The interactive cropper will align it to standard 35mm × 45mm dimensions.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 px-4 text-xs font-bold rounded-xl border-slate-200 text-indigo-600 hover:bg-indigo-50 uppercase cursor-pointer"
                  >
                    <UploadCloud size={14} className="mr-1.5" /> Upload & Crop Passport Photo
                  </Button>
                  <span className="text-[11px] text-slate-400 font-medium">
                    JPG, PNG • Maximum 5 MB • Standard 3.5:4.5
                  </span>
                </div>
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                  <span>
                    First Name <span className="text-rose-500">*</span>
                  </span>
                  {errors.firstName && (
                    <span className="text-[10px] font-bold text-rose-500 lowercase">
                      {errors.firstName.message}
                    </span>
                  )}
                </label>
                <Input
                  {...register("firstName")}
                  placeholder="Enter first name"
                  className={cn(
                    "h-11 rounded-xl text-xs font-bold",
                    errors.firstName && "border-rose-500 focus:ring-rose-500"
                  )}
                />
              </div>

              {/* Last Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Last Name / Surname
                </label>
                <Input
                  {...register("lastName")}
                  placeholder="Enter last name"
                  className="h-11 rounded-xl text-xs font-bold"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                  <span>
                    Official Email Address (Login ID) <span className="text-rose-500">*</span>
                  </span>
                  {errors.email && (
                    <span className="text-[10px] font-bold text-rose-500 lowercase">
                      {errors.email.message}
                    </span>
                  )}
                </label>
                <Input
                  type="email"
                  {...register("email")}
                  placeholder="Enter official email"
                  className={cn(
                    "h-11 rounded-xl text-xs font-bold",
                    errors.email && "border-rose-500 focus:ring-rose-500"
                  )}
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Mobile Number (10 Digits)
                </label>
                <Input
                  type="tel"
                  maxLength={10}
                  {...register("phone")}
                  placeholder="Enter 10-digit mobile number"
                  className="h-11 rounded-xl text-xs font-bold font-mono"
                />
                {!errors.phone && (
                  <p className="text-[10px] text-slate-400 font-medium">
                    Enter a valid 10-digit mobile number.
                  </p>
                )}
              </div>

              {/* DOB */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Date of Birth
                </label>
                <Input
                  type="date"
                  placeholder="DD/MM/YYYY"
                  {...register("dob")}
                  className="h-11 rounded-xl text-xs font-bold"
                />
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Gender
                </label>
                <select
                  {...register("gender")}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Religion */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Religion Axis
                </label>
                <select
                  {...register("religion")}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">Select Religion</option>
                  {RELIGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 📍 Structured Address Grid */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <MapPin size={18} className="text-indigo-600" />
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider font-heading">
                  Residential Postal Address
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    House No., Street, Village
                  </label>
                  <Input
                    {...register("addressLine1")}
                    placeholder="House No., Street, Village"
                    className="h-11 bg-white rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Post Office / Landmark
                  </label>
                  <Input
                    {...register("addressLine2")}
                    placeholder="Post Office / Landmark"
                    className="h-11 bg-white rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    City / Tehsil / Town
                  </label>
                  <Input
                    {...register("city")}
                    placeholder="Enter city or tehsil"
                    className="h-11 bg-white rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    District
                  </label>
                  <Input
                    {...register("district")}
                    placeholder="Enter district"
                    className="h-11 bg-white rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    State
                  </label>
                  <select
                    {...register("state")}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES_AND_UTS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    PIN Code
                  </label>
                  <Input
                    {...register("pincode")}
                    placeholder="Enter 6-digit PIN code"
                    maxLength={6}
                    className="h-11 bg-white rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Stepper Footer */}
            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
              <Button
                type="button"
                onClick={handleNextStep}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-11 px-8 rounded-xl shadow-lg shadow-slate-900/10 flex items-center gap-2 uppercase tracking-wider"
              >
                Proceed to Employment Details <ArrowRight size={15} />
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 2: EMPLOYMENT & ROLE CONFIGURATION
        ======================================================== */}
        {currentStep === 2 && (
          <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/80 shadow-sm space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                02
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight font-heading">
                  Employment & Role Specification
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Select institutional role to auto-configure departmental authorities and duties.
                </p>
              </div>
            </div>

            {/* Role & Base Employment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Institutional Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    const roleName = e.target.value;
                    const matched = liveRoles.find((r) => r.name === roleName);
                    setValue("role", roleName);
                    if (matched?.id) {
                      setValue("roleId", matched.id);
                    }
                  }}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 cursor-pointer uppercase tracking-wider"
                >
                  {liveRoles.length > 0 ? (
                    liveRoles.map((r) => (
                      <option key={r.id || r.name} value={r.name}>
                        {r.name}
                      </option>
                    ))
                  ) : (
                    <option value="TEACHER">TEACHER</option>
                  )}
                </select>
                <p className="text-[10px] text-indigo-600 font-semibold">
                  Department: {isTeacher ? "Academics" : selectedRole === "ACCOUNTANT" ? "Finance & Accounts" : "Administration"}
                </p>
              </div>

              {/* Designation */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Official Designation
                </label>
                <Input
                  {...register("designation")}
                  placeholder="Enter designation (e.g. Senior PGT Math)"
                  className="h-11 rounded-xl text-xs font-bold"
                />
              </div>

              {/* Joining Date */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Date of Joining
                </label>
                <Input
                  type="date"
                  placeholder="DD/MM/YYYY"
                  {...register("joiningDate")}
                  className="h-11 rounded-xl text-xs font-bold"
                />
              </div>

              {/* Experience */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Prior Experience (Years)
                </label>
                <Input
                  {...register("experience")}
                  placeholder="Enter total years of experience (e.g. 5 Years)"
                  className="h-11 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            {/* 🎓 CONDITIONAL BLOCK: TEACHER ACADEMIC PROFILE */}
            {isTeacher ? (
              <div className="p-6 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-6">
                <div className="flex items-center gap-2 border-b border-purple-100 pb-3">
                  <BookOpen size={18} className="text-purple-600" />
                  <h4 className="text-xs font-black text-purple-900 uppercase tracking-wider font-heading">
                    Scholastic & Classroom Assignment
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Primary Subject */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Primary Teaching Subject
                    </label>
                    <Input
                      {...register("subject")}
                      placeholder="Enter primary teaching subject (e.g. Mathematics)"
                      className="h-11 bg-white border-purple-200 rounded-xl text-xs font-bold"
                    />
                  </div>

                  {/* Assigned Class */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Class In-Charge (Optional)
                    </label>
                    <select
                      {...register("class")}
                      className="w-full h-11 px-4 rounded-xl border border-purple-200 bg-white text-xs font-bold text-slate-800 outline-none cursor-pointer"
                    >
                      <option value="">No Class Assigned</option>
                      {CLASSES.map((c) => (
                        <option key={c} value={c}>
                          Class {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Assigned Section */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Section
                    </label>
                    <select
                      {...register("section")}
                      className="w-full h-11 px-4 rounded-xl border border-purple-200 bg-white text-xs font-bold text-slate-800 outline-none cursor-pointer"
                    >
                      <option value="">Select Section</option>
                      {SECTIONS.map((s) => (
                        <option key={s} value={s}>
                          Section {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Highest Qualification */}
                  <div className="col-span-1 md:col-span-3 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Highest Academic Degree / Qualifications
                    </label>
                    <Input
                      {...register("qualification")}
                      placeholder="Enter educational qualifications (e.g. B.Ed, M.Sc Mathematics, CTET)"
                      className="h-11 bg-white border-purple-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* 💼 CONDITIONAL BLOCK: NON-TEACHING PROFESSIONAL SCOPE */
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider font-heading">
                  Qualifications & Skills
                </h4>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Degrees & Certifications
                    </label>
                    <Input
                      {...register("qualification")}
                      placeholder="Enter degrees & certifications (e.g. B.Com, MBA, Tally Prime)"
                      className="h-11 rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 📝 PROFESSIONAL SCOPE & BIO (AVAILABLE FOR ALL ROLES) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <FileText size={13} className="text-indigo-600" /> Professional Scope & Biography / Notes
              </label>
              <textarea
                rows={3}
                {...register("about")}
                placeholder="Enter brief professional summary, qualifications, accomplishments, or institutional scope..."
                className="w-full p-4 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 resize-none shadow-2xs"
              />
            </div>

            {/* Stepper Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="h-11 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2"
              >
                <ArrowLeft size={15} /> Back
              </Button>

              <Button
                type="button"
                onClick={handleNextStep}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-11 px-8 rounded-xl shadow-lg shadow-slate-900/10 flex items-center gap-2 uppercase tracking-wider"
              >
                Proceed to Document Vault <ArrowRight size={15} />
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 3: DOCUMENT VAULT & PROOFS
        ======================================================== */}
        {currentStep === 3 && (
          <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/80 shadow-sm space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                03
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight font-heading">
                  Compliance & Document Vault
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Attach government ID proofs, academic certificates, and appointment letters.
                </p>
              </div>
            </div>

            {/* Document Upload Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Doc 1: Govt ID Proof */}
              {(() => {
                const pending = pendingDocs["ID_PROOF"];
                const saved = documents.find((d) => d.type === "ID_PROOF");
                const hasDoc = pending || saved;
                const displayName = pending?.fileName || saved?.fileName || "ID Proof Attached";

                return (
                  <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-4 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                        <FileText size={20} />
                      </div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Govt. ID Proof
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Aadhaar Card, PAN Card, or Voter ID
                      </p>
                    </div>

                    {hasDoc ? (
                      <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileCheck size={16} className="text-emerald-600 shrink-0" />
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {displayName}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc("ID_PROOF")}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="h-11 bg-white border border-dashed border-slate-300 hover:border-indigo-500 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-xs font-bold text-slate-600 hover:text-indigo-600 transition-all">
                        <UploadCloud size={15} />
                        Attach ID Proof
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => handleDocumentSelect(e, "ID_PROOF", "Government ID Proof")}
                          hidden
                        />
                      </label>
                    )}
                  </div>
                );
              })()}

              {/* Doc 2: Qualification Certificate */}
              {(() => {
                const pending = pendingDocs["QUALIFICATION"];
                const saved = documents.find((d) => d.type === "QUALIFICATION");
                const hasDoc = pending || saved;
                const displayName = pending?.fileName || saved?.fileName || "Degree Attached";

                return (
                  <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-4 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                        <GraduationCap size={20} />
                      </div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Degree / Qualification
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Highest Degree / B.Ed / Marksheet Certificate
                      </p>
                    </div>

                    {hasDoc ? (
                      <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileCheck size={16} className="text-emerald-600 shrink-0" />
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {displayName}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc("QUALIFICATION")}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="h-11 bg-white border border-dashed border-slate-300 hover:border-indigo-500 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-xs font-bold text-slate-600 hover:text-indigo-600 transition-all">
                        <UploadCloud size={15} />
                        Attach Certificate
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) =>
                            handleDocumentSelect(e, "QUALIFICATION", "Educational Qualification")
                          }
                          hidden
                        />
                      </label>
                    )}
                  </div>
                );
              })()}

              {/* Doc 3: Appointment Letter */}
              {(() => {
                const pending = pendingDocs["APPOINTMENT_LETTER"];
                const saved = documents.find((d) => d.type === "APPOINTMENT_LETTER");
                const hasDoc = pending || saved;
                const displayName = pending?.fileName || saved?.fileName || "Letter Attached";

                return (
                  <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-4 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                        <Briefcase size={20} />
                      </div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Appointment / Experience
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Appointment Order or Prior Experience Letter
                      </p>
                    </div>

                    {hasDoc ? (
                      <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileCheck size={16} className="text-emerald-600 shrink-0" />
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {displayName}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc("APPOINTMENT_LETTER")}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="h-11 bg-white border border-dashed border-slate-300 hover:border-indigo-500 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-xs font-bold text-slate-600 hover:text-indigo-600 transition-all">
                        <UploadCloud size={15} />
                        Attach Letter
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) =>
                            handleDocumentSelect(e, "APPOINTMENT_LETTER", "Appointment Letter")
                          }
                          hidden
                        />
                      </label>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Security Shield Banner */}
            <div className="p-6 bg-slate-900 text-white rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider font-heading">
                    Automated Secure Provisioning
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium">
                    A unique alphanumeric Login ID will be generated. The password is encrypted with{" "}
                    <strong>bcrypt</strong> and emailed directly to the employee.
                  </p>
                </div>
              </div>
            </div>

            {/* Stepper Footer & Final Submit */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(2)}
                className="h-11 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2"
              >
                <ArrowLeft size={15} /> Back
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-11 px-10 rounded-xl shadow-lg shadow-indigo-600/20 uppercase tracking-widest flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Uploading & Registering...
                  </>
                ) : (
                  <>
                    <Check size={16} strokeWidth={2.5} /> {id ? "Update Employee Profile" : "Register Employee"}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </form>

      {/* ✂️ PASSPORT PHOTO CROPPER MODAL (35mm x 45mm) */}
      {imageToCrop && (
        <DocumentCropperModal
          imageSrc={imageToCrop}
          documentTitle="Faculty Passport Photograph (35mm × 45mm)"
          initialAspect={3.5 / 4.5}
          onCancel={() => setImageToCrop(null)}
          onCropComplete={(croppedBlob, previewUrl) => {
            setPendingAvatarBlob(croppedBlob);
            setAvatarPreview(previewUrl);
            setImageToCrop(null);
            toast.success("Passport photo cropped & aligned!");
          }}
        />
      )}

      {/* 🔑 CREATED CREDENTIALS MODAL */}
      {createdCredentials && (
        <Dialog open={!!createdCredentials} onOpenChange={(open) => !open && setCreatedCredentials(null)}>
          <DialogContent className="max-w-md rounded-3xl p-6 bg-white border border-slate-200 shadow-2xl font-sans text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
              <Check size={28} strokeWidth={2.5} />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight font-heading">
                Staff Account Created!
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Login identity generated and dispatched to the employee's email.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-3">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Login ID (Username)</span>
                <div className="flex items-center justify-between bg-white border border-indigo-200 rounded-xl px-3.5 py-2 mt-1">
                  <span className="font-mono text-sm font-black text-indigo-600 select-all">{createdCredentials.loginId}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentials.loginId);
                      toast.success("Login ID copied!");
                    }}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registered Email</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{createdCredentials.email}</p>
              </div>

              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assigned Role</span>
                <p className="text-xs font-bold text-indigo-600 mt-0.5">{createdCredentials.role}</p>
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] font-semibold text-indigo-900 leading-relaxed">
                🔒 Password encrypted with <strong>bcrypt</strong> and emailed to <strong>{createdCredentials.email}</strong>.
              </div>
            </div>

            <Button
              type="button"
              onClick={() => {
                setCreatedCredentials(null);
                router.push("/staff");
              }}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Done & Return to Staff Directory
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
