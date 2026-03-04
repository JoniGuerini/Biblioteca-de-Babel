import { useEffect, useRef, useState } from 'react';
import { useGameState } from './useGameState';

const TARGET_FPS = 60;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

export function useGameLoop() {
  const { stateRef, generatorsRef, updateProduction, updateDisplay, lastSaveTimeRef, saveGameWithTimestamp, forceUpdate, SAVE_INTERVAL_MS, UI_UPDATE_INTERVAL_MS } = useGameState();
  const lastFrameTimeRef = useRef(performance.now());
  const accumulatorRef = useRef(0);
  const lastUIUpdateRef = useRef(0);
  const [fps, setFps] = useState(60);
  const fpsFramesRef = useRef(0);
  const fpsLastUpdateRef = useRef(performance.now());

  useEffect(() => {
    let rafId;

    function gameLoop(currentTime) {
      rafId = requestAnimationFrame(gameLoop);

      const deltaTime = Math.min(currentTime - lastFrameTimeRef.current, 100);
      lastFrameTimeRef.current = currentTime;
      accumulatorRef.current += deltaTime;

      fpsFramesRef.current++;
      const fpsElapsed = currentTime - fpsLastUpdateRef.current;
      if (fpsElapsed >= 500) {
        setFps(Math.round((fpsFramesRef.current * 1000) / fpsElapsed));
        fpsFramesRef.current = 0;
        fpsLastUpdateRef.current = currentTime;
      }

      while (accumulatorRef.current >= FRAME_INTERVAL) {
        const result = updateProduction(
          { ...stateRef.current, generators: generatorsRef.current },
          FRAME_INTERVAL
        );
        stateRef.current.letters = result.letters;
        stateRef.current.generatorCycleProgress = result.generatorCycleProgress;
        stateRef.current.scribes = result.scribes;
        stateRef.current.generatorAccumulators = result.generatorAccumulators;
        stateRef.current.scribeAccumulator = result.scribeAccumulator;
        accumulatorRef.current -= FRAME_INTERVAL;
      }

      stateRef.current.lastActiveTime = Date.now();

      if (Date.now() - lastSaveTimeRef.current >= SAVE_INTERVAL_MS) {
        lastSaveTimeRef.current = Date.now();
        saveGameWithTimestamp();
      }

      if (currentTime - lastUIUpdateRef.current >= UI_UPDATE_INTERVAL_MS) {
        lastUIUpdateRef.current = currentTime;
        updateDisplay();
        forceUpdate(n => n + 1);
      }
    }

    rafId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(rafId);
  }, [stateRef, generatorsRef, updateProduction, updateDisplay, lastSaveTimeRef, saveGameWithTimestamp, forceUpdate, SAVE_INTERVAL_MS, UI_UPDATE_INTERVAL_MS]);

  return { fps };
}
