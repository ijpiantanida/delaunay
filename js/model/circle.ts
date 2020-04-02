import Particle from "./particle"

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
}
