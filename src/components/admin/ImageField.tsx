import React, { useState, useRef } from 'react';
import { uploadImage, listDriveImages, deleteImage, type StoredImage } from '../../lib/admin-service';
import { driveImageUrl } from '../../lib/drive-image';
import { usePortfolioData } from '../../context/PortfolioContext';

export interface ImageFieldProps {
  label: string;
  category: 'posters' | 'analytics' | 'seo-sites' | 'social' | 'ads' | 'works' | 'posts' | 'testimonials' | string;
  value: string;
  driveFileId?: string;
  alt?: string;
  onChange: (data: { image: string; driveFileId?: string; alt?: string }) => void;
  aspectRatioClass?: string;
  helperText?: string;
}

export const ImageField: React.FC<ImageFieldProps> = ({
  label,
  category,
  value,
  driveFileId,
  alt = '',
  onChange,
  aspectRatioClass = 'aspect-[16/10]',
  helperText,
}) => {
  const { showToast } = usePortfolioData();
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [showDriveModal, setShowDriveModal] = useState<boolean>(false);
  const [driveFiles, setDriveFiles] = useState<StoredImage[]>([]);
  const [loadingDrive, setLoadingDrive] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalize category folder name (e.g. poster -> posters, seo-site -> seo-sites, ad -> ads)
  const getDriveFolderCategory = (cat: string): string => {
    switch (cat.toLowerCase()) {
      case 'poster':
        return 'posters';
      case 'analytics':
        return 'analytics';
      case 'seo-site':
        return 'seo-sites';
      case 'social':
        return 'social';
      case 'ad':
        return 'ads';
      case 'work':
        return 'works';
      case 'post':
        return 'posts';
      case 'testimonial':
        return 'testimonials';
      default:
        return cat;
    }
  };

  const folderCategory = getDriveFolderCategory(category);

  // Handle file selection / drop
  const processFile = async (file: File) => {
    // 1. Validation
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      showToast('Wrong file type! Please upload JPG, PNG, or WebP only.', 'error');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      showToast('File too large! Max file size before compression is 20MB.', 'error');
      return;
    }

    setUploading(true);
    showToast(`Compressing and uploading ${file.name}...`, 'info');

    try {
      const res = await uploadImage(file, folderCategory);
      onChange({
        image: res.url,
        driveFileId: res.id,
        alt: alt || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      });
      showToast('Image uploaded to Firebase Storage!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Upload failed. Please try again.', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Open Drive browser modal
  const handleOpenDriveModal = async () => {
    setShowDriveModal(true);
    setLoadingDrive(true);
    try {
      const files = await listDriveImages(folderCategory);
      setDriveFiles(files);
      if (files.length === 0) {
        showToast(`No images in "${folderCategory}" yet. Upload your first image!`, 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Could not load the image library.', 'error');
    } finally {
      setLoadingDrive(false);
    }
  };

  const handleSelectDriveFile = (file: StoredImage) => {
    onChange({
      image: file.url,
      driveFileId: file.id,
      alt: alt || file.name.replace(/\.[^/.]+$/, ''),
    });
    setShowDriveModal(false);
    showToast(`Selected "${file.name}"`, 'success');
  };

  const handleRemove = () => {
    onChange({
      image: '',
      driveFileId: undefined,
      alt: '',
    });
  };

  const isStorageUrl = (u?: string) => !!u && u.includes('firebasestorage.googleapis.com');
  // Storage object path can always be recovered from the download URL (…/o/<encoded path>?alt=media)
  const pathFromUrl = (u?: string): string => {
    const m = u ? /\/o\/([^?]+)/.exec(u) : null;
    return m ? decodeURIComponent(m[1]) : '';
  };

  // Permanently delete a file from Firebase Storage (and clear this field if it was the selected one)
  const handleDeleteStored = async (path: string, url?: string) => {
    if (!confirm('Permanently delete this image file from storage? Pages still using it will show a placeholder.')) return;
    setDeleting(path);
    try {
      await deleteImage(path);
      setDriveFiles((files) => files.filter((f) => f.id !== path));
      if (url && url === value) onChange({ image: '', driveFileId: undefined, alt: '' });
      showToast('Image deleted from storage.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete image.', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const resolvedPreviewUrl = driveImageUrl(value, 600);

  return (
    <div className="space-y-3">
      {/* Label and Actions */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
          <span>{label}</span>
          <span className="text-[10px] text-neutral-400 font-normal">
            (Storage folder: <span className="font-mono text-primary font-medium">{folderCategory}</span>)
          </span>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenDriveModal}
            className="text-xs font-semibold text-primary hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-blue-50"
          >
            <span className="material-symbols-outlined text-[16px]">photo_library</span>
            <span>Image library</span>
          </button>


        </div>
      </div>

      {helperText && <p className="text-[11px] text-neutral-500">{helperText}</p>}

      {/* Main Upload / Preview Container */}
      {value ? (
        <div className="relative rounded-2xl border border-neutral-200 overflow-hidden bg-neutral-50 group">
          <div className={`${aspectRatioClass} w-full relative bg-neutral-900/5`}>
            <img
              src={resolvedPreviewUrl}
              alt={alt || label}
              className="w-full h-full object-cover"
              onError={(e) => {
                // If drive image fails to load, keep raw or styled fallback
                (e.target as HTMLElement).classList.add('opacity-40');
              }}
            />

            {driveFileId && (
              <div className="absolute top-2 left-2 bg-neutral-900/80 backdrop-blur-md text-white text-[10px] font-mono font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-blue-400">cloud_done</span>
                <span>Firebase Storage</span>
              </div>
            )}

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-neutral-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 text-xs font-bold shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">upload</span>
                <span>Replace</span>
              </button>

              <button
                type="button"
                onClick={handleOpenDriveModal}
                className="px-3.5 py-2 rounded-xl bg-primary hover:bg-blue-700 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">photo_library</span>
                <span>Library</span>
              </button>

              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">link_off</span>
                <span>Remove</span>
              </button>

              {isStorageUrl(value) && pathFromUrl(value) && (
                <button
                  type="button"
                  disabled={deleting === pathFromUrl(value)}
                  onClick={() => handleDeleteStored(pathFromUrl(value), value)}
                  className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold shadow-lg flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  <span>{deleting === pathFromUrl(value) ? 'Deleting…' : 'Delete file'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Drag & Drop Upload Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
            isDragging
              ? 'border-primary bg-blue-50/60 scale-[1.01]'
              : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50/60 hover:bg-neutral-50'
          }`}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-neutral-200/80 flex items-center justify-center text-primary">
            {uploading ? (
              <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            ) : (
              <span className="material-symbols-outlined text-[26px]">cloud_upload</span>
            )}
          </div>

          <div>
            <p className="text-xs sm:text-sm font-semibold text-neutral-800">
              {uploading
                ? 'Compressing & uploading...'
                : 'Click to upload or drag and drop image'}
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              JPG, PNG, or WebP (Client-resized to max 2000px, quality 0.85)
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              <span>Upload Image</span>
            </button>

            <span className="text-xs text-neutral-400">or</span>

            <button
              type="button"
              disabled={uploading}
              onClick={handleOpenDriveModal}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-primary text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">photo_library</span>
              <span>Browse library</span>
            </button>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* Alt Text Input */}
      <div>
        <label className="text-[11px] font-bold text-neutral-700 block mb-1">
          Accessibility &amp; SEO Alt Text
        </label>
        <input
          type="text"
          value={alt}
          placeholder="Descriptive explanation of image content..."
          onChange={(e) => onChange({ image: value, driveFileId, alt: e.target.value })}
          className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Drive Picker Modal */}
      {showDriveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">photo_library</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">Image Library (Firebase Storage)</h3>
                  <p className="text-xs text-neutral-500">
                    Folder: <span className="font-mono font-bold text-primary">{folderCategory}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDriveModal(false)}
                className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto flex-1">
              {loadingDrive ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-neutral-500">
                  <div className="w-8 h-8 rounded-full border-3 border-primary border-t-transparent animate-spin"></div>
                  <span className="text-xs">Loading images...</span>
                </div>
              ) : driveFiles.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                    <span className="material-symbols-outlined text-[28px]">folder_off</span>
                  </div>
                  <p className="text-sm font-semibold text-neutral-700">No images found in "{folderCategory}"</p>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Upload an image and it will be saved to this folder in Firebase Storage.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDriveModal(false);
                      fileInputRef.current?.click();
                    }}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">upload</span>
                    <span>Upload New Image Now</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {driveFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => handleSelectDriveFile(file)}
                      className="group relative rounded-xl border border-neutral-200 overflow-hidden hover:border-primary hover:shadow-md cursor-pointer transition-all bg-neutral-50 flex flex-col"
                    >
                      <div className="aspect-[4/3] bg-neutral-200/50 relative overflow-hidden">
                        <img
                          src={file.thumbnail || file.url}
                          alt={file.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="px-2.5 py-1 rounded-lg bg-neutral-900 text-white text-[10px] font-bold shadow">
                            Select
                          </span>
                        </div>
                      </div>

                      <div className="p-2 text-left">
                        <p className="text-[11px] font-medium text-neutral-800 line-clamp-1">{file.name}</p>
                        <button
                          type="button"
                          disabled={deleting === file.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStored(file.id, file.url);
                          }}
                          className="mt-1 text-[10px] font-semibold text-rose-600 hover:underline cursor-pointer disabled:opacity-50"
                        >
                          {deleting === file.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
              <button
                type="button"
                onClick={handleOpenDriveModal}
                disabled={loadingDrive}
                className="text-xs text-neutral-600 hover:text-neutral-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>Refresh Folder</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDriveModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
