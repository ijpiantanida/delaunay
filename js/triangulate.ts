import Config from "./config"
import Sketch from "./model/delaunaySketch"
import ImageMesher from "./model/imageMesher"
import setWindowProperties from "./window"
import Parameters from "./parameters"

window.onload = () => {
  setWindowProperties()
  const container = document.getElementById("container") as HTMLCanvasElement
  const imageMesher = new ImageMesher(Config.imageMesh.sourcePath, container)

  const sketch = new Sketch(container, imageMesher)
  imageMesher.onLoad(() => sketch.draw())

  const parameters = new Parameters(sketch)

  sketch.reset()
}

