import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

// Renders the media upload interface for an exhibition, handling file selection and preview display
const ExhibitionFormMedia = ({ mediaPreviews, mediaFiles, handleMediaChange, removeMedia, isUploading }) => {
    return (
        <div className="space-y-8">
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-4">Visual Data</label>
                <div className="flex flex-wrap gap-4">
                    {/* Upload Trigger */}
                    <div className="relative group w-32 h-32 border border-dashed border-neutral-300 flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-neutral-50 transition-all">
                        <input
                            type="file"
                            multiple
                            accept="image/*,video/*,audio/*"
                            onChange={handleMediaChange}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            disabled={isUploading}
                        />
                        <Upload className="w-6 h-6 text-neutral-400 group-hover:text-black mb-2 transition-colors" />
                        <span className="text-[10px] font-mono text-neutral-400 group-hover:text-black uppercase">Upload</span>
                    </div>

                    {/* Previews */}
                    {mediaPreviews.map((preview, index) => {
                        const file = mediaFiles && mediaFiles[index];
                        const isVideo = file && file.type.startsWith('video/');
                        const isAudio = file && file.type.startsWith('audio/');

                        return (
                            <div key={index} className="relative w-32 h-32 border border-neutral-200 group bg-neutral-100 flex items-center justify-center overflow-hidden">
                                {isVideo ? (
                                    <video src={preview} className="w-full h-full object-cover" controls={false} muted />
                                ) : isAudio ? (
                                    <div className="flex flex-col items-center justify-center p-2 text-center">
                                        <span className="text-xs font-mono break-all line-clamp-2">{file.name}</span>
                                        <span className="text-[10px] text-neutral-500 uppercase mt-1">Audio</span>
                                    </div>
                                ) : (
                                    <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                )}

                                <button
                                    type="button"
                                    onClick={() => removeMedia(index)}
                                    className="absolute top-1 right-1 bg-white hover:bg-red-500 hover:text-white p-1 rounded-full transition-colors shadow-sm z-20"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        );
                    })}
                </div>
                <p className="mt-4 text-[10px] font-mono text-neutral-400 uppercase tracking-wide">
                    Supported: Images, Video, Audio // Max 100MB per file
                </p>
            </div>
        </div>
    );
};

export default ExhibitionFormMedia;
