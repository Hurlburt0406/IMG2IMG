import React, { useCallback, useState } from 'react';
import './dream.css';
import { useDropzone } from 'react-dropzone';
import axios from 'axios'
import ClipLoader from "react-spinners/ClipLoader";
import { toast } from 'react-toastify';

const baseUrl = "https://bundleoneth.tech/";
// const baseUrl = "http://135.181.161.253:7777/";

export const Dream = () => {
  const [pictureRoute, setPictureRoute] = useState('')
  const [nftRoute, setNftRoute] = useState('')
  const [prompt, setPrompt] = useState('')
  const onPromptChange = (event) => {
    setPrompt(event.target.value);
  };
  
  const onDrop = useCallback((acceptedFiles) => {
    // Handle the uploaded files here
    console.log(acceptedFiles[0]);
    const file = acceptedFiles[0];
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    // Set the image source to the URL
    image.src = imageUrl;

    // Wait for the image to load
    image.onload = function() {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      // Set the canvas dimensions to match the image dimensions
      canvas.width = image.width;
      canvas.height = image.height;
      // Draw the image on the canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      // Get the data URL for the canvas
      const dataUrl = canvas.toDataURL('image/png');
      setPictureRoute(dataUrl);
    };
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  const [bLoadingFlag, setLoadingFlag] = useState(false)

  // const onGenerateOriginal = async () => {
  //   if(prompt === '')
  //   {
  //     toast.error("Prompt is empty.");
  //     return;
  //   }
  //   setLoadingFlag(true);

  //   const response = await axios.post(
  //     baseUrl + 'generateImage',
  //     {
  //       prompt : prompt
  //     },
  //     {
  //       headers: {
  //         'Content-Type': 'application/json'
  //       }
  //     }
  //   )
  //   console.log("glory", response.data.response);
  //   setPictureRoute(response.data.response.output);
  //   setLoadingFlag(false);
  // };

  const onSetReferenceImage = async () => {
    if(nftRoute === '')
    {
      toast.error("Result image is not generated.");
      return;
    }

    setPictureRoute(nftRoute);
  }

  const onGenerate = async () => {
    if(pictureRoute === '')
    {
      toast.error("Please upload image.");
      return;
    }

    if(prompt === '')
    {
      toast.error("Prompt is empty.");
      return;
    }
    setLoadingFlag(true);

    const response = await axios.post(
      baseUrl + 'getImage',
      {
        image_original : pictureRoute,
        prompt : prompt
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    console.log("glory", response.data.response);
    setNftRoute(response.data.response.output[0]);
    setLoadingFlag(false);
  };

  return (
    <div className="gpt3__header section__padding" id="home">
      <div className='generate'>
        <h1><b>Generating images <span>using AI</span> for everyone.</b></h1>
      </div>
      <div className='generate'>
        <button type="button" onClick={onSetReferenceImage}>Set image as a reference image</button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        &nbsp;&nbsp;&nbsp;&nbsp;
        <button type="button" onClick={onGenerate}>Generate your image</button>
      </div>
      <div className="gpt3__header-content">
        <div className="original">
          <h2>Upload Image</h2>
          <div className="upload-container">
            <div {...getRootProps()} className={`box-container ${isDragActive ? 'active' : ''}`}>
              <input {...getInputProps()} />
              <p>{isDragActive ? 'Drop the file here' : 'Drag and drop file here'}</p>
            </div>
          </div>
          <h2>Input Prompt</h2>
          <textarea
            className="desc"
            placeholder="Enter your prompt"
            name="prompt"
            value={prompt}
            onChange={onPromptChange}
          ></textarea>
        </div>
        <div className="generated">
          <h2>Uploaded Image</h2>
          {(pictureRoute === '') &&
            <div className='Uploaded'></div>
          }
          {(pictureRoute !== '') &&
            <img src={pictureRoute} alt="ai" width="300" height="500" />
          }
          <div className="spinner-wrapper">
            {(bLoadingFlag === true) &&
              < ClipLoader
                color='#ffffff'
                loading={true}
                cssOverride={true}
                size={50}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            }
          </div>
        </div>
      </div>
      <div className="gpt3__header-content">
        {(nftRoute !== '') &&
          <div className="result">
            <img src={nftRoute} alt="ai" />
          </div>
        }
      </div>
    </div>
  );
};
export default Dream;