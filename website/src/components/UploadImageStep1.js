import React, { useState, useContext } from 'react';
import ImageUpload from './ImageUpload';
import { LinearProgress } from '@material-ui/core'
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grow from '@material-ui/core/Grow';
import { MasksContext } from '../contexts/mlContext';
import { DataContext } from '../contexts/classContextMgm';
import { arrayBufferToBase64 } from '../utils/img2base64'
const divStyles = {
    paddingLeft: '15px',
    paddingRight: '15px'
}

export default function Upload(props) {
    const [file, setFile] = useState("")
    const [loading, setLoading] = useState(false);
    const [showImg, setShowImg] = useState(false);
    const [startedLoading, setStartedLoading] = useState(false)
    const dataContext = useContext(DataContext)
    const masksContext = useContext(MasksContext);
    const onDropFunction = (acceptedFiles) => {
        const formData = new FormData();
        const reader = new FileReader()
        reader.readAsDataURL(acceptedFiles[0]);
        reader.onloadend = () => {
            localStorage.setItem('object-image', reader.result)
        }
        formData.append('file', acceptedFiles[0]);
        setLoading(true);
        setStartedLoading(true);
        fetch('http://3.21.241.59/predict', {
            method: 'POST',
            body: formData
        }).then(response => response.blob())
            .then(response => {
                var reader = new FileReader();
                reader.readAsDataURL(response);
                reader.onloadend = function () {
                    var base64data = reader.result;
                    localStorage.setItem("objects-detected", base64data)
                    setFile(base64data)
                }
                setLoading(false)
            })
        fetch('http://3.21.241.59/get_masks', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
            .then(response => {
                dataContext.setdata({
                    classes: response['predicted_classes'],
                    boundingBoxes: response['bounding_boxes'],
                    bottomCenter: [0, 0]
                })
                masksContext.setMasks(response['masks'])
            })

    }
    return (
        <div style={divStyles}>
            {loading ? <LinearProgress /> : <div>
                {startedLoading && (<div>
                    <FormControlLabel
                        control={<Switch checked={showImg} onChange={() => setShowImg((prev) => !prev)} />}
                        label="Show Image (Once recived)"
                    />
                    <br></br>
                    <p>{dataContext.data['classes'].length} objects were found. Click next</p>
                </div>)}
                <Grow in={showImg}>
                    <img src={file} alt="" height={showImg ? "auto" : "0px"}></img>
                </Grow>
            </div>
            }
            <p>Upload the image</p>
            <ImageUpload onDropFunction={onDropFunction} />

        </div>
    )
}