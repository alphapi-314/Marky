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

  useEffect(() => {
    async function fetchPage() {
      const response = await axios.get(`/api/pages/${page_id}`)
      const { page } = response.data
      setTitle(page.title)
      const html = renderer.render(page.parsedContent)
      setHtml(html)
    }
    fetchPage()
  }, [page_id])

  return (
    <>
      <div>
        <Navbar/>
        <div className="preview-blog" style={{ minHeight: '100vh', paddingTop: '124px' }}>
          <h1 className="text-center">{Title}</h1>
          <div dangerouslySetInnerHTML={{ __html: Html }} />
        </div>
      </div>
    </>
  )
}

export default Blog