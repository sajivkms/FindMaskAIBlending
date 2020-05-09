import React, { useState, createRef, useEffect, useContext} from 'react'
import { Button } from "@material-ui/core"
import Tooltip from '@material-ui/core/Tooltip';
import {DataContext} from "../contexts/classContextMgm";
import {MasksContext} from "../contexts/mlContext";
import {SelectedContext} from '../contexts/selectContextMgmt'
import { findMask } from "../utils/findMask"

const Step2Comp = (props) => {
    const [coord, setCoord] = useState([0, 0])
    const [canClick, setClick] = useState(true)
    const [submitted, setSubmitted] = useState(false)
    let imgString = localStorage.getItem("objects-detected")
    const dataContext = useContext(DataContext)
    const masksContext = useContext(MasksContext);
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
        canvasRef.current.width = imageRef.current.width;
        canvasRef.current.height = imageRef.current.height / (imageRef.current.width / 600);
        const ctx = canvasRef.current.getContext('2d')
        ctx.drawImage(imageRef.current, 0, 0);
    }, [])

    return (<div>
        <p>Select Location and press submit.</p>
        <canvas width={600} ref={canvasRef} onClick={(e) => {
            if (canClick) {
                setCoord(getMousePosition(canvasRef.current, e))
            }
        }
        } style={{ cursor: 'crosshair' }}></canvas>
        <img ref={imageRef} width="600px" src={imgString} alt="" style={{ cursor: 'crosshair', display: 'none' }}></img>
        <br></br>
        <Tooltip title="...or if you need to select a different object">
            <Button variant="outlined" color="secondary" style={{marginRight:'10px'}} onClick={() => {
                setClick(true);
                let canvas = canvasRef.current
                let context = canvasRef.current.getContext('2d');
                imgString = localStorage.getItem("objects-detected")
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(imageRef.current, 0, 0);
            }}>Reload (if image doesn't show)</Button>
        </Tooltip>
        <Button variant="contained" color="primary" onClick={() => {
            localStorage.setItem('coordinates', JSON.stringify(coord))
            let maskIdx = findMask(coord, masksContext.masks);
            selectedContext.setdata({
                predClass:dataContext.data.classes[maskIdx],
                boundingBox: dataContext.data.boundingBoxes[maskIdx],
                bottomCenter:coord,
                mask: masksContext.masks[maskIdx]
            })
            setSubmitted(true)
        }} disabled={submitted || canClick}>{submitted ? 'Submitted (click next)':'Submit Object'}</Button>
    </div>)
};
export default Step2Comp;