import React, { useState } from 'react'

export const MasksContext = React.createContext({
    masks: [],
    setMasks: () => { }
})

export const MasksContextProvider = (props) => {

    const setMasks = (masks) => {
        console.log(masks)
        setState({ ...state, masks: masks })
    }

    const initState = {
        masks: {
            classes: [],
            boundingBoxes: []
        },
        setMasks: setMasks
    }

    const [state, setState] = useState(initState)

    return (
        <MasksContext.Provider value={state}>
            {props.children}
        </MasksContext.Provider>
    )
}