import { loadSeedData } from './parseSeedData';

describe('loadSeedData', () => {
  it('should return tracking and checkpoints data', async () => {
    const seedData = await loadSeedData();

    expect(seedData.trackings).toBeDefined();
    expect(seedData.checkpoints).toBeDefined();
  });
});
