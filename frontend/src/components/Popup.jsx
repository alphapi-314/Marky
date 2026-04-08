import React from 'react'

const Popup = ({pageId, onClose}) => {
  return (
    <div>
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-yellow-50 font-inter rounded-4xl p-10 flex flex-col items-center gap-5">
                <h2 className="text-3xl text-amber-950 font-medium">Blog Published</h2>
                    <a href={`/page/${pageId}`} target="_blank"
                        className="text-amber-800 underline cursor-pointer">
                        Click here to view your blog
                    </a>
                <button onClick={onClose} className="bg-amber-950 text-yellow-100 px-5 py-2 rounded-2xl hover:bg-amber-900 cursor-pointer">Close
                </button>
            </div>
        </div>
    </div>
  )
}

export default Popup