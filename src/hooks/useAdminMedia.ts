import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface StorageFile {
    name: string
    id: string
    created_at: string
    metadata: Record<string, string>
    url: string
}

export function useAdminMedia(bucket: 'homepage-images' | 'homepage-music') {
    const [files, setFiles] = useState<StorageFile[]>([])
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)

    const fetchFiles = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase.storage
            .from(bucket)
            .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })

        if (error) {
            console.error('Error listing files:', error)
            setFiles([])
        } else {
            const filesWithUrls = (data || [])
                .filter(f => f.name !== '.emptyFolderPlaceholder')
                .map(f => ({
                    name: f.name,
                    id: f.id || f.name,
                    created_at: f.created_at || '',
                    metadata: (f.metadata || {}) as Record<string, string>,
                    url: supabase.storage.from(bucket).getPublicUrl(f.name).data.publicUrl,
                }))
            setFiles(filesWithUrls)
        }
        setLoading(false)
    }, [bucket])

    const uploadFile = async (file: File) => {
        setUploading(true)
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

        const { error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
            })

        setUploading(false)

        if (error) throw error

        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName)

        await fetchFiles()
        return urlData.publicUrl
    }

    const deleteFile = async (fileName: string) => {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([fileName])

        if (error) throw error
        await fetchFiles()
    }

    return { files, loading, uploading, fetchFiles, uploadFile, deleteFile }
}
