import { useState, useEffect } from 'react'
import { HtmlRenderer } from '../render/html_renderer'
import axios from 'axios'
import Popup from '../components/Popup'
import Navbar from '../components/Navbar'

const renderer = new HtmlRenderer();

const TextEditor = () => {

  const [Markdown, setMarkdown] = useState("")
  const [Html, setHtml] = useState("")
  const [Title, setTitle] = useState("")
  const [PageId, setPageId] = useState("");
  const [ShowPopup, setShowPopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, []);

  async function preview() {
    if (!Title) {
      alert("Please assign a title!");
      return;
    }
    if (!Markdown) {
        alert("Please add some content!");
        return;
    }
    try {
      const response = await axios.post('/api/compiler/preview', {
        text: Markdown,
        title: Title
      });
      const ast=response.data.ast;
      const html=renderer.render(ast);
      setHtml(html);
    }
    catch (err) {
      alert("Preview failed");
    }
  };

  async function submit() {
    if (!Title || !Markdown) {
      alert("Fill all fields");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Login required");
      return;
    }
    try {
      const response = await axios.post("/api/compiler/submit", {
          text: Markdown,
          title: Title,
        },
        {
          headers: {
            token: token,
          },
        }
      );
      if (response.data.success && response.data.page?.page_id) {
        setPageId(response.data.page.page_id);
        setShowPopup(true);
      } else {
        alert("Submit failed");
      }
    } 
    catch (err) {
      console.log(err.response?.data);
      alert("Submit failed");
    }
  }

  return (
    <div className='bg-yellow-100 flex flex-col min-h-screen pt-[84px]'>
        <Navbar/>
        <h1 className='text-4xl font-inter font-medium  text-center mt-6 mb-2 text-amber-950'>Markdown To Blog</h1>
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
              <button onClick={submit} disabled={!isLoggedIn} className={`bg-amber-950 text-yellow-100 h-11 cursor-pointer px-5 rounded-2xl ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-900'}`}>SUBMIT</button>
            </div>
          </div>

          {/* preview section */}
          <div className="w-1/2">
            <div  className="rounded-lg outline-2 w-full outline-amber-950 h-[777px]  overflow-auto" style={{ backgroundColor: '#ffe7cf' }}>
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