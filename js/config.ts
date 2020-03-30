import Gradient from "./model/gradient"

const Config = {
  FPS: 60,
  parameters: {
    density: 500,
    minDistFactor: 10
  },
  colors: {
    mesh: false,
    fill: true,
    gradient: new Gradient([[30, 34, 86], [105, 181, 225], [105, 0, 225], [255, 255, 255]]),
    background: "#000",
    lines: "#444444"
  }
}
export default Config
