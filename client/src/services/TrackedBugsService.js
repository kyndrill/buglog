import { AppState } from "../AppState.js"
import { Bug } from "../models/Bug.js"
import { TrackedBug } from "../models/TrackedBug.js"
import { logger } from "../utils/Logger.js"
import { api } from "./AxiosService.js"

class TrackedBugsService {

  async getTrackersOfBug(bugId) {
    let res = await api.get(`api/bugs/${bugId}/trackedbugs`)
    logger.log("Got trackers", res.data)
    AppState.trackedBugs = res.data.map((trackedBug) => new TrackedBug(trackedBug))
  }

  async getAllMyTrackedBugs() {
    let res = await api.get(`account/trackedbugs`)
    logger.log("My tracked bugs", res.data)
    AppState.trackedBugs = res.data.map((trackedBug) => new TrackedBug(trackedBug))
    this.extractBugsFromTrackedBugs()
  }

  async trackBug(bugId) {
    let bugData = {bugId: bugId}
    let res = await api.post(`api/trackedbugs`, bugData)
    logger.log("new tracked bug", res.data)
    AppState.trackedBugs.push(new TrackedBug(res.data))
  }

  async unTrackBug(bugId) {
    let trackedBug = AppState.trackedBugs.find(bug => bug.bugId == bugId && bug.accountId == AppState.account.id)
    if(!trackedBug) {
      throw new Error(`You are not tracking this bug`)
    }  
    let res = await api.delete(`api/trackedbugs/${trackedBug.id}`)
    let trackedBugIndex = AppState.trackedBugs.findIndex(trackedBug => trackedBug.bugId == bugId && trackedBug.accountId == AppState.account.id)
    AppState.trackedBugs.splice(trackedBugIndex, 1)
  }

  async deleteAllTrackersOfBug() {
    if(AppState.trackedBugs.length <= 0) {
      return
    }
    await AppState.trackedBugs.forEach((trackedBug) => api.delete(`api/trackedbugs/${trackedBug.id}`))
    AppState.trackedBugs = []
  }

  extractBugsFromTrackedBugs() {
    logger.log("Appstate.bugs", AppState.bugs)
    const bugMap = new Map(AppState.bugs.map(bug => [bug.id, bug]));
    logger.log("bugMap", bugMap)
    const trackedBugObjects = AppState.trackedBugs.map(trackedBug => bugMap.get(trackedBug.bugId));
    logger.log("trackedBugObjects", trackedBugObjects)
    AppState.bugsUserIsTracking = trackedBugObjects.map((object) => new Bug(object))
    logger.log("bugsUserIsTracking", AppState.bugsUserIsTracking)
  }

}

export const trackedBugsService = new TrackedBugsService()