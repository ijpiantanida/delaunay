import seedrandom from "seedrandom"

class Random {
  private rng: seedrandom.prng

  constructor() {
    this.setSeed()
  }

  setSeed() {
    const urlParams = new URLSearchParams(window.location.search)
    const seed = urlParams.get("seed") || undefined
    this.rng = seedrandom(seed)
  }

  max(max: number) {
    return this.rng.double() * max
  }
}

export default new Random()
