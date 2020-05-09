import React, { useState } from 'react'

export const SelectedContext = React.createContext({
    data: {
        classes: [],
        boundingBoxes: []
    },
    setdata: () => { }
})

export const SelectedContextProvider = (props) => {

    const setData = (data) => {
        console.log(data)
        setState({ ...state, data: data })
    }

    const initState = {
        data: {
            mask: [],
            boundingBox: [],
            bottomCenter:[0, 0],
            predClass:""
        },
        setdata: setData
    }

    const [state, setState] = useState(initState)

    return (
        <SelectedContext.Provider value={state}>
            {props.children}
        </SelectedContext.Provider>
    )
}