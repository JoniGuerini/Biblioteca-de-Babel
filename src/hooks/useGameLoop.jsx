import { useEffect, useRef, useState } from 'react';
import { useGameState, LINE_CONFIG } from './useGameState';
import { updateProduction, updateLineProduction } from '../game';
import { Decimal } from '../game/Decimal';

const TARGET_FPS = 60;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

export function useGameLoop() {
  const { stateRef, generatorsRef, updateDisplay, lastSaveTimeRef, saveGameWithTimestamp, forceUpdate, SAVE_INTERVAL_MS, UI_UPDATE_INTERVAL_MS } = useGameState();
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
        const state = stateRef.current;
        const allGenerators = generatorsRef.current;
        const prestigePoints = state.prestigePoints || 0;

        const lettersResult = updateProduction(
          { 
            ...state, 
            generators: allGenerators.letters,
            letters: state.letters,
            generatorCycleProgress: state.cycleProgress?.letters || new Map(),
            generatorAccumulators: state.accumulators?.letters || new Map(),
          },
          FRAME_INTERVAL
        );
        state.letters = lettersResult.letters;
        state.cycleProgress.letters = lettersResult.generatorCycleProgress;
        state.accumulators.letters = lettersResult.generatorAccumulators;
        state.scribes = lettersResult.scribes;
        state.scribeAccumulator = lettersResult.scribeAccumulator;

        for (let i = 1; i < LINE_CONFIG.length; i++) {
          const lineConfig = LINE_CONFIG[i];
          if (prestigePoints >= lineConfig.prestigeRequired) {
            const lineId = lineConfig.id;
            const lineGenerators = allGenerators[lineId];
            if (!lineGenerators) continue;
            
            const lineResult = updateLineProduction(
              lineGenerators,
              state[lineId] || new Decimal(10),
              state.cycleProgress?.[lineId] || new Map(),
              state.accumulators?.[lineId] || new Map(),
              FRAME_INTERVAL
            );
            state[lineId] = lineResult.resource;
            state.cycleProgress[lineId] = lineResult.cycleProgress;
            state.accumulators[lineId] = lineResult.accumulators;
          }
        }

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
  }, [stateRef, generatorsRef, updateDisplay, lastSaveTimeRef, saveGameWithTimestamp, forceUpdate, SAVE_INTERVAL_MS, UI_UPDATE_INTERVAL_MS]);

  return { fps };
}
