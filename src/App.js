import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import { ReactImageZoom } from 'react-image-zoom';
import './App.css'; // CSS file for styling

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const App = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [text, setText] = useState('');
  const [status, setStatus] = useState('Please upload a PDF file.');
  const [zoomLevel, setZoomLevel] = useState(1);

  const onFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
    setNumPages(null);
    setText('');
    setStatus('File uploaded. Click "Extract Text" to start conversion.');
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const extractTextFromPDF = async () => {
    try {
      setStatus('Conversion started...');
      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      const pdf = await window.pdfjsLib.getDocument(uint8Array).promise;
      const text = await getPDFText(pdf);
      setText(text);
      setStatus('Conversion complete. You can download the file.');
    } catch (error) {
      console.error('Error extracting text:', error);
      setText('Error extracting text from PDF.');
      setStatus('Error occurred during conversion.');
    }
  };

  const getPDFText = async (pdf) => {
    const textContent = [];
    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1);
      const text = await page.getTextContent();
      textContent.push(...text.items.map((item) => item.str));
    }
    return textContent.join('\n');
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const fileBlob = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = 'extracted_text.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleZoomIn = () => {
    setZoomLevel((prevZoom) => prevZoom + 0.1);
  };

  const handleZoomOut = () => {
    setZoomLevel((prevZoom) => Math.max(prevZoom - 0.1, 0.1));
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header">
          <h1>PDF to ATS Converter</h1>
        </div>
        <div className="file-upload">
          <label htmlFor="pdfInput">
            <input type="file" id="pdfInput" onChange={onFileChange} accept=".pdf" />
            Upload PDF
          </label>
          <p>{status}</p>
        </div>
        {file && (
          <div className="pdf-preview">
            {/* <ReactImageZoom
              width={500}
              height={500}
              zoomWidth={500}
              img={URL.createObjectURL(file)}
              zoomScale={zoomLevel}
            /> */}
            <div className="pdf-render">
              <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                <Page key={`page_1`} pageNumber={1} width={500} />
              </Document>
              {/* <div className="zoom-buttons">
                <button onClick={handleZoomIn}>Zoom In</button>
                <button onClick={handleZoomOut}>Zoom Out</button>
              </div> */}
              <button onClick={extractTextFromPDF} disabled={text}>
                Extract Text
              </button>
              {text && (
                <div className="extracted-text">
                  <h2>Extracted Text</h2>
                  <pre>{text}</pre>
                  <button onClick={handleDownload}>Download Text</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
