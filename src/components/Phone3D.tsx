import React from 'react';

export default function Phone3D() {
  return (
    <div className="w-full h-full absolute inset-0 z-20 hover:scale-105 transition-transform duration-700 pointer-events-auto overflow-hidden rounded-[3rem]">
      <div className="sketchfab-embed-wrapper w-full h-full relative">
        <iframe 
          title="iPhone 17 Pro" 
          frameBorder="0" 
          allowFullScreen 
          //@ts-ignore
          mozallowfullscreen="true" 
          //@ts-ignore
          webkitallowfullscreen="true" 
          allow="autoplay; fullscreen; xr-spatial-tracking" 
          xr-spatial-tracking="true" 
          execution-while-out-of-viewport="true" 
          execution-while-not-rendered="true" 
          web-share="true" 
          src="https://sketchfab.com/models/4541aa8a28324b33a2baaf81d263aaec/embed?autostart=1&ui_theme=dark&ui_infos=0&ui_watermark=0&ui_watermark_link=0&ui_controls=0&ui_inspector=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_animations=0&ui_hint=0&ui_stop=0&transparent=1"
          className="w-[115%] h-[115%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-auto"
        ></iframe> 
      </div>
    </div>
  );
}

