import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-buy-button': {
        'buy-button-id': string;
        'publishable-key': string;
      };
    }
  }
}

export default function StripeBuyButton() {
  const loaded = useRef(false);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/buy-button.js";
    script.async = true;
    script.onload = () => { 
      loaded.current = true; 
      scriptLoaded.current = true;
    };
    script.onerror = () => {
      console.warn("Failed to load Stripe Buy Button script");
    };
    
    document.body.appendChild(script);
    
    return () => {
      // Cleanup on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="mt-6 text-center">
      <stripe-buy-button
        buy-button-id="buy_btn_1RxFChFbY2J5dlaP3cqQEcyn"
        publishable-key="pk_live_51RxF41FbY2J5dlaPfSXoWySMCb9msipiXa01XIGfB8cV7p6nuamf8SPCjgFzLiuGpUUep7DPRbDKIDCenCcud7f600bLMrM3MK"
      />
      <noscript>
        <Button asChild variant="outline" className="mt-4">
          <a href="https://buy.stripe.com/aFa5kDc8egsW0wwb3Qcs800">
            Buy Pro on Stripe
          </a>
        </Button>
      </noscript>
    </div>
  );
}