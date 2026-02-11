"use client";

import { useState, useRef } from "react";
import { supabaseBrowserClient } from "@/lib/supabaseClient";

interface VideoUploaderProps {
    onUploadComplete: (url: string) => void;
    label?: string;
    maxDuration?: number;
    variant?: "default" | "compact" | "profile";
    bucket?: "videos" | "profiles";
}

export function VideoUploader({
    onUploadComplete,
    label = "Carica un video di presentazione",
    maxDuration = 90,
    variant = "default",
    bucket = "videos"
}: VideoUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const videoPreviewRef = useRef<HTMLVideoElement>(null);

    const startRecording = async () => {
        try {
            setError(null);
            let mediaStream: MediaStream;

            try {
                // Try with both video and audio first
                mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            } catch (initialErr) {
                console.warn("Could not get both video and audio, trying video only...", initialErr);
                try {
                    // Fallback to video only
                    mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                } catch (videoOnlyErr: any) {
                    console.error("Camera access failed:", videoOnlyErr);
                    if (videoOnlyErr.name === "NotFoundError" || videoOnlyErr.name === "DevicesNotFoundError") {
                        throw new Error("Fotocamera non trovata. Verifica che sia collegata.");
                    } else if (videoOnlyErr.name === "NotAllowedError" || videoOnlyErr.name === "PermissionDeniedError") {
                        throw new Error("Permesso negato. Abilita la fotocamera nelle impostazioni del browser.");
                    } else {
                        throw new Error("Errore durante l'accesso alla fotocamera: " + videoOnlyErr.message);
                    }
                }
            }

            setStream(mediaStream);

            setTimeout(() => {
                if (videoPreviewRef.current) {
                    videoPreviewRef.current.srcObject = mediaStream;
                }
            }, 100);

            const recorder = new MediaRecorder(mediaStream);
            mediaRecorderRef.current = recorder;
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: "video/webm" });
                const file = new File([blob], `recording-${Date.now()}.webm`, { type: "video/webm" });

                mediaStream.getTracks().forEach(track => track.stop());
                setStream(null);

                await uploadFile(file);
            };

            recorder.start();
            setIsRecording(true);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setProgress(0);
        setUploading(true);

        const isImage = bucket === "profiles";

        if (isImage) {
            if (!file.type.startsWith("image/")) {
                setError("Per favore carica un'immagine.");
                setUploading(false);
                return;
            }
            await uploadFile(file);
        } else {
            if (!file.type.startsWith("video/")) {
                setError("Per favore carica un file video.");
                setUploading(false);
                return;
            }

            const video = document.createElement("video");
            video.preload = "metadata";
            video.onloadedmetadata = async () => {
                window.URL.revokeObjectURL(video.src);
                if (video.duration > maxDuration) {
                    setError(`Il video è troppo lungo. Massimo ${maxDuration} secondi.`);
                    setUploading(false);
                    return;
                }
                await uploadFile(file);
            };
            video.onerror = () => {
                setError("Errore nel caricamento del file video.");
                setUploading(false);
            };
            video.src = URL.createObjectURL(file);
        }
    };

    const uploadFile = async (file: File) => {
        try {
            const isDemo = typeof document !== 'undefined' && document.cookie.includes("demo_mode=true");

            if (isDemo) {
                setProgress(10);
                await new Promise(r => setTimeout(r, 400));
                setProgress(45);
                await new Promise(r => setTimeout(r, 400));
                setProgress(85);
                await new Promise(r => setTimeout(r, 400));

                const mockUrl = URL.createObjectURL(file);
                setPreviewUrl(mockUrl);
                onUploadComplete(mockUrl);
                setProgress(100);
                return;
            }

            setProgress(5);
            const supabase = supabaseBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Utente non autenticato");
            setProgress(15);

            const bucketName = bucket;
            const fileName = `${user.id}/${Date.now()}-${file.name}`;
            const { data, error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(fileName, file, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (uploadError) throw uploadError;
            setProgress(90);

            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(fileName);

            setPreviewUrl(publicUrl);
            onUploadComplete(publicUrl);
            setProgress(100);
        } catch (err: any) {
            console.error(err);
            setError("Errore durante l'upload: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    if (variant === "profile") {
        return (
            <div className="flex flex-col items-center gap-4">
                <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-full border-2 border-dashed border-neutral-300 bg-neutral-50 flex items-center justify-center cursor-pointer hover:border-neutral-900 transition-all overflow-hidden relative group"
                >
                    {uploading ? (
                        <div className="flex flex-col items-center justify-center bg-white/80 absolute inset-0 z-10">
                            <div className="w-8 h-8 border-2 border-neutral-200 border-t-black rounded-full animate-spin mb-2" />
                            <div className="text-[10px] font-mono text-black font-bold">{progress}%</div>
                        </div>
                    ) : previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400 group-hover:text-black"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                        </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>
                <p className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-[0.2em]">{label}</p>
                {error && <p className="text-red-500 text-[8px] font-mono max-w-[150px] text-center">{error}</p>}
            </div>
        );
    }

    const isCompact = variant === "compact";

    return (
        <div className={`space-y-4 ${isCompact ? 'p-0 border-none bg-transparent' : 'p-6 border border-neutral-200 bg-white rounded-2xl'}`}>
            <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase text-neutral-500 font-mono tracking-widest">{label}</label>
                {!isCompact && <span className="text-[10px] font-mono text-neutral-600">Max {maxDuration}s</span>}
            </div>

            <div
                className={`group border-2 border-dashed border-neutral-200 hover:border-neutral-400 transition-all rounded-xl flex flex-col items-center justify-center gap-3 bg-neutral-50 relative overflow-hidden ${isCompact ? 'min-h-[120px]' : 'min-h-[200px]'}`}
            >
                {stream ? (
                    <video ref={videoPreviewRef} autoPlay muted className="absolute inset-0 w-full h-full object-cover" />
                ) : previewUrl ? (
                    bucket === "profiles" ? (
                        <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Preview" />
                    ) : (
                        <video src={previewUrl} controls className="absolute inset-0 w-full h-full object-cover" />
                    )
                ) : null}

                <div className="relative z-10 flex flex-col items-center gap-4 p-4 w-full">
                    {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-2 border-neutral-200 border-t-black rounded-full animate-spin" />
                            <span className="text-[10px] font-mono text-black animate-pulse">{progress}%</span>
                        </div>
                    ) : isRecording ? (
                        <button
                            type="button"
                            onClick={stopRecording}
                            className="flex flex-col items-center gap-2 group/btn"
                        >
                            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-500 flex items-center justify-center animate-pulse group-hover/btn:scale-110 transition-transform">
                                <div className="w-4 h-4 bg-red-500 rounded-sm" />
                            </div>
                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">Ferma Registrazione</span>
                        </button>
                    ) : (
                        <div className="flex gap-6">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center gap-2 group/upload"
                            >
                                <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center group-hover/upload:border-black group-hover/upload:text-black text-neutral-400 transition-all shadow-sm">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                </div>
                                <span className="text-[9px] font-bold text-neutral-400 group-hover/upload:text-black uppercase tracking-tighter transition-colors">Carica File</span>
                            </button>

                            {bucket === "videos" && (
                                <button
                                    type="button"
                                    onClick={startRecording}
                                    className="flex flex-col items-center gap-2 group/rec"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center group-hover/rec:bg-red-50 group-hover/rec:border-red-500 group-hover/rec:text-red-500 text-neutral-400 transition-all shadow-sm">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" fill="currentColor" /></svg>
                                    </div>
                                    <span className="text-[9px] font-bold text-neutral-400 group-hover/rec:text-red-500 uppercase tracking-tighter transition-colors">Registra Ora</span>
                                </button>
                            )}
                        </div>
                    )}

                    {!uploading && !isRecording && !previewUrl && !isCompact && (
                        <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest mt-2">Format: MP4, WebM (Max {maxDuration}s)</p>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={bucket === "profiles" ? "image/*" : "video/*"}
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={uploading}
                />
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-500 text-[10px] font-mono">
                    {error}
                </div>
            )}
        </div>
    );
}