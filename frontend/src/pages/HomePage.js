"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function HomePage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/posts")
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
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

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="display-4 fw-bold text-primary">Blog Posts</h1>
              <p className="lead text-muted">Discover amazing stories and insights</p>
            </div>
            {user && (
              <Link to="/create-post" className="btn btn-primary btn-lg">
                <i className="bi bi-plus-circle me-2"></i>
                Create Post
              </Link>
            )}
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-journal-text display-1 text-muted"></i>
              <h3 className="mt-3">No posts yet</h3>
              <p className="text-muted">Be the first to share your thoughts!</p>
              {user && (
                <Link to="/create-post" className="btn btn-primary">
                  Create First Post
                </Link>
              )}
            </div>
          ) : (
            <div className="row">
              {posts.map((post) => (
                <div key={post._id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100 shadow-sm">
                    {post.image && (
                      <img
                        src={`http://localhost:5000${post.image}`}
                        alt={post.title}
                        className="card-img-top"
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                    )}
                    <div className="card-body">
                      <h5 className="card-title">{post.title}</h5>
                      <p className="card-text text-muted">
                        {post.content.replace(/<[^>]*>/g, "").substring(0, 150)}...
                      </p>
                      <div className="d-flex align-items-center mb-3">
                        <i className="bi bi-person-circle me-2"></i>
                        <small className="text-muted">{post.author.username}</small>
                      </div>
                    </div>
                    <div className="card-footer bg-transparent">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex gap-3">
                          <small className="text-muted">
                            <i className="bi bi-calendar me-1"></i>
                            {new Date(post.createdAt).toLocaleDateString()}
                          </small>
                          <small className="text-muted">
                            <i className="bi bi-chat me-1"></i>
                            {post.comments?.length || 0}
                          </small>
                        </div>
                        <Link to={`/posts/${post._id}`} className="btn btn-outline-primary btn-sm">
                          Read More
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HomePage
