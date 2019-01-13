import Config from "./config"
import Sketch from "./model/delaunaySketch"

window.onload = () => {
  const container = document.getElementById("container") as HTMLCanvasElement
  const sketch = Sketch.draw(container)

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

