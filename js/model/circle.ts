import Particle from "./particle"
import Random from "../random"

export default class Circle {
  x: number
  y: number
  radius: number

  constructor(x: number, y: number, radius: number) {
    this.x = x
    this.y = y
    this.radius = radius
  }

  contains(p: Particle) {
    return Math.sqrt((this.x - p.x) ** 2 + (this.y - p.y) ** 2) <= this.radius
  }

  getRandomPoint(random: Random) {
    const a = random.max(1) * 2 * Math.PI
    const r = this.radius * random.max(1)

    const x = Math.floor(r * Math.cos(a))
    const y = Math.floor(r * Math.sin(a))
    return new Particle(this.x + x, this.y + y)
  }
}
