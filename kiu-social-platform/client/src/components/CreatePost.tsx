import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { postAPI } from '../utils/api'
import { Post } from '../types'
import toast from 'react-hot-toast'
import { X, Image, Send } from 'lucide-react'

interface CreatePostProps {
  onPostCreated: (post: Post) => void
  onCancel: () => void
}

interface PostFormData {
  content: string
  isPublic: boolean
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<PostFormData>({
    defaultValues: {
      isPublic: true
    }
  })

  const content = watch('content')

  const onSubmit = async (data: PostFormData) => {
    if (!content.trim()) {
      toast.error('Please write something before posting')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await postAPI.createPost({
        content: data.content,
        images,
        isPublic: data.isPublic
      })
      
      onPostCreated(response.data)
      reset()
      setImages([])
      toast.success('Post created successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // In a real app, you would upload to a cloud service
      // For now, we'll create object URLs
      const newImages = Array.from(files).map(file => URL.createObjectURL(file))
      setImages(prev => [...prev, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Create a new post</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <textarea
            {...register('content', {
              required: 'Content is required',
              maxLength: {
                value: 2000,
                message: 'Post content must be less than 2000 characters'
              }
            })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kiu-500 focus:border-transparent resize-none"
            placeholder="What's on your mind?"
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
          <div className="mt-1 text-right text-sm text-gray-500">
            {content?.length || 0}/2000
          </div>
        </div>

        {/* Image Preview */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Image Upload */}
        <div>
          <label className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer">
            <Image className="h-5 w-5" />
            <span>Add images</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Privacy Setting */}
        <div className="flex items-center space-x-2">
          <input
            {...register('isPublic')}
            type="checkbox"
            id="isPublic"
            className="h-4 w-4 text-kiu-600 focus:ring-kiu-500 border-gray-300 rounded"
          />
          <label htmlFor="isPublic" className="text-sm text-gray-700">
            Make this post public
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !content?.trim()}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreatePost
