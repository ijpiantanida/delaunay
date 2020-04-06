import Gradient from "./model/gradient"

const Config = {
  FPS: 60,
  parameters: {
    delaunay: true,
    density: 1000,
    minDistFactor: 50
  },
  imageMesh: {
    enabled: false,
    sourcePath: "/dist/img/king.jpg",
    sourceOpacity: 0
  },
  video: {
    rateMs: 100
  },
  colors: {
    fill: true,
    gradient: new Gradient([[30, 34, 86], [105, 181, 225], [105, 0, 225], [255, 255, 255]]),
    background: "#000",
    lines: "#444444"
  }
}
export default Config
