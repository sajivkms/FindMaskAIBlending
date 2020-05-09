import React, { useState } from 'react'

export const DataContext = React.createContext({
    data: {
        classes: [],
        boundingBoxes: []
    },
    setdata: () => { }
})

export const DataContextProvider = (props) => {

    const setData = (data) => {
        console.log(data)
        setState({ ...state, data: data })
    }

    const initState = {
        data: {
            classes: [],
            boundingBoxes: [],
            bottomCenter:[0, 0]
        },
        setdata: setData
    }

    const [state, setState] = useState(initState)

    return (
        <DataContext.Provider value={state}>
            {props.children}
        </DataContext.Provider>
    )
}