"use client";
import { useEffect, useRef } from "react";

export default function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let vantaEffect: any;

    const initVanta = async () => {
      const THREE = await import("three");
      // @ts-ignore - no types for vanta
      const NET = (await import("vanta/dist/vanta.net.min")).default;

      vantaEffect = NET({
        el: vantaRef.current,
        THREE: THREE,
        color: 0xff3f81,
        backgroundColor: 0x23153c,
        points: 12,
        maxDistance: 24,
        spacing: 20,
        showDots: true,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
      });
    };

    initVanta();

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, []);

  return (
    <>
      <div
        ref={vantaRef}
        className="fixed inset-0 -z-20"
        style={{ pointerEvents: "none" }}
      />
      <div className="fixed inset-0 -z-10 bg-black/10" style={{ pointerEvents: "none" }} />
    </>
  );
}
