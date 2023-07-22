'use client'

import React, { useEffect } from 'react'
import mixpanel from 'mixpanel-browser'

const Analytics = () => {
    useEffect(() => {
        if (process.env.NODE_ENV === 'production') {
            mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN!, {
                track_pageview: true,
                persistence: 'localStorage'
            })
        }
    }, [])
    return null
}

export default Analytics