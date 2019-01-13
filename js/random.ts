import seedrandom from 'seedrandom';

const urlParams = new URLSearchParams(window.location.search)
const seed = urlParams.get("seed") || undefined
const rng = seedrandom(seed)

export default {
  max(max: number) {
    return rng.double() * max
  }
}
