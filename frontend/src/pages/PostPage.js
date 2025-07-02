"use client"

import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function PostPage() {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [commentContent, setCommentContent] = useState("")
  const [commentLoading, setCommentLoading] = useState(false)
  const [error, setError] = useState("")
  const { user, token } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    fetchPost()
  }, [id])

  const fetchPost = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${id}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data)
      } else {
        setError("Post not found")
      }
    } catch (error) {
      setError("Error loading post")
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!user || !token) return

    setCommentLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: commentContent }),
      })

      if (response.ok) {
        setCommentContent("")
        fetchPost() // Refresh post to get new comment
      }
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setCommentLoading(false)
    }
  }

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return

    try {
      const response = await fetch(`http://localhost:5000/api/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        navigate("/")
      }
    } catch (error) {
      console.error("Error deleting post:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error || "Post not found"}
        </div>
      </div>
    )
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

          {/* Post Content */}
          <div className="card shadow mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="flex-grow-1">
                  <h1 className="card-title display-5 mb-3">{post.title}</h1>
                  <div className="d-flex align-items-center gap-3 text-muted">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-person-circle me-2"></i>
                      <span>{post.author.username}</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-calendar me-1"></i>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-chat me-1"></i>
                      <span>{post.comments.length} comments</span>
                    </div>
                  </div>
                </div>
                {user && user._id === post.author._id && (
                  <div className="d-flex gap-2">
                    <Link to={`/posts/${post._id}/edit`} className="btn btn-outline-primary btn-sm">
                      <i className="bi bi-pencil"></i>
                    </Link>
                    <button className="btn btn-outline-danger btn-sm" onClick={handleDeletePost}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                )}
              </div>
              <hr />

              {/* Featured Image */}
              {post.image && (
                <div className="mb-4">
                  <img
                    src={`http://localhost:5000${post.image}`}
                    alt={post.title}
                    className="img-fluid rounded shadow-sm"
                    style={{ width: "100%", maxHeight: "400px", objectFit: "cover" }}
                  />
                </div>
              )}

              <div className="mt-4">
                <p className="card-text" style={{ whiteSpace: "pre-wrap" }}>
                  {post.content}
                </p>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="card shadow">
            <div className="card-header">
              <h4 className="mb-0">
                <i className="bi bi-chat me-2"></i>
                Comments ({post.comments.length})
              </h4>
            </div>
            <div className="card-body">
              {/* Add Comment Form */}
              {user ? (
                <form onSubmit={handleAddComment} className="mb-4">
                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Write a comment..."
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={commentLoading}>
                    {commentLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Adding...
                      </>
                    ) : (
                      "Add Comment"
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-3 mb-4 bg-light rounded">
                  <p className="mb-2">Sign in to leave a comment</p>
                  <Link to="/login" className="btn btn-outline-primary">
                    Sign In
                  </Link>
                </div>
              )}

              {/* Comments List */}
              <div className="comments-list">
                {post.comments.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-chat-square display-4"></i>
                    <p className="mt-2">No comments yet. Be the first to comment!</p>
                  </div>
                ) : (
                  post.comments.map((comment) => (
                    <div key={comment._id} className="border-start border-3 border-primary ps-3 mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-person-circle me-2"></i>
                        <strong className="me-2">{comment.author.username}</strong>
                        <small className="text-muted">{new Date(comment.createdAt).toLocaleDateString()}</small>
                      </div>
                      <p className="mb-0">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostPage
