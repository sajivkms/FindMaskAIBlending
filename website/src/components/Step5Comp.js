import React from 'react';

export default function Step5Comp(props) {
    const imString = localStorage.getItem("finalBlend")
    console.log(imString);
    return (
        <div>
            <p>To download the image, right-click and press "Save Image as" or "Download" or whatever your browser provides.</p>
            <img width="600px" src={imString}></img>
        </div>
    )
}