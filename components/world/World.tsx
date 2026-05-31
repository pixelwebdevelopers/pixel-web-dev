'use client';

import { WorldEnvironment } from './Environment';
import { Ground } from './Ground';
import { Scenery } from './Scenery';
import { GroundDecor } from './GroundDecor';
import { RocksPhysics } from './RocksPhysics';
import { BowlingPins } from './BowlingPins';
import { BowlingBall } from './BowlingBall';
import { Bricks } from './Bricks';
import { LetterBlocks } from './LetterBlocks';
import { ResetZones } from './ResetZones';
import { KnockablesPhysics } from './KnockablesPhysics';
import { PortfolioBillboards } from './PortfolioBillboards';
import { ServicesStation } from './ServicesStation';
import { ContactStation } from './ContactStation';
import { Terrain } from './Terrain';
import { Signposts } from './Signposts';
import { Paths } from './Paths';
import { CardboardBoxes } from './CardboardBoxes';

export function World() {
  return (
    <>
      <WorldEnvironment />
      <Ground />
      <Scenery />
      <RocksPhysics />
      <GroundDecor />

      {/* nav: tile paths from spawn to each destination + wooden arrow signs */}
      <Paths />
      <Signposts />

      {/* terrain features (bridge + jump ramp) */}
      <Terrain />

      {/* playground props */}
      <BowlingPins />
      <BowlingBall />
      <Bricks />
      <CardboardBoxes />
      <LetterBlocks />
      <ResetZones />
      <KnockablesPhysics />

      {/* bespoke per-station visuals */}
      <PortfolioBillboards />
      <ServicesStation />
      <ContactStation />
    </>
  );
}
