import React, { useState, useContext, createRef, useEffect } from 'react';
import { Button } from "@material-ui/core";
import Tooltip from '@material-ui/core/Tooltip';
import { LinearProgress } from '@material-ui/core'
import { dataURLtoFile } from '../utils/img2base64'
import { SelectedContext } from '../contexts/selectContextMgmt'
export default function Step4Comp(props) {
    const [coord, setCoord] = useState([0, 0])
    const [canClick, setClick] = useState(true)
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const imgString = localStorage.getItem("background")
    const selectedContext = useContext(SelectedContext)
    const canvasRef = createRef();
    const imageRef = createRef();
    function getMousePosition(canvas, event) {
        if (canClick) {
            let rect = canvas.getBoundingClientRect();
            let x = event.clientX - rect.left;
            let y = event.clientY - rect.top;
            setClick(false)
            var context = canvas.getContext('2d');
            context.beginPath();
            context.arc(x, y, 5, 0, 2 * Math.PI, false);
            context.fillStyle = 'red';
            context.fill();
            context.lineWidth = 1;
            context.strokeStyle = 'darkred';
            context.stroke();
            return [x, y];
        }
        return [-1, -1]
    }
    useEffect(() => {
        imageRef.current.onload = () => {
            canvasRef.current.width = 600;
            const widthOrig = imageRef.current.width;
            canvasRef.current.height = imageRef.current.height / (widthOrig / 600);
            imageRef.current.width = 600;
            const ctx = canvasRef.current.getContext('2d')
            ctx.drawImage(imageRef.current, 0, 0, 600, imageRef.current.height / (widthOrig / 600));
        }
    }, [])
    const onSubmit = () => {
        const formData = new FormData()
        formData.append('background', dataURLtoFile(localStorage.getItem('background')))
        formData.append('objectImage', dataURLtoFile(localStorage.getItem('object-image')))
        formData.append('bottomCenter', JSON.stringify(coord))
        formData.append('mask', JSON.stringify(selectedContext.data.mask))
        fetch('http://3.21.241.59/blend', {
            method: 'POST',
            body: formData
        }).then(res => res.blob()).then(res => {
            console.log("Helo")
            setLoading(false)
            var reader = new FileReader();
            reader.readAsDataURL(res);
            reader.onloadend = function () {
                var base64data = reader.result;
                localStorage.setItem("finalBlend", base64data)
            }
        })
    }
    return (
        <div>
            {loading ? <LinearProgress /> : <div> </div>}
            <p>Select Location on the image and press submit.</p>
            <canvas ref={canvasRef} onClick={(e) => {
                if (canClick) {
                    setCoord(getMousePosition(canvasRef.current, e))
                }
            }
            } style={{ cursor: 'crosshair' }}></canvas>
            <img ref={imageRef} src={imgString} alt="" style={{ cursor: 'crosshair', display: 'none' }}></img>
            <br></br>
            <Tooltip title="...or if you need to select a different location">
                <Button disabled={submitted} variant="outlined" color="secondary" style={{ marginRight: '10px' }} onClick={() => {
                    setClick(true);
                    let canvas = canvasRef.current
                    let context = canvasRef.current.getContext('2d');
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
                }}>Reload (if image doesn't show)</Button>
            </Tooltip>
            <Button variant="contained" color="primary" onClick={() => {
                localStorage.setItem('coordinates-background', JSON.stringify(coord))
                setSubmitted(true)
                setLoading(true)
                onSubmit()

            }} disabled={submitted || canClick}>{submitted ? 'Submitted (click next)' : 'Submit Object'}</Button>
        </div>)
};
