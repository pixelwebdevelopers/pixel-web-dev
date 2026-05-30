'use client';

import { WorldEnvironment } from './Environment';
import { Ground } from './Ground';
import { Scenery } from './Scenery';
import { GroundDecor } from './GroundDecor';
import { RocksPhysics } from './RocksPhysics';
import { BowlingPins } from './BowlingPins';
import { LetterBlocks } from './LetterBlocks';
import { ResetZones } from './ResetZones';
import { KnockablesPhysics } from './KnockablesPhysics';
import { StationMarker } from '@/components/stations/StationMarker';
import { STATIONS } from '@/utils/config';

export function World() {
  return (
    <>
      <WorldEnvironment />
      <Ground />
      <Scenery />
      <RocksPhysics />
      <GroundDecor />

      {/* mini-playgrounds */}
      <BowlingPins />
      <LetterBlocks />
      <ResetZones />
      <KnockablesPhysics />

      {/* drive up to a signpost to open that zone */}
      {STATIONS.map((s) => (
        <StationMarker key={s.id} station={s} />
      ))}
    </>
  );
}
