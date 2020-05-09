import React, {useState, createRef} from 'react';
import ImageUpload from './ImageUpload';
import LinearProgress from "@material-ui/core/LinearProgress"
const divStyles = {
    paddingLeft: '15px',
    paddingRight: '15px'
}

export default function Upload(props) {
    const [loading, setLoading] = useState(false)
    const canvasRef = createRef();
    const onDropFunction = (acceptedFiles) => {
        setLoading(true);
        const reader = new FileReader();
        if (acceptedFiles.length > 0) {
            reader.readAsDataURL(acceptedFiles[0])
        }
        reader.onloadend = () => {
            const base64 = reader.result
            localStorage.setItem("background", base64)
            setLoading(false);
        }
    }
    return (
        <div style={divStyles}>
            {loading ? <LinearProgress /> : <div></div>}
            <p>Upload your background and the click next</p>
            <ImageUpload onDropFunction={onDropFunction} hello={"world"} />
            <canvas ref={canvasRef} style={{display:"none"}}></canvas>
        </div>
    )
}