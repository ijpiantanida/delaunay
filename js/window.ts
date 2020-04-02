import Line from "./model/line"
import Particle from "./model/particle"
import Triangle from "./model/triangle"
import Circle from "./model/circle"

declare global {
  interface Window {
    Line: typeof Line,
    Particle: typeof Particle,
    Triangle: typeof Triangle,
    Circle: typeof Circle
  }
}

export default function setWindowProperties() {
  window.Line = Line
  window.Particle = Particle
  window.Triangle = Triangle
  window.Circle = Circle
}
