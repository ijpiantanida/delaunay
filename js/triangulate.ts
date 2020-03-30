import Config from "./config"
import Sketch from "./model/delaunaySketch"
import ImageMesher from "./model/imageMesher"

window.onload = () => {
  const container = document.getElementById("container") as HTMLCanvasElement

  let sketch: Sketch
  if (Config.colors.mesh) {
    const imageMesher = new ImageMesher("/dist/img/walle.jpg", container)
    sketch = new Sketch(container, imageMesher)
    imageMesher.onLoad(() => sketch.set())
  } else {
    sketch = new Sketch(container)
  }

  const parameters = document.querySelector("#parameters")
  const densityInput = parameters.querySelector("#density") as HTMLInputElement
  const distanceInput = parameters.querySelector("#distance") as HTMLInputElement
  const fillInput = parameters.querySelector("#fill") as HTMLInputElement

  densityInput.value = Config.parameters.density.toString()
  distanceInput.value = Config.parameters.minDistFactor.toString()
  fillInput.checked = Config.colors.fill

  parameters.querySelector("button").addEventListener("click", () => {
    const density = parseInt(densityInput.value)
    if (density > 0) {
      Config.parameters.density = density
    }
    const distance = parseInt(distanceInput.value)
    if (distance > 0) {
      Config.parameters.minDistFactor = distance
    }

    Config.colors.fill = fillInput.checked

    sketch.set()
  })
}

