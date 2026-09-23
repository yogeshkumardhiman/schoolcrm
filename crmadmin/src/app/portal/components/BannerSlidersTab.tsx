"use client";

import React from 'react';
import { ImageIcon, Camera, Loader2, Check, Plus, Grid, Pencil, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ImageCropperModal from '@/components/ui/ImageCropperModal';
import client from '@/lib/client';
import { toast } from 'react-hot-toast';

interface BannerForm {
    title: string;
    description: string;
    body: string;
    image_url: string;
    display_order: number;
}

interface BannerSlidersTabProps {
    banners: any[];
    bannerForm: BannerForm;
    setBannerForm: React.Dispatch<React.SetStateAction<BannerForm>>;
    editingBannerId: any;
    setEditingBannerId: (id: any) => void;
    saveBannerMutation: {
        isPending: boolean;
        mutate: (data: any) => void;
    };
    deleteBannerMutation: {
        mutate: (id: any) => void;
    };
    getResolvedUrl: (url: string) => string;
}

export const BannerSlidersTab: React.FC<BannerSlidersTabProps> = ({
    banners,
    bannerForm,
    setBannerForm,
    editingBannerId,
    setEditingBannerId,
    saveBannerMutation,
    deleteBannerMutation,
    getResolvedUrl
}) => {
    const [imageToCrop, setImageToCrop] = React.useState<any>(null);
    const [uploading, setUploading] = React.useState(false);

    const isVideoUrl = (url: string) => {
        if (!url) return false;
        const videoExtensions = ['.mp4', '.webm', '.mov', '.ogg'];
        return videoExtensions.some(ext => url.toLowerCase().includes(ext));
    };

    const handleLocalImageUpload = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type.startsWith('video/')) {
            setUploading(true);
            toast.loading("Uploading banner video...");
            try {
                const formDataUpload = new FormData();
                formDataUpload.append('image', file);

                const res = await client.upload('/admin/upload', formDataUpload);

                if (res.url) {
                    setBannerForm({ ...bannerForm, image_url: res.url });
                    toast.success("Banner video uploaded successfully!");
                }
            } catch (err: any) {
                toast.error(`Video upload failed: ${err.message}`);
            } finally {
                toast.dismiss();
                setUploading(false);
            }
            return;
        }

        const reader = new FileReader();
        reader.onload = () => setImageToCrop(reader.result);
        reader.readAsDataURL(file);
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        setUploading(true);
        toast.loading("Uploading cropped banner...");
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('image', croppedBlob, 'banner.jpg');

            const res = await client.upload('/admin/upload', formDataUpload);

            if (res.url) {
                setBannerForm({ ...bannerForm, image_url: res.url });
                setImageToCrop(null);
                toast.success("Banner image cropped & uploaded successfully!");
            }
        } catch (e: any) {
            toast.error(`Crop upload failed: ${e.message}`);
        } finally {
            toast.dismiss();
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Banner Form Card */}
            <Card className="shadow-sm border-slate-200 rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <ImageIcon className="text-blue-600 h-5 w-5" /> 
                            {editingBannerId ? "Edit Website Banner Slide" : "Add Website Banner Slide"}
                        </CardTitle>
                        <Badge variant="outline" className={cn(
                            "font-bold text-xs uppercase px-2.5 py-0.5",
                            banners.length >= 5 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200"
                        )}>
                            Banners: {banners.length} / 5 Max
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Image Upload Area */}
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Banner Slide Image or Video</label>
                            <div 
                                className="relative h-44 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 group cursor-pointer flex flex-col items-center justify-center"
                                onClick={() => document.getElementById('banner-slide-upload')?.click()}
                            >
                                {bannerForm.image_url ? (
                                    isVideoUrl(bannerForm.image_url) ? (
                                        <video src={getResolvedUrl(bannerForm.image_url)} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                                    ) : (
                                        <img src={getResolvedUrl(bannerForm.image_url)} className="w-full h-full object-cover" alt="Banner Preview" />
                                    )
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                                        <Camera size={28} className="text-slate-300 mb-1" />
                                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Upload Banner Image/Video</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-black uppercase tracking-widest">
                                    Change File
                                </div>
                            </div>
                            <input id="banner-slide-upload" type="file" accept="image/*,video/*" hidden onChange={handleLocalImageUpload} />
                        </div>


                        {/* Fields Area */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Banner Tag/Title</label>
                                    <Input 
                                        value={bannerForm.title}
                                        onChange={e => setBannerForm({...bannerForm, title: e.target.value})}
                                        className="h-11 rounded-lg text-sm font-bold uppercase"
                                        placeholder="e.g. WELCOME TO SDM SCHOOL"
                                    />
                                </div>
                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Main Headline/Slogan</label>
                                    <Input 
                                        value={bannerForm.description}
                                        onChange={e => setBannerForm({...bannerForm, description: e.target.value})}
                                        className="h-11 rounded-lg text-sm font-semibold"
                                        placeholder="e.g. Empowering Minds, Shaping Future"
                                    />
                                </div>
                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Banner Body Paragraph Text</label>
                                    <textarea
                                        rows={3}
                                        value={bannerForm.body}
                                        onChange={e => setBannerForm({...bannerForm, body: e.target.value})}
                                        className="w-full border border-slate-200 p-3 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                                        placeholder="e.g. Experience a world-class institutional environment focused on holistic growth and professional mastery."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Display Order</label>
                                    <Input 
                                        type="number"
                                        value={bannerForm.display_order}
                                        onChange={e => setBannerForm({...bannerForm, display_order: parseInt(e.target.value) || 0})}
                                        className="h-11 rounded-lg text-sm font-bold"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="flex items-end gap-2">
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            if (!bannerForm.image_url) {
                                                alert("Please upload a banner image!");
                                                return;
                                            }
                                            saveBannerMutation.mutate(bannerForm);
                                        }}
                                        disabled={saveBannerMutation.isPending}
                                        className="h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 flex-1 shadow-sm"
                                    >
                                        {saveBannerMutation.isPending ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : editingBannerId ? (
                                            <Check className="h-3.5 w-3.5" />
                                        ) : (
                                            <Plus className="h-3.5 w-3.5" />
                                        )}
                                        {editingBannerId ? "Update" : "Add Slide"}
                                    </Button>

                                    {editingBannerId && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setEditingBannerId(null);
                                                setBannerForm({ title: '', description: '', body: '', image_url: '', display_order: 0 });
                                            }}
                                            className="h-11 border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider"
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Active Banners List */}
            <Card className="shadow-sm border-slate-200 rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <Grid className="text-blue-600 h-5 w-5" />
                        Active Website Banners list
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {banners.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <ImageIcon className="mx-auto text-slate-300 h-10 w-10 mb-2" />
                            <h5 className="font-bold text-slate-700 text-sm">No website banners uploaded yet</h5>
                            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">Upload website banner slides using the console above. You can add up to 5 slides.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {banners.map((banner: any, index: number) => (
                                <div 
                                    key={banner.id || index}
                                    className="p-4 rounded-2xl border border-slate-200 bg-white flex gap-4 hover:shadow-md transition-all duration-300 relative group"
                                >
                                    <div className="w-24 h-24 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center">
                                        {isVideoUrl(banner.image_url) ? (
                                            <video src={getResolvedUrl(banner.image_url)} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                                        ) : (
                                            <img src={getResolvedUrl(banner.image_url)} className="w-full h-full object-cover" alt="" />
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between min-w-0 pr-16">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 text-[9px] font-bold py-0.5">
                                                    Order: {banner.display_order}
                                                </Badge>
                                                <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 text-[9px] font-bold py-0.5 uppercase">
                                                    {banner.status || 'ACTIVE'}
                                                </Badge>
                                            </div>
                                            <h5 className="font-black text-xs text-slate-800 leading-tight uppercase truncate">{banner.title || 'Untitled Banner'}</h5>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed line-clamp-1">{banner.description || 'No description slogan provided.'}</p>
                                            {banner.body && (
                                                <p className="text-[9px] text-slate-400 font-medium leading-relaxed line-clamp-2 ">{banner.body}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Absolute Action Buttons inside card */}
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-90 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-255">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => {
                                                setEditingBannerId(banner.id);
                                                setBannerForm({
                                                    title: banner.title || '',
                                                    description: banner.description || '',
                                                    body: banner.body || '',
                                                    image_url: banner.image_url || '',
                                                    display_order: banner.display_order || 0
                                                });
                                                window.scrollTo({ top: 180, behavior: 'smooth' });
                                            }}
                                            className="h-8 w-8 rounded-lg border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => {
                                                if (confirm("Are you sure you want to delete this website banner?")) {
                                                    deleteBannerMutation.mutate(banner.id);
                                                }
                                            }}
                                            className="h-8 w-8 rounded-lg border-rose-100 bg-white hover:bg-rose-50 text-rose-600 hover:border-rose-200"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Crop Modal */}
            {imageToCrop && (
                <ImageCropperModal
                    imageSrc={imageToCrop}
                    onCancel={() => setImageToCrop(null)}
                    onCropComplete={handleCropComplete}
                    isUploading={uploading}
                />
            )}
        </div>
    );
};
