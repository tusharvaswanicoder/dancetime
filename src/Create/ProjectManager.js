import { dlManager, MEDIA_STATUS } from '../Downloads/DownloadManager';
import { writable } from "svelte/store";
import { DIFFICULTY, VISIBILITY } from '../constants';
import { v1 } from 'uuid';
import { DB_TABLES, StoreObject } from '../ChartAndKeypointDBManager';

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
        // Clear keypoints before updating localStorage
        const projects_to_add = {};
        Object.keys(this.projects).forEach((key) => {
            projects_to_add[key] = JSON.parse(JSON.stringify(this.projects[key]));
            projects_to_add[key].keypoints = {};
        })
        
        localStorage.setItem(PROJECTS_LOCALSTORE_NAME, JSON.stringify(projects_to_add));
        this.projectsStore.set(this.projects);
    }
    
    saveProject(project) {
        this.projects[project.uuid] = project;
        this.updateProjectsInLocalStorage();
        
        StoreObject(JSON.stringify(project.keypoints), project.uuid, DB_TABLES.LOCAL_KEYPOINTS, () => {
            console.log('Stored keypoints')
        })
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
            metadata.duration = metadata_entry.duration;
            metadata.fps = metadata_entry.fps;
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
            duration: 0,
            download: 0,
            visibility: VISIBILITY.DRAFT,
            tags: [],
            components: [],
            keypoints: {} // Keypoints are only stored in memory here
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