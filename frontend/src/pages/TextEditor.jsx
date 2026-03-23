import React from 'react'
import { useState } from 'react'
import { HtmlRenderer } from '../render/html_renderer'
import { Parser } from '../render/parser'
import Navbar from '../components/Navbar'
import { previewStyles } from '../render/styles'

const TextEditor = () => {

  const [Markdown, setMarkdown] = useState("")
  const [Html, setHtml] = useState("")
  const [Title, setTitle] = useState("")

  function preview() {
    try {
      const parser=new Parser();
      const node=parser.parse(Markdown);
      const json=node.toJSON();   // markdown → JSON
      const htmlRenderer=new HtmlRenderer();
      const result=`<h1 class='text-4xl font-semibold text-center mt-6 mb-6 text-gray-900'>${Title}</h1>` +  htmlRenderer.render(json);   // JSON → HTML
      console.log("json: ",json);
      console.log("rendered: ",result);
      setHtml(result)
    }
    catch(error) {
      console.error(error);
      setHtml("<p>Error in parsing markdown</p>");
    }
  }

  return (
    <div className='bg-yellow-100 flex flex-col min-h-screen pt-[84px]'>
        <Navbar/>
        <h1 className='text-4xl font-inter font-medium  text-center mt-5 mb-3 text-shadow-xs text-amber-950'>Markdown To Web-Page</h1>
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
              <button className="bg-amber-950 font-inter cursor-pointer text-yellow-100 h-11 px-5 w-fit hover:bg-amber-900 rounded-2xl active:scale-96">SUBMIT</button>
            </div>
          </div>

          {/* preview section */}
          <div className="w-1/2">
            <div className="rounded-lg outline-2 w-full outline-amber-950 h-[777px] bg-white p-7 overflow-auto">
              <style>{previewStyles}</style>
              <div className="preview" dangerouslySetInnerHTML={{ __html: Html }}/></div>
          </div>
        </div>
    </div>
  )
}

export default TextEditor