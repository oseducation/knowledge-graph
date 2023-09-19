import { useState, useEffect } from 'react'

export default function useAppBarHeight() {
    const [appBarHeight, setAppBarHeight] = useState(0)

    useEffect(() => {
        const appBar = document.querySelector("header.MuiAppBar-root")
        setAppBarHeight(appBar?.clientHeight || 0)

        function handleResize() {
            setAppBarHeight(appBar?.clientHeight || 0)
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return appBarHeight
}
