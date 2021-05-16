import seedrandom from "seedrandom"

export default class Random {
  private rng: {
    double(): number
  }
  seed: string

  constructor() {
    const urlParams = new URLSearchParams(window.location.search)
    this.setSeed(urlParams.get("seed"))
  }

  setSeed(newSeed?: string) {
    this.seed = newSeed || this.createSeed()
    this.rng = seedrandom(this.seed)
  }

  private createSeed() {
    return Math.floor(Math.random() * 100000).toString()
  }

  max(max: number) {
    return this.rng.double() * max
  }
}
