import { useEffect, useRef } from "react";

import { NetworkScene } from "./NetworkScene";

/*
 * Ana səhifənin hərəkətli arxa fonu. Ekranın arxasında sabit qalır,
 * kliklərə mane olmur. Mərhələ (0…2) valideyndən ref ilə gəlir ki,
 * sürüşdürəndə React yenidən render etməsin.
 *
 * Canvas dəstəklənmirsə səhnə qurulmur, CSS-dəki fon rəngi qalır.
 */

interface NetworkBackgroundProps {
  progress: { current: number };
  dark: boolean;
}

function NetworkBackground({ progress, dark }: NetworkBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<NetworkScene | null>(null);
  const redrawRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let scene: NetworkScene;

    try {
      scene = new NetworkScene(canvas, reduced);
    } catch {
      return;
    }

    sceneRef.current = scene;
    scene.setDark(dark);
    scene.resize();

    let frame = 0;
    let lastProgress = -1;

    const loop = (now: number) => {
      /* Hərəkət azaldılıbsa yalnız mərhələ dəyişəndə çəkirik */
      if (!reduced || progress.current !== lastProgress || redrawRef.current) {
        lastProgress = progress.current;
        redrawRef.current = false;
        scene.render(progress.current, now);
      }
      frame = requestAnimationFrame(loop);
    };

    const handleResize = () => {
      scene.resize();
      lastProgress = -1;
    };

    frame = requestAnimationFrame(loop);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
      sceneRef.current = null;
    };
    // Səhnə bir dəfə qurulur; tema aşağıdakı effektlə dəyişir
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    sceneRef.current?.setDark(dark);
    redrawRef.current = true;
  }, [dark]);

  return <canvas ref={canvasRef} className="landing-network" aria-hidden="true" />;
}

export default NetworkBackground;
