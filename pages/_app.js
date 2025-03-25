import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import { useState } from "react";

export default function App({ Component, pageProps }) {
  const [openUpload, setOpenUpload] = useState(false);

  return (
    <>
      <Navbar onUploadClick={() => setOpenUpload(true)} />
      <Component {...pageProps} uploadOpen={openUpload} setUploadOpen={setOpenUpload} />
    </>
  );
}