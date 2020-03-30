export type RGBColor = number[]

export default class Gradient {
  private colors: RGBColor[]
  private threshold: number

  constructor(colors: RGBColor[]) {
    this.colors = colors
    this.threshold = 0
  }

  precalculate(gradientSize: number) {
    this.threshold = Math.floor(gradientSize / (this.colors.length - 1))
  }

  colorFor(position: number): RGBColor {
    if (this.colors.length < 2) {
      return this.colors[0]
    }

    const bucket = Math.floor(position / this.threshold)

    const startColor = this.colors[bucket]
    const endColor = this.colors[bucket + 1]

    const weight = (position - bucket * this.threshold) / this.threshold

    return this.interpolate(startColor, endColor, weight)
  }

  interpolate(startColor: RGBColor, endColor: RGBColor, weight: number) {
    const w1 = weight
    const w2 = 1 - w1
    return [
      Math.round(startColor[0] * w2 + endColor[0] * w1),
      Math.round(startColor[1] * w2 + endColor[1] * w1),
      Math.round(startColor[2] * w2 + endColor[2] * w1)
    ]
  }
}
