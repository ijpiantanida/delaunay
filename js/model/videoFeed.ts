import ImageMesher from "./imageMesher"
import Config from "../config"

export default class VideoFeed {
  running: boolean
  private imageMesher: ImageMesher
  private videoEl: HTMLVideoElement
  private scheduledSnapshotTimeout?: any

  constructor(imageMesher: ImageMesher) {
    this.imageMesher = imageMesher
    this.running = false

    this.videoEl = document.getElementById("video") as HTMLVideoElement
  }

  snapshot() {
    this.imageMesher.drawInCanvas(this.videoEl)
  }

  startRecording() {
    const constraints = {
      audio: false,
      video: true
    }

    navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
      console.log("Video feed started")
      this.running = true
      this.videoEl.srcObject = stream
    })
    .catch(error => console.log("navigator.MediaDevices.getUserMedia error: ", error.message, error.name))

    this.scheduledSnapshotTimeout = this.scheduleSnapshot()
  }

  stopRecording() {
    this.running = false
    clearTimeout(this.scheduledSnapshotTimeout)
  }

  private scheduleSnapshot() {
    return setTimeout(() => {
      this.snapshot()
      this.scheduledSnapshotTimeout = this.scheduleSnapshot()
    }, Config.video.rateMs)
  }

  toggleRecording() {
    if (this.running) {
      this.stopRecording()
    } else {
      this.startRecording()
    }
  }
}
