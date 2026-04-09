import { put, del } from '@vercel/blob';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadFile = async (file) => {
    const originalName = file.originalname || 'upload.bin';

    // Check if we are in production (Vercel) and have Blob token
    if (process.env.BLOB_READ_WRITE_TOKEN) {
        try {
            const { url } = await put(Date.now() + '-' + originalName, file.buffer, { access: 'public' });
            return url;
        } catch (err) {
            console.error("Vercel Blob Upload Failed:", err.message);
            // On Vercel, if Blob fails, we MUST fallback to /tmp or we get a 500 error trying to write to /var/task/
            if (process.env.VERCEL) throw err;
        }
    }

    // Safety for Production: Never try to write to read-only disk on Vercel
    if (process.env.VERCEL) {
        console.error("CRITICAL: BLOB_READ_WRITE_TOKEN is missing in Production. Image upload skipped.");
        return `https://placehold.co/600x400?text=Enable+Vercel+Blob+Storage`;
    }

    // Local Development Fallback
    const filename = Date.now() + '-' + originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uploadDir = path.join(__dirname, '../../uploads');

    // Ensure uploads directory exists locally
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadPath = path.join(uploadDir, filename);
    fs.writeFileSync(uploadPath, file.buffer);
    return `/uploads/${filename}`;
};

export const deleteFile = async (fileUrl) => {
    if (!fileUrl) return;

    if (fileUrl.includes('public.blob.vercel-storage.com')) {
        try {
            await del(fileUrl);
        } catch (error) {
            console.error("Failed to delete from Vercel Blob:", error);
        }
    } else if (fileUrl.startsWith('/uploads/')) {
        try {
            const filename = path.basename(fileUrl);
            const filepath = path.join(__dirname, '../../uploads', filename);
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
        } catch (error) {
            console.error("Failed to delete local file:", error);
        }
    }
};
