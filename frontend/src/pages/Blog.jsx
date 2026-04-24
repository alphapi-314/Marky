import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { HtmlRenderer } from '../render/html_renderer'
import Navbar from '../components/Navbar'

const renderer = new HtmlRenderer();

const Blog = () => {
  const { page_id } = useParams()

  const [Html, setHtml] = useState("")
  const [Title, setTitle] = useState("")
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [author, setAuthor] = useState("")
  const [date, setDate] = useState("")

  const isLoggedIn = !!localStorage.getItem("token")

  useEffect(() => {
    async function fetchData() {
      try {
        const pageRes = await axios.get(`/api/pages/${page_id}`)
        const { page } = pageRes.data
        setTitle(page.title)
        setAuthor(page.authorName)
        setDate(page.createdAt)
        const html = renderer.render(page.parsedContent)
        setHtml(html)
        const commentRes = await axios.get(`/api/pages/${page_id}/comments`)
        setComments(commentRes.data.comments)
      } 
      catch (err) {
        console.log(err)
      }
    }

    fetchData()
  }, [page_id])

  async function postComment() {
    if (!isLoggedIn || !newComment.trim()) return
    try {
      const token = localStorage.getItem("token")
      await axios.post(
        `/api/pages/${page_id}/comments`,
        { content: newComment },
        { headers: { token } }
      )
      setNewComment("")
      const res = await axios.get(`/api/pages/${page_id}/comments`)
      setComments(res.data.comments)
    } 
    catch (err) {
      console.log(err)
      alert("Failed to post comment")
    }
  }

  return (
    <div>
      <Navbar />

      <div className="preview-blog" style={{ minHeight: '100vh', paddingTop: '124px' }}>
        <h1 className="text-center">{Title}</h1>
        <div className="flex justify-center items-center gap-3 mb-10 text-sm opacity-80">
          <span className="font-medium">{author || "Anonymous"}</span>
          <span>•</span>
          <span>{date ? new Date(date).toLocaleDateString() : ""}</span>
        </div>

        <div dangerouslySetInnerHTML={{ __html: Html }} />

        <div className="max-w-2xl mt-20 px-2">
          <h2 className="mb-5">Comments:</h2>
          <div className="flex items-center gap-3 border-b border-current pb-4">
            <div className="w-9 h-9 rounded-full bg-yellow-100 text-amber-950 flex items-center justify-center font-bold">
              {localStorage.getItem("user")
                ? JSON.parse(localStorage.getItem("user")).username[0].toUpperCase()
                : "N/A"}
            </div>
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={isLoggedIn ? "Add a comment..." : "Login to comment"}
              disabled={!isLoggedIn}
              className={`flex-1 bg-transparent outline-none placeholder:opacity-60 ${
                !isLoggedIn ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />
            <button
              onClick={postComment}
              disabled={!isLoggedIn || !newComment.trim()}
              className={`p-2 text-sm rounded-full transition ${
                isLoggedIn && newComment.trim()
                  ? "bg-yellow-100 text-amber-950 hover:bg-yellow-50 cursor-pointer active:scale-97"
                  : "bg-yellow-100 text-amber-950 opacity-50 cursor-not-allowed"
              }`}
            >
              Comment
            </button>

          </div>

          <div className="mt-4 flex flex-col">
            {comments.length === 0 ? (
              <p className="opacity-70">No comments yet</p>
            ) : (
              comments.map((c) => (
                <div key={c.comment_id} className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-yellow-100 text-amber-950 flex items-center justify-center font-semibold">
                    {c.authorName?.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 text-sm opacity-90">
                      <span className="font-medium">{c.authorName}</span>
                      <span className="text-xs">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p>{c.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Blog