import Config from "./config"
import Sketch from "./model/delaunaySketch"
import ImageMesher from "./model/imageMesher"
import setWindowProperties from "./window"
import Parameters from "./parameters"
import VideoFeed from "./model/videoFeed"
import videoFeed from "./model/videoFeed"

function takeSnapshot(videoFeed: videoFeed) {
  setTimeout(() => {
    videoFeed.snapshot()
    takeSnapshot(videoFeed)
  }, 200)
}

window.onload = () => {
  setWindowProperties()
  const container = document.getElementById("canvas") as HTMLCanvasElement
  const imageMesher = new ImageMesher(Config.imageMesh.sourcePath, container)

  const sketch = new Sketch(container, imageMesher)
  imageMesher.onLoad(() => sketch.draw())

  const videoFeed = new VideoFeed(imageMesher)

  const parameters = new Parameters(sketch, videoFeed)

  sketch.reset()
}

