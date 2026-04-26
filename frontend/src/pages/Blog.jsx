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
  document.body.style.backgroundColor = "#f4cf97";
  }, []);

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
        <h1 className="text-center text-4xl font-bold">{Title}</h1>
        <div className="flex justify-end items-center gap-3 text-sm opacity-80">
          <span className="font-medium font-merriweather">{author || "Anonymous"}</span>
          <span>•</span>
          <span>{date ? new Date(date).toLocaleDateString() : ""}</span>
        </div>

        <div className="h-[1px] bg-amber-950 my-7 w-full"></div>

        <div dangerouslySetInnerHTML={{ __html: Html }} />

        <div className="h-[2px] bg-amber-950 my-7 w-full"></div>

        <div className="max-w-2xl px-1">
          <h3 className="mb-5">Comments:</h3>
          <div className="flex items-center gap-3 border-b border-current pb-4">
            <div className="w-9 h-9 rounded-full bg-amber-950 text-yellow-100 flex items-center justify-center font-bold">
              {localStorage.getItem("user")
                ? JSON.parse(localStorage.getItem("user")).username[0].toUpperCase()
                : "N/A"}
            </div>
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={isLoggedIn ? "Add a comment..." : "Login to comment"}
              disabled={!isLoggedIn}
              className={`flex-1 text-sm bg-transparent outline-none placeholder:opacity-60 ${
                !isLoggedIn ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />
            <button
              onClick={postComment}
              disabled={!isLoggedIn || !newComment.trim()}
              className={`p-2 text-sm rounded-full transition ${
                isLoggedIn && newComment.trim()
                  ? "bg-amber-950 text-yellow-100 text-sm hover:bg-amber-900 cursor-pointer active:scale-97"
                  : "bg-amber-950 text-yellow-100 opacity-50 cursor-not-allowed"
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
                  <div className="w-8 h-8 rounded-full bg-amber-950 text-yellow-100 flex items-center justify-center font-semibold">
                    {c.authorName?.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 text-sm opacity-90">
                      <span className="font-medium">{c.authorName}</span>
                      <span className="text-xs">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className='text-sm'>{c.content}</p>
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