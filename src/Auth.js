import { writable } from "svelte/store";

export let USER = writable({})
export function getUserInfo() {
    return new Promise((resolve, reject) => {
        fetch('/getMyInfo')
            .then(res => res.json())
            .then(res => {
                if (res) {
                    USER.set({
                        loggedIn: true,
                        email: res.email
                    });
                }
                resolve();
            }).catch((error) => {
                // console.log(error);
                resolve();
            });
    });
}