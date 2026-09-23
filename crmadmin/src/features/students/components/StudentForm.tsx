"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Eye,
  EyeOff,
  Briefcase,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Trash2,
  Plus,
  X,
  Bus,
  CheckCircle2,
  FileText,
  FileCheck,
  Copy,
  Check,
  IdCard,
  Building,
  Calendar,
  Sparkles,
  Printer,
  Receipt,
  ExternalLink,
  AlertCircle,
  Crop
} from "lucide-react";
import { cn } from "@/lib/utils";
import client from "@/lib/client";
import toast from "react-hot-toast";
import ImageCropperModal from "@/components/ui/ImageCropperModal";
import DocumentCropperModal from "@/components/ui/DocumentCropperModal";
import DocumentViewerModal from "@/components/ui/DocumentViewerModal";
import { AdmissionFeeSlipModal } from "@/features/fees";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { APP_CONFIG } from "@/constants/config";
import { INDIAN_STATES_AND_UTS, DEFAULT_STATE } from "@/constants/indiaStates";

// 📋 ZOD VALIDATION SCHEMA FOR STUDENT ADMISSION
const studentSchema = z.object({
  // Step 1: Student Identity & Structured Names
  firstName: z.string().min(2, "First name is required (min 2 characters)"),
  lastName: z.string().optional(),
  name: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]),
  dob: z.string().min(1, "Date of birth is required"),
  bloodGroup: z.string().optional(),
  religion: z.string().optional(),
  aadharNo: z
    .string()
    .min(12, "Aadhaar number is required (12 digits)")
    .refine(
      (val) => val.replace(/\D/g, "").length === 12,
      "Aadhaar number must be exactly 12 digits"    
    ),
  phone: z
    .string()
    .min(10, "Mobile number is required (10 digits)")
    .refine(
      (val) => val.replace(/\D/g, "").length === 10,
      "Mobile number must be exactly 10 digits"
    ),
  email: z
    .string()
    .min(1, "Parent email address is required")
    .email("Please enter a valid email address"),
  image: z.string().optional(),

  // Step 1: Structured Residential Address (Village / Urban Standard)
  addressLine1: z.string().min(2, "House / Village name is required"),
  addressLine2: z.string().min(2, "Post Office / Area is required"),
  city: z.string().min(2, "City / Tehsil is required"),
  district: z.string().min(2, "District is required"),
  state: z.string().min(2, "Please select state"),
  pincode: z
    .string()
    .min(6, "PIN Code must be 6 digits")
    .refine((val) => val.replace(/\D/g, "").length === 6, "PIN code must be exactly 6 digits"),
  address: z.string().optional(),

  // Step 2: Academic & Parents
  session: z.string().min(1, "Academic session is required"),
  class: z.string().min(1, "Please select enrolled class"),
  section: z.string().min(1, "Please select section"),
  admissionNo: z.string().optional(),
  rollNo: z.string().optional(),
  fatherName: z.string().min(2, "Father's name is required (min 2 characters)"),
  motherName: z.string().min(2, "Mother's name is required (min 2 characters)"),
  password: z.string().optional(),

  // Transport
  transportOpted: z.boolean().optional(),
  transportRouteId: z.string().optional(),
  transportStopId: z.string().optional(),

  // Step 3: Documents
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

type StudentFormData = z.infer<typeof studentSchema>;

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
const SECTIONS = ["A", "B", "C", "D", "UNASSIGNED"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const RELIGIONS = ["HINDU", "MUSLIM", "SIKH", "CHRISTIAN", "JAIN", "OTHER"];

export default function StudentForm() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // 🖼️ AVATAR CROPPER STATE (Zero-Orphan In-Memory)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pendingAvatarBlob, setPendingAvatarBlob] = useState<Blob | null>(null);

  // 📁 DOCUMENT VAULT STATE (Zero-Orphan In-Memory with Cropper & Viewer)
  const [pendingDocs, setPendingDocs] = useState<Record<string, any>>({});
  const [existingDocs, setExistingDocs] = useState<any[]>([]);
  const [docToCrop, setDocToCrop] = useState<{
    docType: string;
    title: string;
    imageSrc: string;
    file: File;
  } | null>(null);
  const [viewerDoc, setViewerDoc] = useState<{
    title: string;
    url: string;
    isPdf?: boolean;
  } | null>(null);

  // 🚌 TRANSPORT MASTERS
  const [routes, setRoutes] = useState<any[]>([]);

  // 🔐 SUCCESS ADMISSION MODAL
  const [successAdmission, setSuccessAdmission] = useState<{
    id?: number | string;
    name: string;
    admissionNo: string;
    class: string;
    section: string;
    dob: string;
    password: string;
    fatherName?: string;
    motherName?: string;
    phone?: string;
    address?: string;
    createdAt?: string;
  } | null>(null);
  const [isAdmissionSlipOpen, setIsAdmissionSlipOpen] = useState(false);
  const [maxClass, setMaxClass] = useState<string>("12TH");

  useEffect(() => {
    client.get("/settings/school-info")
      .then((info: any) => {
        if (info?.maxClass) {
          setMaxClass(info.maxClass);
        }
      })
      .catch(() => null);
  }, []);

  const activeClassesList = (() => {
    const normalizedMax = (maxClass || "12TH").toUpperCase().replace(/[^0-9A-Z]/g, "");
    const idx = CLASSES.findIndex(
      (c) => c.replace(/[^0-9A-Z]/g, "") === normalizedMax
    );
    return idx !== -1 ? CLASSES.slice(0, idx + 1) : CLASSES;
  })();

  const academicSessions = (() => {
    const startYear = new Date().getFullYear() - 1;
    return [
      `${startYear} - ${startYear + 1}`,
      `${startYear + 1} - ${startYear + 2}`,
      `${startYear + 2} - ${startYear + 3}`
    ];
  })();

  // ⚡ REACT HOOK FORM SETUP
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors }
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      name: "",
      gender: "Male",
      dob: "",
      bloodGroup: "O+",
      religion: "HINDU",
      aadharNo: "",
      phone: "",
      email: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      district: "",
      state: "Uttar Pradesh",
      pincode: "",
      address: "",
      image: "",
      session: APP_CONFIG?.academic?.currentSession || "2026 - 2027",
      class: "1ST",
      section: "A",
      admissionNo: "",
      rollNo: "",
      fatherName: "",
      motherName: "",
      password: "",
      transportOpted: false,
      transportRouteId: "",
      transportStopId: "",
      documents: []
    }
  });

  const watchedFirstName = watch("firstName");
  const watchedLastName = watch("lastName");
  const watchedClass = watch("class");
  const watchedSession = watch("session");
  const watchedDob = watch("dob");
  const watchedAdmissionNo = watch("admissionNo");
  const watchedPassword = watch("password");
  const watchedTransportOpted = watch("transportOpted");

  // 1. Fetch Master Data & Existing Student Record (Edit Mode)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [routesData] = await Promise.all([
          client.get("/transport/routes").catch(() => [])
        ]);
        setRoutes(Array.isArray(routesData) ? routesData : []);

        if (id) {
          const data: any = await client.get(`/students/${id}`);
          if (data) {
            // Split name into first and last name if not explicitly stored
            const fName = data.firstName || (data.name ? data.name.split(" ")[0] : "");
            const lName =
              data.lastName || (data.name ? data.name.split(" ").slice(1).join(" ") : "");

            reset({
              firstName: fName,
              lastName: lName,
              name: data.name || "",
              class: data.class || "1ST",
              session: data.session || "2026 - 2027",
              section: data.section || "A",
              admissionNo: data.admissionNo || "",
              rollNo: data.rollNo || "",
              fatherName: data.fatherName || "",
              motherName: data.motherName || "",
              phone: data.phone || "",
              dob: data.dob ? data.dob.split("T")[0] : "",
              gender: data.gender || "Male",
              addressLine1: data.address || "",
              addressLine2: "",
              city: "Moradabad",
              district: "Moradabad",
              state: "Uttar Pradesh",
              pincode: "244001",
              address: data.address || "",
              aadharNo: data.aadharNo || "",
              password: data.password || "",
              image: data.image || "",
              religion: data.religion || "HINDU",
              bloodGroup: data.bloodGroup || "O+",
              email: data.email || "",
              transportOpted: Boolean(data.transportOpted),
              transportRouteId: data.transportRouteId ? String(data.transportRouteId) : "",
              transportStopId: data.transportStopId ? String(data.transportStopId) : "",
              documents: Array.isArray(data.documents) ? data.documents : []
            });
            if (data.image) setAvatarPreview(data.image);
            if (Array.isArray(data.documents)) setExistingDocs(data.documents);
          }
        }
      } catch (err: any) {
        toast.error("Failed to load admission parameters");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id, reset]);

  // 2. Auto-Generate Unique Admission ID on Class/Session Change
  useEffect(() => {
    if (!id && watchedClass && watchedSession) {
      const fetchNextId = async () => {
        try {
          const res: any = await client.get(`/students/next-id/${watchedClass}`);
          if (res?.nextId) {
            setValue("admissionNo", res.nextId, { shouldValidate: true });
          }
        } catch (e) {
          console.error("ID Provisioning error:", e);
        }
      };
      fetchNextId();
    }
  }, [watchedClass, watchedSession, id, setValue]);

  // 3. Auto-Generate Password from DOB (Format: DDMMYYYY)
  useEffect(() => {
    if (!id && watchedDob) {
      const parts = watchedDob.split("-");
      if (parts.length === 3) {
        const autoPass = `${parts[2]}${parts[1]}${parts[0]}`;
        setValue("password", autoPass, { shouldValidate: true });
      }
    }
  }, [watchedDob, id, setValue]);

  // 🖼️ Avatar Selection & Cropping
  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    setPendingAvatarBlob(croppedBlob);
    const objectUrl = URL.createObjectURL(croppedBlob);
    setAvatarPreview(objectUrl);
    setImageToCrop(null);
    toast.success("Passport photo cropped successfully!");
  };

  // 📁 Document File Selection (Zero-Orphan In-Memory with Interactive Cropper)
  const handleDocSelect = (docType: string, title: string, file: File) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setDocToCrop({
          docType,
          title,
          imageSrc: reader.result as string,
          file
        });
      };
      reader.readAsDataURL(file);
    } else {
      // PDF or other document
      const previewUrl = URL.createObjectURL(file);
      setPendingDocs((prev) => ({
        ...prev,
        [docType]: {
          file,
          preview: previewUrl,
          title,
          fileName: file.name,
          isPdf: true
        }
      }));
      toast.success(`${title} attached!`);
    }
  };

  const handleDocCropComplete = (croppedBlob: Blob, previewUrl: string) => {
    if (!docToCrop) return;
    const croppedFile = new File([croppedBlob], docToCrop.file.name, {
      type: "image/jpeg"
    });
    setPendingDocs((prev) => ({
      ...prev,
      [docToCrop.docType]: {
        file: croppedFile,
        preview: previewUrl,
        title: docToCrop.title,
        fileName: docToCrop.file.name,
        isPdf: false,
        rawImageSrc: docToCrop.imageSrc,
        originalFile: docToCrop.file
      }
    }));
    setDocToCrop(null);
    toast.success(`${docToCrop.title} cropped & attached!`);
  };

  const handleReCrop = (docType: string, title: string) => {
    const item = pendingDocs[docType];
    if (item?.rawImageSrc && item?.originalFile) {
      setDocToCrop({
        docType,
        title,
        imageSrc: item.rawImageSrc,
        file: item.originalFile
      });
    } else if (item?.preview && item?.file) {
      setDocToCrop({
        docType,
        title,
        imageSrc: item.preview,
        file: item.file
      });
    }
  };

  const handleRemovePendingDoc = (docType: string) => {
    setPendingDocs((prev) => {
      const updated = { ...prev };
      delete updated[docType];
      return updated;
    });
  };

  const handleRemoveExistingDoc = (docType: string) => {
    setExistingDocs((prev) => prev.filter((d) => d.type !== docType));
  };

  // 🚀 Step 1 Step Transition with Zod Validation
  const handleStep1Next = async () => {
    const isValid = await trigger([
      "firstName",
      "gender",
      "dob",
      "phone",
      "aadharNo",
      "email",
      "addressLine1",
      "addressLine2",
      "city",
      "district",
      "state",
      "pincode"
    ]);
    if (isValid) {
      setCurrentStep(2);
    } else {
      toast.error("Please resolve highlighted validation errors in Step 1");
    }
  };

  // 🚀 Step 2 Step Transition with Zod Validation
  const handleStep2Next = async () => {
    const isValid = await trigger([
      "session",
      "class",
      "section",
      "fatherName",
      "motherName"
    ]);
    if (isValid) {
      setCurrentStep(3);
    } else {
      toast.error("Please resolve highlighted validation errors in Step 2");
    }
  };

  // 💾 Final Submission (Stream to S3 & Register Student)
  const onFormSubmit = async (data: StudentFormData) => {
    try {
      setSubmitting(true);
      const classCodeMap: Record<string, string> = {
        NURSERY: "NUR",
        LKG: "LKG",
        UKG: "UKG",
        PREP: "PREP",
        PLAYGROUP: "PG"
      };
      const cleanClass =
        classCodeMap[data.class.toUpperCase()] || data.class.replace(/[^A-Z0-9]/gi, "");
      const schoolPrefix = (APP_CONFIG.institution.name.replace(/[^A-Z0-9]/gi, "") || "ADM").toUpperCase();
      const admissionNumber =
        data.admissionNo || `${schoolPrefix}${new Date().getFullYear()}${cleanClass}0001`;

      // 1. Upload Avatar if new cropped blob is pending
      const uploadedAvatarUrl = pendingAvatarBlob
        ? await (async () => {
            const file = new File(
              [pendingAvatarBlob],
              `student-avatar-${Date.now()}.jpg`,
              { type: "image/jpeg" }
            );
            const formData = new FormData();
            formData.append("file", file);
            const uploadRes: any = await client.upload(
              `/upload?folder=students/${admissionNumber}/avatars`,
              formData
            );
            return uploadRes?.url || "";
          })()
        : "";

      const finalImageUrl = uploadedAvatarUrl || data.image || "";

      // 2. Upload Pending Documents to S3 under students/{admissionNo}/...
      const finalDocs = [...existingDocs];
      const pendingKeys = Object.keys(pendingDocs);

      for (const docType of pendingKeys) {
        const item = pendingDocs[docType];
        const formData = new FormData();
        formData.append("file", item.file);

        const folderMap: Record<string, string> = {
          BIRTH_CERTIFICATE: "birth-certificates",
          AADHAAR_FRONT: "id-proofs",
          AADHAAR_BACK: "id-proofs",
          TRANSFER_CERTIFICATE: "transfer-certificates",
          PARENT_ID: "parent-proofs"
        };
        const subFolder = folderMap[docType] || "documents";
        const targetFolder = `students/${admissionNumber}/${subFolder}`;

        const uploadRes: any = await client.upload(
          `/upload?folder=${targetFolder}`,
          formData
        );

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

      // 3. Assemble Full Name & Formatted Address
      const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
      const formattedAddress = [
        data.addressLine1,
        data.addressLine2,
        data.city,
        `Dist: ${data.district}`,
        `${data.state} - ${data.pincode}`
      ]
        .filter(Boolean)
        .join(", ");

      // 4. Prepare Payload & Persist Record
      const payload = {
        ...data,
        name: fullName,
        firstName: data.firstName,
        lastName: data.lastName,
        address: formattedAddress,
        image: finalImageUrl,
        documents: finalDocs,
        admissionNo: admissionNumber,
        email: data.email ? data.email.trim().toLowerCase() : undefined,
        transportRouteId: data.transportRouteId ? Number(data.transportRouteId) : undefined,
        transportStopId: data.transportStopId ? Number(data.transportStopId) : undefined
      };

      if (id) {
        await client.put(`/students/${id}`, payload);
        toast.success("Student profile updated successfully!");
        setTimeout(() => router.push("/students"), 800);
      } else {
        const res: any = await client.post("/students", payload);
        toast.success("Student admitted successfully!");
        setSuccessAdmission({
          id: res?.id,
          name: fullName,
          admissionNo: res?.admissionNo || admissionNumber,
          class: data.class,
          section: data.section || "A",
          dob: data.dob,
          fatherName: data.fatherName,
          motherName: data.motherName,
          phone: data.phone,
          address: formattedAddress,
          password: data.password || data.dob.replace(/-/g, "")
        });
      }
    } catch (err: any) {
      const msg = err?.message || err?.error || "Registration failed. Please check form details.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyAdmissionId = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    toast.success("Admission ID copied to clipboard!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Loading Admission Portal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* 🧭 TOP ACTION HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/students")}
              className="h-10 px-4 rounded-xl border-slate-200 text-slate-600 bg-white hover:bg-slate-50 font-bold text-xs uppercase tracking-wider flex items-center gap-2 mb-3 shadow-2xs cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Directory
            </Button>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight font-heading">
              {id ? "Edit Student Profile" : "Student Admission Portal"}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Official institutional student registration with First/Last Name and Village/House Address Grid
            </p>
          </div>

          <Badge className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-xl text-xs font-black uppercase tracking-wider self-start sm:self-auto">
            Session: {watchedSession}
          </Badge>
        </div>

        {/* 🧭 3-STEP PROGRESS STEPPER */}
        <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="grid grid-cols-3 gap-3 md:gap-6 text-center">
            {/* Step 1 */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={cn(
                "p-3 md:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col items-center gap-2",
                currentStep === 1
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : currentStep > 1
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-slate-50 text-slate-400 border-slate-200/60"
              )}
            >
              <div
                className={cn(
                  "h-7 w-7 rounded-xl flex items-center justify-center text-xs font-black",
                  currentStep === 1
                    ? "bg-white text-indigo-600"
                    : currentStep > 1
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-600"
                )}
              >
                {currentStep > 1 ? <Check size={14} strokeWidth={3} /> : "1"}
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider">
                Identity & Address
              </span>
            </button>

            {/* Step 2 */}
            <button
              type="button"
              onClick={handleStep1Next}
              className={cn(
                "p-3 md:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col items-center gap-2",
                currentStep === 2
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : currentStep > 2
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-slate-50 text-slate-400 border-slate-200/60"
              )}
            >
              <div
                className={cn(
                  "h-7 w-7 rounded-xl flex items-center justify-center text-xs font-black",
                  currentStep === 2
                    ? "bg-white text-indigo-600"
                    : currentStep > 2
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-600"
                )}
              >
                {currentStep > 2 ? <Check size={14} strokeWidth={3} /> : "2"}
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider">
                Academic & Parents
              </span>
            </button>

            {/* Step 3 */}
            <button
              type="button"
              onClick={async () => {
                const s1 = await trigger([
                  "firstName",
                  "lastName",
                  "gender",
                  "dob",
                  "phone",
                  "aadharNo",
                  "email",
                  "addressLine1",
                  "city",
                  "district",
                  "state",
                  "pincode"
                ]);
                const s2 = await trigger(["session", "class", "fatherName"]);
                if (s1 && s2) setCurrentStep(3);
                else toast.error("Please complete steps 1 and 2 first");
              }}
              className={cn(
                "p-3 md:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col items-center gap-2",
                currentStep === 3
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-slate-50 text-slate-400 border-slate-200/60"
              )}
            >
              <div
                className={cn(
                  "h-7 w-7 rounded-xl flex items-center justify-center text-xs font-black",
                  currentStep === 3 ? "bg-white text-indigo-600" : "bg-slate-200 text-slate-600"
                )}
              >
                3
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider">
                Document Vault
              </span>
            </button>
          </div>
        </div>

        {/* 📝 REACT HOOK FORM CONTAINER */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
          {/* ================= STEP 1: STUDENT IDENTITY & STRUCTURED ADDRESS ================= */}
          {currentStep === 1 && (
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/80 shadow-sm space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase font-heading">
                    Step 1: Student Identity & Address
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    First/Last name breakdown, demographics, and village/house structured postal address
                  </p>
                </div>
              </div>

              {/* 📷 Passport Photo Upload & Crop Box */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group shrink-0">
                  <div className="w-28 h-36 sm:w-32 sm:h-40 rounded-2xl bg-white border-2 border-dashed border-indigo-300 overflow-hidden flex items-center justify-center shadow-md ring-4 ring-indigo-50/70">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Student Passport Photo" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-center p-3 text-slate-400">
                        <Camera size={26} className="mx-auto mb-1 text-indigo-400" />
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
                    className="absolute -bottom-2 -right-2 h-9 w-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-105"
                    title="Upload & Crop Passport Photo"
                  >
                    <Camera size={16} />
                  </button>
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h4 className="text-sm font-black text-slate-900 uppercase font-heading">
                      Student Passport Photograph
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
                      onClick={() => fileInputRef.current?.click()}
                      className="h-9 px-4 rounded-xl border-slate-200 text-indigo-600 hover:bg-indigo-50 font-bold text-xs uppercase cursor-pointer"
                    >
                      <UploadCloud size={14} className="mr-1.5" /> Upload & Crop Passport Photo
                    </Button>
                    <span className="text-[11px] text-slate-400 font-medium">
                      JPG, PNG • Maximum 5 MB • Standard 3.5:4.5
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* 👤 Name & Demographics Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* First Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
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
                      errors.firstName && "border-rose-500 focus-visible:ring-rose-500"
                    )}
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Last Name / Surname
                  </label>
                  <Input
                    {...register("lastName")}
                    placeholder="Enter last name"
                    className="h-11 rounded-xl text-xs font-bold"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Gender <span className="text-rose-500">*</span>
                  </label>
                  <select
                    {...register("gender")}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                    <span>
                      Date of Birth <span className="text-rose-500">*</span>
                    </span>
                    {errors.dob && (
                      <span className="text-[10px] font-bold text-rose-500 lowercase">
                        {errors.dob.message}
                      </span>
                    )}
                  </label>
                  <Input
                    type="date"
                    placeholder="DD/MM/YYYY"
                    {...register("dob")}
                    className={cn(
                      "h-11 rounded-xl text-xs font-bold",
                      errors.dob && "border-rose-500 focus-visible:ring-rose-500"
                    )}
                  />
                </div>

                {/* Primary Contact Mobile */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                    <span>
                      Mobile Number <span className="text-rose-500">*</span>
                    </span>
                    {errors.phone && (
                      <span className="text-[10px] font-bold text-rose-500 lowercase">
                        {errors.phone.message}
                      </span>
                    )}
                  </label>
                  <Input
                    {...register("phone")}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    className={cn(
                      "h-11 rounded-xl text-xs font-mono font-bold",
                      errors.phone && "border-rose-500 focus-visible:ring-rose-500"
                    )}
                  />
                  {!errors.phone && (
                    <p className="text-[10px] text-slate-400 font-medium">
                      Enter a valid 10-digit mobile number.
                    </p>
                  )}
                </div>

                {/* Student Aadhaar Number */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                    <span>
                      Aadhaar Number <span className="text-rose-500">*</span>
                    </span>
                    {errors.aadharNo && (
                      <span className="text-[10px] font-bold text-rose-500 lowercase">
                        {errors.aadharNo.message}
                      </span>
                    )}
                  </label>
                  <Input
                    {...register("aadharNo")}
                    placeholder="XXXX XXXX XXXX"
                    maxLength={12}
                    className={cn(
                      "h-11 rounded-xl text-xs font-mono font-bold",
                      errors.aadharNo && "border-rose-500 focus-visible:ring-rose-500"
                    )}
                  />
                  {!errors.aadharNo && (
                    <p className="text-[10px] text-slate-400 font-medium">
                      12-digit Aadhaar number.
                    </p>
                  )}
                </div>

                {/* Blood Group */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Blood Group
                  </label>
                  <select
                    {...register("bloodGroup")}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="">Select Blood Group</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Religion */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Religion Axis
                  </label>
                  <select
                    {...register("religion")}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="">Select Religion</option>
                    {RELIGIONS.map((rel) => (
                      <option key={rel} value={rel}>
                        {rel}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Parent Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                    <span>
                      Parent's Email Address <span className="text-rose-500">*</span>
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
                    placeholder="Enter parent's email"
                    className={cn(
                      "h-11 rounded-xl text-xs font-bold",
                      errors.email && "border-rose-500 focus-visible:ring-rose-500"
                    )}
                  />
                </div>
              </div>

              {/* 📍 STRUCTURED RESIDENTIAL ADDRESS GRID */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <MapPin size={18} className="text-indigo-600" />
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider font-heading">
                      Residential Postal Address
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Accurate village, post office, tehsil, and pincode details for correspondence
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* House No. / Village */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                      <span>
                        House No., Street, Village <span className="text-rose-500">*</span>
                      </span>
                      {errors.addressLine1 && (
                        <span className="text-[10px] font-bold text-rose-500 lowercase">
                          {errors.addressLine1.message}
                        </span>
                      )}
                    </label>
                    <Input
                      {...register("addressLine1")}
                      placeholder="House No., Street, Village"
                      className={cn(
                        "h-11 bg-white rounded-xl text-xs font-bold",
                        errors.addressLine1 && "border-rose-500 focus-visible:ring-rose-500"
                      )}
                    />
                  </div>

                  {/* Post Office / Area / Landmark */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                      <span>
                        Post Office / Landmark <span className="text-rose-500">*</span>
                      </span>
                      {errors.addressLine2 && (
                        <span className="text-[10px] font-bold text-rose-500 lowercase">
                          {errors.addressLine2.message}
                        </span>
                      )}
                    </label>
                    <Input
                      {...register("addressLine2")}
                      placeholder="Post Office / Landmark"
                      className={cn(
                        "h-11 bg-white rounded-xl text-xs font-bold",
                        errors.addressLine2 && "border-rose-500 focus-visible:ring-rose-500"
                      )}
                    />
                  </div>

                  {/* City / Tehsil */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                      <span>
                        City / Tehsil / Town <span className="text-rose-500">*</span>
                      </span>
                      {errors.city && (
                        <span className="text-[10px] font-bold text-rose-500 lowercase">
                          {errors.city.message}
                        </span>
                      )}
                    </label>
                    <Input
                      {...register("city")}
                      placeholder="Enter city or tehsil"
                      className={cn(
                        "h-11 bg-white rounded-xl text-xs font-bold",
                        errors.city && "border-rose-500 focus-visible:ring-rose-500"
                      )}
                    />
                  </div>

                  {/* District */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                      <span>
                        District <span className="text-rose-500">*</span>
                      </span>
                      {errors.district && (
                        <span className="text-[10px] font-bold text-rose-500 lowercase">
                          {errors.district.message}
                        </span>
                      )}
                    </label>
                    <Input
                      {...register("district")}
                      placeholder="Enter district"
                      className={cn(
                        "h-11 bg-white rounded-xl text-xs font-bold",
                        errors.district && "border-rose-500 focus-visible:ring-rose-500"
                      )}
                    />
                  </div>

                  {/* State */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      State <span className="text-rose-500">*</span>
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

                  {/* PIN Code */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                      <span>
                        PIN Code <span className="text-rose-500">*</span>
                      </span>
                      {errors.pincode && (
                        <span className="text-[10px] font-bold text-rose-500 lowercase">
                          {errors.pincode.message}
                        </span>
                      )}
                    </label>
                    <Input
                      {...register("pincode")}
                      placeholder="Enter 6-digit PIN code"
                      maxLength={6}
                      className={cn(
                        "h-11 bg-white rounded-xl text-xs font-mono font-bold",
                        errors.pincode && "border-rose-500 focus-visible:ring-rose-500"
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Stepper Footer */}
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  onClick={handleStep1Next}
                  className="h-11 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  Continue to Step 2 <ArrowRight size={15} />
                </Button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: ACADEMIC ENROLLMENT & TRANSPORT ================= */}
          {currentStep === 2 && (
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/80 shadow-sm space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase font-heading">
                    Step 2: Academic Enrollment & Parent Details
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Admission number, classroom allocation, family credentials, and transport
                  </p>
                </div>
              </div>

              {/* Auto Provisioned Admission Number Banner */}
              <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                    Auto-Provisioned Unique Admission Number
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black font-mono text-indigo-950">
                      {watchedAdmissionNo || "Generating..."}
                    </span>
                    {watchedAdmissionNo && (
                      <button
                        type="button"
                        onClick={() => handleCopyAdmissionId(watchedAdmissionNo)}
                        className="p-1.5 rounded-lg bg-white hover:bg-indigo-100 text-indigo-700 transition-all cursor-pointer shadow-2xs"
                        title="Copy Admission ID"
                      >
                        {copiedId ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-center sm:text-right space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Default Student Portal Password
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-700">
                    DOB based: <strong className="text-indigo-600">{watchedPassword || "DDMMYYYY"}</strong>
                  </p>
                </div>
              </div>

              {/* Academic Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Academic Session */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Academic Session <span className="text-rose-500">*</span>
                  </label>
                  <select
                    {...register("session")}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    {academicSessions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Class */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                    <span>
                      Class Enrolled <span className="text-rose-500">*</span>
                    </span>
                    {errors.class && (
                      <span className="text-[10px] font-bold text-rose-500 lowercase">
                        {errors.class.message}
                      </span>
                    )}
                  </label>
                  <select
                    {...register("class")}
                    className={cn(
                      "w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none cursor-pointer",
                      errors.class && "border-rose-500 focus:ring-rose-500"
                    )}
                  >
                    {activeClassesList.map((c) => (
                      <option key={c} value={c}>
                        Class {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                    <span>
                      Section <span className="text-rose-500">*</span>
                    </span>
                    {errors.section && (
                      <span className="text-[10px] font-bold text-rose-500 lowercase">
                        {errors.section.message}
                      </span>
                    )}
                  </label>
                  <select
                    {...register("section")}
                    className={cn(
                      "w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none cursor-pointer",
                      errors.section && "border-rose-500 focus:ring-rose-500"
                    )}
                  >
                    {SECTIONS.map((sec) => (
                      <option key={sec} value={sec}>
                        Section {sec}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Roll Number */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Roll Number (Optional)
                  </label>
                  <Input
                    {...register("rollNo")}
                    placeholder="e.g. 01, 15"
                    className="h-11 rounded-xl text-xs font-bold"
                  />
                </div>

                {/* Father's Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                    <span>
                      Father's Full Name <span className="text-rose-500">*</span>
                    </span>
                    {errors.fatherName && (
                      <span className="text-[10px] font-bold text-rose-500 lowercase">
                        {errors.fatherName.message}
                      </span>
                    )}
                  </label>
                  <Input
                    {...register("fatherName")}
                    placeholder="Enter father's name"
                    className={cn(
                      "h-11 rounded-xl text-xs font-bold",
                      errors.fatherName && "border-rose-500 focus-visible:ring-rose-500"
                    )}
                  />
                </div>

                {/* Mother's Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                    <span>
                      Mother's Full Name <span className="text-rose-500">*</span>
                    </span>
                    {errors.motherName && (
                      <span className="text-[10px] font-bold text-rose-500 lowercase">
                        {errors.motherName.message}
                      </span>
                    )}
                  </label>
                  <Input
                    {...register("motherName")}
                    placeholder="Enter mother's name"
                    className={cn(
                      "h-11 rounded-xl text-xs font-bold",
                      errors.motherName && "border-rose-500 focus-visible:ring-rose-500"
                    )}
                  />
                </div>
              </div>

              {/* 🚌 Transport Logistics Section */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                      <Bus size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider font-heading">
                        School Transport Facility
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Opt-in for institutional bus route pickup and drop
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("transportOpted")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
                  </label>
                </div>

                {watchedTransportOpted && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200/80">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Select Bus Route
                      </label>
                      <select
                        {...register("transportRouteId")}
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none cursor-pointer"
                      >
                        <option value="">Select Designated Route</option>
                        {routes.map((r: any) => (
                          <option key={r.id} value={r.id}>
                            {r.routeName || r.name} ({r.vehicleNo || "Bus"})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Designated Stop
                      </label>
                      <Input
                        {...register("transportStopId")}
                        placeholder="e.g. Main Market, Chowk"
                        className="h-11 bg-white rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Stepper Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="h-11 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft size={15} /> Back
                </Button>

                <Button
                  type="button"
                  onClick={handleStep2Next}
                  className="h-11 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  Continue to Document Vault <ArrowRight size={15} />
                </Button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: COMPREHENSIVE DOCUMENT VAULT ================= */}
          {currentStep === 3 && (
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/80 shadow-sm space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <FileCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase font-heading">
                    Step 3: Student Compliance Document Vault
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Upload Janam Praman Patra, Dual-Side Aadhaar card, and Transfer Certificates
                  </p>
                </div>
              </div>

              {/* Document Slots Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 📜 1. BIRTH CERTIFICATE (JANAM PRAMAN PATRA) */}
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 flex flex-col justify-between hover:border-purple-300 transition-all shadow-2xs">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <Badge className="bg-purple-50 text-purple-700 border border-purple-200 font-black text-[9px] uppercase tracking-wider">
                        MANDATORY
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase font-heading">
                        Birth Certificate (Janam Praman Patra)
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Official municipal / panchayat birth certificate (PDF or Image with crop)
                      </p>
                    </div>

                    {/* Preview / Status Box */}
                    {pendingDocs["BIRTH_CERTIFICATE"] ? (
                      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {pendingDocs["BIRTH_CERTIFICATE"].isPdf ? (
                              <div className="text-center p-1">
                                <FileText size={22} className="text-rose-500 mx-auto" />
                                <span className="text-[8px] font-black text-rose-600 uppercase">PDF</span>
                              </div>
                            ) : (
                              <img
                                src={pendingDocs["BIRTH_CERTIFICATE"].preview}
                                alt="Birth Certificate"
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                              <CheckCircle2 size={13} /> Attached Ready
                            </div>
                            <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
                              {pendingDocs["BIRTH_CERTIFICATE"].fileName}
                            </p>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {pendingDocs["BIRTH_CERTIFICATE"].isPdf ? "PDF Document" : "Cropped Image"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setViewerDoc({
                                title: "Birth Certificate",
                                url: pendingDocs["BIRTH_CERTIFICATE"].preview,
                                isPdf: pendingDocs["BIRTH_CERTIFICATE"].isPdf
                              })
                            }
                            className="h-8 px-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 flex-1"
                          >
                            <Eye size={13} className="text-indigo-600" /> Preview
                          </Button>
                          {!pendingDocs["BIRTH_CERTIFICATE"].isPdf && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleReCrop("BIRTH_CERTIFICATE", "Birth Certificate")
                              }
                              className="h-8 px-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
                              title="Re-Crop Image"
                            >
                              <Crop size={13} className="text-purple-600" /> Re-Crop
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemovePendingDoc("BIRTH_CERTIFICATE")}
                            className="h-8 px-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border-rose-200"
                            title="Remove Document"
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </div>
                    ) : existingDocs.find((d) => d.type === "BIRTH_CERTIFICATE") ? (
                      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-900">Certificate Uploaded</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setViewerDoc({
                                title: "Birth Certificate",
                                url: existingDocs.find((d) => d.type === "BIRTH_CERTIFICATE").url
                              })
                            }
                            className="p-1.5 rounded-lg bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 cursor-pointer"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingDoc("BIRTH_CERTIFICATE")}
                            className="p-1.5 rounded-lg bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <label className="w-full h-11 rounded-xl border border-dashed border-purple-300 hover:border-purple-500 bg-white hover:bg-purple-50/50 text-purple-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs">
                    <UploadCloud size={16} /> Choose & Crop Janam Praman Patra
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleDocSelect(
                            "BIRTH_CERTIFICATE",
                            "Birth Certificate",
                            e.target.files[0]
                          );
                          e.target.value = "";
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* 🪪 2. STUDENT AADHAAR CARD (DUAL-SIDE SLOTS) */}
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 flex flex-col justify-between hover:border-indigo-300 transition-all shadow-2xs">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                        <IdCard size={20} />
                      </div>
                      <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-black text-[9px] uppercase tracking-wider">
                        DUAL-SIDE (FRONT & BACK)
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase font-heading">
                        Student Aadhaar Card (Front & Back)
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Crop front and back card sides cleanly before saving
                      </p>
                    </div>

                    {/* Front & Back Visual Slots */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Front Side Slot */}
                      <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                            Aadhaar Front Side
                          </span>
                          {pendingDocs["AADHAAR_FRONT"] && (
                            <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-1">
                              <Check size={11} /> Ready
                            </span>
                          )}
                        </div>

                        {pendingDocs["AADHAAR_FRONT"] ? (
                          <div className="space-y-2">
                            <div className="h-20 w-full rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative group">
                              <img
                                src={pendingDocs["AADHAAR_FRONT"].preview}
                                alt="Aadhaar Front"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setViewerDoc({
                                    title: "Aadhaar Card (Front)",
                                    url: pendingDocs["AADHAAR_FRONT"].preview
                                  })
                                }
                                className="h-7 px-2 rounded-lg text-[10px] font-bold flex-1"
                              >
                                <Eye size={11} className="mr-1 text-indigo-600" /> Preview
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleReCrop("AADHAAR_FRONT", "Aadhaar Card (Front)")
                                }
                                className="h-7 px-2 rounded-lg text-[10px] font-bold"
                                title="Re-Crop"
                              >
                                <Crop size={11} className="text-purple-600" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemovePendingDoc("AADHAAR_FRONT")}
                                className="h-7 px-2 rounded-lg text-[10px] font-bold text-rose-600"
                                title="Remove"
                              >
                                <Trash2 size={11} />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <label className="w-full h-20 rounded-xl border border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/80 text-indigo-700 font-bold text-[10px] uppercase flex flex-col items-center justify-center gap-1 cursor-pointer transition-all">
                            <UploadCloud size={16} /> Choose & Crop Front
                            <input
                              type="file"
                              accept=".pdf,image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleDocSelect(
                                    "AADHAAR_FRONT",
                                    "Aadhaar Card (Front)",
                                    e.target.files[0]
                                  );
                                  e.target.value = "";
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      {/* Back Side Slot */}
                      <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                            Aadhaar Back Side
                          </span>
                          {pendingDocs["AADHAAR_BACK"] && (
                            <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-1">
                              <Check size={11} /> Ready
                            </span>
                          )}
                        </div>

                        {pendingDocs["AADHAAR_BACK"] ? (
                          <div className="space-y-2">
                            <div className="h-20 w-full rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative group">
                              <img
                                src={pendingDocs["AADHAAR_BACK"].preview}
                                alt="Aadhaar Back"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setViewerDoc({
                                    title: "Aadhaar Card (Back)",
                                    url: pendingDocs["AADHAAR_BACK"].preview
                                  })
                                }
                                className="h-7 px-2 rounded-lg text-[10px] font-bold flex-1"
                              >
                                <Eye size={11} className="mr-1 text-indigo-600" /> Preview
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleReCrop("AADHAAR_BACK", "Aadhaar Card (Back)")
                                }
                                className="h-7 px-2 rounded-lg text-[10px] font-bold"
                                title="Re-Crop"
                              >
                                <Crop size={11} className="text-purple-600" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemovePendingDoc("AADHAAR_BACK")}
                                className="h-7 px-2 rounded-lg text-[10px] font-bold text-rose-600"
                                title="Remove"
                              >
                                <Trash2 size={11} />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <label className="w-full h-20 rounded-xl border border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/80 text-indigo-700 font-bold text-[10px] uppercase flex flex-col items-center justify-center gap-1 cursor-pointer transition-all">
                            <UploadCloud size={16} /> Choose & Crop Back
                            <input
                              type="file"
                              accept=".pdf,image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleDocSelect(
                                    "AADHAAR_BACK",
                                    "Aadhaar Card (Back)",
                                    e.target.files[0]
                                  );
                                  e.target.value = "";
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 📑 3. TRANSFER CERTIFICATE (TC) / MARKSHEET */}
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 flex flex-col justify-between hover:border-emerald-300 transition-all shadow-2xs">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <GraduationCap size={20} />
                      </div>
                      <Badge className="bg-slate-200 text-slate-700 border-none font-bold text-[9px] uppercase">
                        OPTIONAL
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase font-heading">
                        Transfer Certificate (TC) / Marksheet
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Previous school transfer certificate or report card
                      </p>
                    </div>

                    {pendingDocs["TRANSFER_CERTIFICATE"] ? (
                      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {pendingDocs["TRANSFER_CERTIFICATE"].isPdf ? (
                              <div className="text-center p-1">
                                <FileText size={22} className="text-rose-500 mx-auto" />
                                <span className="text-[8px] font-black text-rose-600 uppercase">PDF</span>
                              </div>
                            ) : (
                              <img
                                src={pendingDocs["TRANSFER_CERTIFICATE"].preview}
                                alt="TC"
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                              <CheckCircle2 size={13} /> Attached Ready
                            </div>
                            <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
                              {pendingDocs["TRANSFER_CERTIFICATE"].fileName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setViewerDoc({
                                title: "Transfer Certificate",
                                url: pendingDocs["TRANSFER_CERTIFICATE"].preview,
                                isPdf: pendingDocs["TRANSFER_CERTIFICATE"].isPdf
                              })
                            }
                            className="h-8 px-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 flex-1"
                          >
                            <Eye size={13} className="text-indigo-600" /> Preview
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemovePendingDoc("TRANSFER_CERTIFICATE")}
                            className="h-8 px-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border-rose-200"
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <label className="w-full h-11 rounded-xl border border-dashed border-emerald-300 hover:border-emerald-500 bg-white hover:bg-emerald-50 text-emerald-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs">
                    <UploadCloud size={16} /> Choose & Crop TC / Marksheet
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleDocSelect(
                            "TRANSFER_CERTIFICATE",
                            "Transfer Certificate",
                            e.target.files[0]
                          );
                          e.target.value = "";
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* 🗂️ 4. PARENT IDENTIFICATION / PROOF */}
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 flex flex-col justify-between hover:border-amber-300 transition-all shadow-2xs">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                        <Users size={20} />
                      </div>
                      <Badge className="bg-slate-200 text-slate-700 border-none font-bold text-[9px] uppercase">
                        OPTIONAL
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase font-heading">
                        Parent Identification Proof
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Father or Mother Aadhaar / Voter ID / Passport
                      </p>
                    </div>

                    {pendingDocs["PARENT_ID"] ? (
                      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {pendingDocs["PARENT_ID"].isPdf ? (
                              <div className="text-center p-1">
                                <FileText size={22} className="text-rose-500 mx-auto" />
                                <span className="text-[8px] font-black text-rose-600 uppercase">PDF</span>
                              </div>
                            ) : (
                              <img
                                src={pendingDocs["PARENT_ID"].preview}
                                alt="Parent ID"
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                              <CheckCircle2 size={13} /> Attached Ready
                            </div>
                            <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
                              {pendingDocs["PARENT_ID"].fileName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setViewerDoc({
                                title: "Parent ID Proof",
                                url: pendingDocs["PARENT_ID"].preview,
                                isPdf: pendingDocs["PARENT_ID"].isPdf
                              })
                            }
                            className="h-8 px-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 flex-1"
                          >
                            <Eye size={13} className="text-indigo-600" /> Preview
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemovePendingDoc("PARENT_ID")}
                            className="h-8 px-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border-rose-200"
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <label className="w-full h-11 rounded-xl border border-dashed border-amber-300 hover:border-amber-500 bg-white hover:bg-amber-50 text-amber-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs">
                    <UploadCloud size={16} /> Choose & Crop Parent ID Proof
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleDocSelect(
                            "PARENT_ID",
                            "Parent ID Proof",
                            e.target.files[0]
                          );
                          e.target.value = "";
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Stepper Footer & Final Submit */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft size={15} /> Back
                </Button>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-12 px-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} /> Uploading Vault & Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} /> {id ? "Update Student Profile" : "Confirm & Enroll Student"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* 🖼️ INTERACTIVE PASSPORT PHOTO CROPPER MODAL (35mm x 45mm) */}
      {imageToCrop && (
        <DocumentCropperModal
          imageSrc={imageToCrop}
          documentTitle="Student Passport Photograph (35mm × 45mm)"
          initialAspect={3.5 / 4.5}
          onCancel={() => setImageToCrop(null)}
          onCropComplete={(croppedBlob, previewUrl) => {
            setPendingAvatarBlob(croppedBlob);
            setAvatarPreview(previewUrl);
            setImageToCrop(null);
            toast.success("Passport photo aligned & attached!");
          }}
        />
      )}

      {/* 🖼️ INTERACTIVE DOCUMENT CROPPER MODAL */}
      {docToCrop && (
        <DocumentCropperModal
          imageSrc={docToCrop.imageSrc}
          documentTitle={docToCrop.title}
          onCancel={() => setDocToCrop(null)}
          onCropComplete={handleDocCropComplete}
        />
      )}

      {/* 👁️ DOCUMENT FULL SCREEN VIEWER MODAL */}
      {viewerDoc && (
        <DocumentViewerModal
          title={viewerDoc.title}
          url={viewerDoc.url}
          isPdf={viewerDoc.isPdf}
          onClose={() => setViewerDoc(null)}
        />
      )}

      {/* 🎓 SUCCESS ADMISSION CREDENTIALS MODAL */}
      {successAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-100 space-y-6 text-center">
            <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
              <Sparkles size={32} />
            </div>

            <div className="space-y-1">
              <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">
                ADMISSION CONFIRMED
              </Badge>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight font-heading mt-2">
                {successAdmission.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Enrolled in <strong>Class {successAdmission.class} - Section {successAdmission.section}</strong>
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Unique Admission ID
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyAdmissionId(successAdmission.admissionNo)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-200 text-indigo-700 rounded-lg text-xs font-mono font-black border border-slate-200 transition-all cursor-pointer"
                >
                  <span>{successAdmission.admissionNo}</span>
                  <Copy size={12} />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Student Portal Password
                </span>
                <span className="text-xs font-mono font-bold text-slate-800">
                  {successAdmission.password}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                type="button"
                onClick={() => setIsAdmissionSlipOpen(true)}
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                <Receipt size={16} className="text-white" /> Print Admission Fee Receipt (प्रवेश शुल्क रसीद)
              </Button>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setSuccessAdmission(null);
                    router.push("/students");
                  }}
                  className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider cursor-pointer"
                >
                  Go to Students Directory
                </Button>

                <Button
                  onClick={() => {
                    setSuccessAdmission(null);
                    router.push("/students/create");
                    window.location.reload();
                  }}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border-slate-200 text-slate-700 font-bold text-xs uppercase cursor-pointer"
                >
                  Enroll Another Student
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🧾 OFFICIAL ADMISSION FEE SLIP MODAL */}
      <AdmissionFeeSlipModal
        isOpen={isAdmissionSlipOpen}
        onOpenChange={setIsAdmissionSlipOpen}
        studentId={successAdmission?.id}
        studentData={successAdmission}
      />
    </div>
  );
}
