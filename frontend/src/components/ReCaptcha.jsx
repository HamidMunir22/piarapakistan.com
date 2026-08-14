import React, { useEffect, useRef, useState } from "react";

// Google reCAPTCHA v2 ("I'm not a robot" checkbox) widget, loaded only when a
// site key is configured (VITE_RECAPTCHA_SITE_KEY). If no key is set — e.g.
// before the site owner has created their own keys at
// https://www.google.com/recaptcha/admin — this component silently renders
// nothing and the app keeps working; the backend's verifyRecaptcha() util
// mirrors this "skip when unconfigured" behavior so nothing gets blocked.
let scriptLoadingPromise = null;
const loadRecaptchaScript = () => {
  if (window.grecaptcha) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;
  scriptLoadingPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
  return scriptLoadingPromise;
};

const ReCaptcha = ({ onChange }) => {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;

    loadRecaptchaScript().then(() => {
      const tryRender = () => {
        if (cancelled) return;
        if (!window.grecaptcha?.render) {
          setTimeout(tryRender, 200);
          return;
        }
        if (containerRef.current && widgetIdRef.current === null) {
          widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token) => onChange?.(token),
            "expired-callback": () => onChange?.(null),
          });
          setReady(true);
        }
      };
      tryRender();
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  if (!siteKey) return null; // no key configured yet — skip verification entirely

  return <div className="recaptcha-box" ref={containerRef} aria-busy={!ready} />;
};

export default ReCaptcha;
