import { useState } from 'react'
import { HtmlRenderer } from '../render/html_renderer'
import axios from 'axios'
import Popup from '../components/Popup'
import Navbar from '../components/Navbar'
// import { previewStyles } from '../render/styles'

const renderer = new HtmlRenderer();

const TextEditor = () => {

  const [Markdown, setMarkdown] = useState("")
  const [Html, setHtml] = useState("")
  const [Title, setTitle] = useState("")
  const [PageId, setPageId] = useState("");
  const [ShowPopup, setShowPopup] = useState(false);

  async function preview() {
    if (!Title) {
      alert("Please assign a title!");
      return;
    }
    if (!Markdown) {
        alert("Please add some content!");
        return;
    }
    const response = await axios.post('http://localhost:5000/api/compiler/preview', {
      text: Markdown,
      title: Title
    });
    const ast=response.data.ast;
    const html=renderer.render(ast);
    setHtml(html);
  };

  async function submit() {
    if (!Title) {
      alert("Please assign a title!");
      return;
    }
    if (!Markdown) {
        alert("Please add some content!");
        return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/compiler/submit', {
        text: Markdown,
        title: Title,
      });
      if (response.data.success) {
        setPageId(response.data.page.page_id);
        setShowPopup(true);
      }
    }
    catch(err) {
      alert("Submit failed!");
    }
  }

  return (
    <div className='bg-yellow-100 flex flex-col min-h-screen pt-[84px]'>
        <Navbar/>
        <h1 className='text-4xl font-inter font-medium  text-center mt-6 mb-2 text-amber-950'>Markdown To Web-Page</h1>
        <div className="flex justify-center w-full gap-8 p-7">

          {/* text editor */}
          <div className=" w-1/2 flex flex-col gap-6">
            <textarea value={Title} onChange={ function(e) {
              setTitle(e.target.value)
            }}
             className="rounded-lg outline-2 w-full py-3 outline-amber-950 h-[53px] text-amber-950 font-jetbrains bg-yellow-50 p-5 overflow-auto"
            placeholder='enter title here:'></textarea>

            <textarea value={Markdown} onChange={ function(e) {
              setMarkdown(e.target.value)
            }} className="rounded-lg outline-2 w-full outline-amber-950 h-[700px] text-amber-950 font-jetbrains bg-yellow-50 p-5 overflow-auto"
            placeholder="enter markdown here:"></textarea>

            {/* buttons */}
            <div className='flex justify-end gap-5'>
              <button onClick={preview} 
              className="bg-amber-950 font-inter cursor-pointer text-yellow-100 h-11 px-5 w-fit hover:bg-amber-900 rounded-2xl active:scale-97">PREVIEW</button>
              <button onClick={submit} className="bg-amber-950 font-inter cursor-pointer text-yellow-100 h-11 px-5 w-fit hover:bg-amber-900 rounded-2xl active:scale-96">SUBMIT</button>
            </div>
          </div>

          {/* preview section */}
          <div className="w-1/2">
            <div  className="rounded-lg outline-2 w-full outline-amber-950 h-[777px] overflow-auto" style={{ backgroundColor: '#ffe7cf' }}>
                <div className="preview-editor">
                  {Html && <h1 style={{ textAlign: 'center' }}>{Title}</h1>}
                  <div dangerouslySetInnerHTML={{ __html: Html }} />
                </div>
            </div> 
            </div>
          </div>

          {/* blog section */}
          {ShowPopup && <Popup pageId={PageId} onClose={ function() {
            setShowPopup(false)
        }}/> }
    </div>
  )
}

export default TextEditor 