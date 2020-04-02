import seedrandom from "seedrandom"

export default class Random {
  private rng: seedrandom.prng
  seed: string

  constructor() {
    const urlParams = new URLSearchParams(window.location.search)
    this.seed = urlParams.get("seed") || this.createSeed()
    this.setSeed()
  }

  setSeed() {
    this.rng = seedrandom(this.seed)
  }

  private createSeed() {
    return Math.floor(Math.random() * 100000).toString()
  }

  max(max: number) {
    return this.rng.double() * max
  }
}
