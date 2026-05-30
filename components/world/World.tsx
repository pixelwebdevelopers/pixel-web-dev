'use client';

import { WorldEnvironment } from './Environment';
import { Ground } from './Ground';
import { Scenery } from './Scenery';
import { GroundDecor } from './GroundDecor';
import { StationMarker } from '@/components/stations/StationMarker';
import { STATIONS } from '@/utils/config';

export function World() {
  return (
    <>
      <WorldEnvironment />
      <Ground />
      <Scenery />
      <GroundDecor />

      {/* drive up to a signpost to open that zone */}
      {STATIONS.map((s) => (
        <StationMarker key={s.id} station={s} />
      ))}
    </>
  );
}
