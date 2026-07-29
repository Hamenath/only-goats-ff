"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { Image as ImageIcon, Upload, Trash2, Loader2, X } from "lucide-react";
import { ImageModal } from "@/components/admin/ImageModal";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import toast from "react-hot-toast";
import axios from "axios";

export default function GalleryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "gallery"), snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "only_goats_uploads");
        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, fd
        );
        await addDoc(collection(db, "gallery"), {
          url: res.data.secure_url, publicId: res.data.public_id,
          filename: file.name, createdAt: serverTimestamp(),
        });
      }
      toast.success(`${files.length} image(s) uploaded!`);
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "gallery", id));
    setConfirmDelete(null);
    toast.success("Image removed");
  };

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A" }}>Gallery</h1>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>{items.length} images • Powered by Cloudinary</p>
        </div>
        <div>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleUpload} style={{ display: "none" }} id="gallery-upload" />
          <label htmlFor="gallery-upload" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "9px 16px", background: uploading ? "#F87171" : "#EF4444",
            color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600,
            cursor: uploading ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif",
          }}>
            {uploading ? <Loader2 size={15} style={{ animation: "gspin 0.8s linear infinite" }} /> : <Upload size={15} />}
            {uploading ? "Uploading..." : "Upload Images"}
          </label>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const input = document.getElementById("gallery-upload") as HTMLInputElement; if (input) { const dt = new DataTransfer(); Array.from(e.dataTransfer.files).forEach(f => dt.items.add(f)); input.files = dt.files; handleUpload({ target: input } as any); } }}
        style={{ border: "2px dashed #E2E8F0", borderRadius: 16, padding: 24, textAlign: "center", marginBottom: 24, background: "#F8FAFC", cursor: "pointer" }}
        onClick={() => fileRef.current?.click()}
      >
        <Upload size={24} color="#94A3B8" style={{ margin: "0 auto 8px" }} />
        <p style={{ fontSize: 13, color: "#64748B" }}>Drag & drop images or <span style={{ color: "#EF4444", fontWeight: 600 }}>click to browse</span></p>
        <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>Supports: JPG, PNG, WebP (max 10MB each)</p>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {[...Array(6)].map((_, i) => <div key={i} style={{ aspectRatio: "1", borderRadius: 12, background: "#F1F5F9" }} />)}
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#94A3B8" }}>
          <ImageIcon size={48} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
          <p style={{ fontSize: 14 }}>No images yet. Upload some above.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {items.map(item => (
            <div key={item.id} style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid #E2E8F0", background: "#F8FAFC", aspectRatio: "1", cursor: "pointer" }}>
              <img
                src={item.url}
                alt={item.filename || "Gallery image"}
                onClick={() => setPreview(item.url)}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.2s" }}
                onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = "scale(1.04)"}
                onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"}
              />
              <button
                onClick={() => setConfirmDelete(item.id)}
                style={{
                  position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: 8,
                  background: "rgba(220,38,38,0.9)", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Trash2 size={13} color="#fff" />
              </button>
            </div>
          ))}
        </div>
      )}

      {preview && <ImageModal src={preview} onClose={() => setPreview(null)} />}
      {confirmDelete && (
        <ConfirmModal title="Delete Image" message="This image will be removed from the gallery. It won't be deleted from Cloudinary." confirmLabel="Remove" onConfirm={() => handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
      )}

      <style>{`@keyframes gspin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
