// Pixel + analytics fan-out. Vendor scripts are injected at runtime only when
// their corresponding env var is set, so missing pixel IDs are a silent no-op.

const GA4_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined
const GADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID as string | undefined
const GADS_LBL = import.meta.env.VITE_GOOGLE_ADS_CONVERSION_LABEL as string | undefined
const META_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined
const TIKTOK_ID = import.meta.env.VITE_TIKTOK_PIXEL_ID as string | undefined
const SNAP_ID = import.meta.env.VITE_SNAPCHAT_PIXEL_ID as string | undefined

let initialized = false

function injectScript(src: string) {
    const s = document.createElement('script')
    s.src = src
    s.async = true
    document.head.appendChild(s)
}

function injectInline(code: string) {
    const s = document.createElement('script')
    s.text = code
    document.head.appendChild(s)
}

export function initAnalytics() {
    if (initialized || typeof window === 'undefined') return
    initialized = true

    // GA4 + Google Ads share gtag.js
    const gtagId = GA4_ID || GADS_ID
    if (gtagId) {
        injectScript(`https://www.googletagmanager.com/gtag/js?id=${gtagId}`)
        window.dataLayer = window.dataLayer || []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.gtag = function gtag(...args: any[]) {
            window.dataLayer!.push(args)
        }
        window.gtag('js', new Date())
        if (GA4_ID) window.gtag('config', GA4_ID)
        if (GADS_ID) window.gtag('config', GADS_ID)
    }

    // Meta Pixel
    if (META_ID) {
        injectInline(`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_ID}');fbq('track','PageView');`)
    }

    // TikTok Pixel
    if (TIKTOK_ID) {
        injectInline(`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${TIKTOK_ID}');ttq.page();}(window,document,'ttq');`)
    }

    // Snapchat Pixel
    if (SNAP_ID) {
        injectInline(`(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];var s='script',r=t.createElement(s);r.async=!0;r.src=n;var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u);})(window,document,'https://sc-static.net/scevent.min.js');snaptr('init','${SNAP_ID}');snaptr('track','PAGE_VIEW');`)
    }
}

type EventName =
    | 'sign_up'
    | 'login'
    | 'champions_section_view'
    | 'champions_section_cta_click'

export function trackEvent(name: EventName, params: Record<string, unknown> = {}) {
    if (typeof window === 'undefined') return

    if (window.gtag && GA4_ID) {
        window.gtag('event', name, params)
    }
    if (window.gtag && GADS_ID && GADS_LBL && (name === 'sign_up' || name === 'login')) {
        window.gtag('event', 'conversion', {
            send_to: `${GADS_ID}/${GADS_LBL}`,
            ...params,
        })
    }

    if (window.fbq) {
        const meta =
            name === 'sign_up' ? 'CompleteRegistration' :
                name === 'login' ? 'Lead' :
                    'ViewContent'
        window.fbq('track', meta, params)
    }
    if (window.ttq) {
        const tt =
            name === 'sign_up' ? 'CompleteRegistration' :
                name === 'login' ? 'Subscribe' :
                    'ViewContent'
        window.ttq.track(tt, params)
    }
    if (window.snaptr) {
        const snap =
            name === 'sign_up' ? 'SIGN_UP' :
                name === 'login' ? 'LOGIN' :
                    'VIEW_CONTENT'
        window.snaptr('track', snap, params)
    }

    if (import.meta.env.DEV) {
        console.log('[analytics]', name, params)
    }
}
