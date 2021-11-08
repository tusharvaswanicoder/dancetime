import { dlManager, MEDIA_STATUS } from '../Downloads/DownloadManager';
import { writable } from "svelte/store";
import { DIFFICULTY, VISIBILITY } from '../constants';
import { v1 } from 'uuid';

const PROJECTS_LOCALSTORE_NAME = 'projects';

class ProjectManager {
    constructor () {
        this.ensureProjectsInLocalStorage();
        this.projects = JSON.parse(localStorage.getItem(PROJECTS_LOCALSTORE_NAME));
        this.projectsStore = writable(this.projects);
    }
    
    /**
     * Ensures that the downloadedMedia object is in localStorage so we can use it
     */
     ensureProjectsInLocalStorage () {
        if (!localStorage.getItem(PROJECTS_LOCALSTORE_NAME)) {
            localStorage.setItem(PROJECTS_LOCALSTORE_NAME, JSON.stringify({}));
        }
    }
    
    /**
     * Updates this.projects in the localStorage and in the projectsStore
     */
     updateProjectsInLocalStorage () {
        localStorage.setItem(PROJECTS_LOCALSTORE_NAME, JSON.stringify(this.projects));
        this.projectsStore.set(this.projects);
    }
    
    projectExists (uuid) {
        return typeof this.projects[uuid] != 'undefined'; 
    }
    
    createNewProject (name, media_id) {
        const metadata = this.getNewProjectMetadata(name, media_id);
        this.projects[metadata.uuid] = metadata;
        this.updateProjectsInLocalStorage();
        dlManager.startMediaDownload(media_id, (metadata_entry) => {
            metadata.choreography = metadata_entry.channel;
            metadata.video_link = metadata_entry.url;
            metadata.media_id = metadata_entry.media_id;
            metadata.length = metadata_entry.duration;
            this.updateProjectsInLocalStorage();
        });
    }
    
    deleteProject (project) {
        if (this.projects[project.uuid]) {
            delete this.projects[project.uuid];
            this.updateProjectsInLocalStorage();
        }
    }
    
    getNewProjectMetadata (name, media_id) {
        return {
            project_name: name,
            uuid: this.getNewProjectUUID(),
            title: '',
            song_artist: '',
            choreography: '',
            difficulty: DIFFICULTY.EASY,
            last_edited: (new Date()).toISOString(),
            video_source: 'youtube',
            video_link: media_id,
            length: 0,
            download: 0,
            visibility: VISIBILITY.DRAFT
        }
    }
    
    getNewProjectUUID () {
        let uuid = v1();
        while (this.projectExists(uuid)) {
            uuid = v1();
        }
        return uuid;
    }
    
    subscribe (f) {
        return this.projectsStore.subscribe(f);
    }
}

const projectManager = new ProjectManager();
export default projectManager;