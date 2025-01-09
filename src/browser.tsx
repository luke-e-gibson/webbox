import { useState } from "react";


export function Browser(props: {url: string}) {
  const [url, setUrl] = useState<string>(props.url);

  return (
    <>
      <input type="url" value={url} onChange={(e)=>setUrl(e.target.value)} style={{height: ""}} className="border border-t-line w-full bg-tabLine text-white text-white"/>
      <iframe src={url} style={{height: "65vh"}} className="w-full"></iframe>
    </>
  )
}