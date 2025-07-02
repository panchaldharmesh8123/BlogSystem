"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function CreatePostPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const { user, token } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body text-center">
                <i className="bi bi-lock display-1 text-muted"></i>
                <h3 className="mt-3">Authentication Required</h3>
                <p className="text-muted">You need to be logged in to create a post.</p>
                <Link to="/login" className="btn btn-primary">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file")
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB")
        return
      }

      setImage(file)
      setError("")

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
    // Reset file input
    const fileInput = document.getElementById("image")
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const uploadImage = async () => {
    if (!image) return null

    setImageUploading(true)
    const formData = new FormData()
    formData.append("image", image)

    try {
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        return data.imageUrl
      } else {
        throw new Error(data.message || "Failed to upload image")
      }
    } catch (error) {
      throw new Error("Failed to upload image")
    } finally {
      setImageUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      let imageUrl = null

      // Upload image if selected
      if (image) {
        imageUrl = await uploadImage()
      }

      const response = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, image: imageUrl }),
      })

      const data = await response.json()

      if (response.ok) {
        navigate(`/posts/${data._id}`)
      } else {
        setError(data.message || "Failed to create post")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="mb-3">
            <Link to="/" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-1"></i>
              Back to Posts
            </Link>
          </div>

          <div className="card shadow">
            <div className="card-header">
              <h2 className="card-title mb-0">Create New Post</h2>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    Title
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter post title"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="image" className="form-label">
                    Featured Image (Optional)
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <div className="form-text">Supported formats: JPG, PNG, GIF. Maximum size: 5MB</div>
                </div>

                {imagePreview && (
                  <div className="mb-3">
                    <label className="form-label">Image Preview</label>
                    <div className="position-relative">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="img-fluid rounded"
                        style={{ maxHeight: "300px", width: "100%", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                        onClick={removeImage}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="content" className="form-label">
                    Content
                  </label>
                  <textarea
                    className="form-control"
                    id="content"
                    rows="12"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your post content here..."
                    required
                  ></textarea>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={loading || imageUploading}>
                    {loading || imageUploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        {imageUploading ? "Uploading image..." : "Publishing..."}
                      </>
                    ) : (
                      "Publish Post"
                    )}
                  </button>
                  <Link to="/" className="btn btn-outline-secondary">
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePostPage
