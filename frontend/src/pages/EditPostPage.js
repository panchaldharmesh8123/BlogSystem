"use client";

import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function EditPostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const { user, token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${id}`);
      if (response.ok) {
        const data = await response.json();
        if (user && user._id === data.author._id) {
          setTitle(data.title);
          setContent(data.content);
          setCurrentImage(data.image);
        } else {
          setError("Unauthorized to edit this post");
        }
      } else {
        setError("Post not found");
      }
    } catch (error) {
      setError("Error loading post");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      setImage(file);
      setError("");

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeNewImage = () => {
    setImage(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById("image");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const removeCurrentImage = () => {
    setCurrentImage(null);
  };

  const uploadImage = async () => {
    if (!image) return null;

    setImageUploading(true);
    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        return data.imageUrl;
      } else {
        throw new Error(data.message || "Failed to upload image");
      }
    } catch (error) {
      throw new Error("Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let imageUrl = currentImage;

      // Upload new image if selected
      if (image) {
        imageUrl = await uploadImage();
      }

      const response = await fetch(`http://localhost:5000/api/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, image: imageUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate(`/posts/${id}`);
      } else {
        setError(data.message || "Failed to update post");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body text-center">
                <i className="bi bi-lock display-1 text-muted"></i>
                <h3 className="mt-3">Authentication Required</h3>
                <p className="text-muted">
                  You need to be logged in to edit posts.
                </p>
                <Link to="/login" className="btn btn-primary">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (fetchLoading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="mb-3">
            <Link to={`/posts/${id}`} className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-1"></i>
              Back to Post
            </Link>
          </div>

          <div className="card shadow">
            <div className="card-header">
              <h2 className="card-title mb-0">Edit Post</h2>
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

                {/* Current Image */}
                {currentImage && (
                  <div className="mb-3">
                    <label className="form-label">Current Image</label>
                    <div className="position-relative">
                      <img
                        src={`http://localhost:5000${currentImage}`}
                        alt="Current"
                        className="img-fluid rounded"
                        style={{
                          maxHeight: "300px",
                          width: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                        onClick={removeCurrentImage}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="image" className="form-label">
                    {currentImage
                      ? "Change Image (Optional)"
                      : "Featured Image (Optional)"}
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <div className="form-text">
                    Supported formats: JPG, PNG, GIF. Maximum size: 5MB
                  </div>
                </div>

                {imagePreview && (
                  <div className="mb-3">
                    <label className="form-label">New Image Preview</label>
                    <div className="position-relative">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="img-fluid rounded"
                        style={{
                          maxHeight: "300px",
                          width: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                        onClick={removeNewImage}
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
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || imageUploading}
                  >
                    {loading || imageUploading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        {imageUploading ? "Uploading image..." : "Updating..."}
                      </>
                    ) : (
                      "Update Post"
                    )}
                  </button>
                  <Link
                    to={`/posts/${id}`}
                    className="btn btn-outline-secondary"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditPostPage;
