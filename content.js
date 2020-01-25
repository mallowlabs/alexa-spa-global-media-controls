(() => {
    // Play silent audio because Global Media Controls need to play audio on the tab.
    const audioElement = new Audio();
    audioElement.loop = true;
    audioElement.volume = 0;

    const playSilentAudio = () => {
        if (audioElement.paused) {
            audioElement.src = chrome.runtime.getURL('silent.ogg');
            audioElement.play();
        }
    }

    const pauseSilentAudio = () => {
        if (!audioElement.paused) {
            audioElement.pause();
            audioElement.src = '';
        }
    }

    const onTitleChange = (_mutations) => {
        setTimeout(() => {
            const infoText = document.getElementById('d-info-text');
            if (!infoText) {
                pauseSilentAudio();
                return;
            }

            const title = infoText.getElementsByClassName('d-main-text')[0].textContent;
            const artist = infoText.getElementsByClassName('d-sub-text-1')[0].textContent;
            const album = infoText.getElementsByClassName('d-sub-text-2')[0].textContent;
            const img = document.getElementById('d-now-playing-cover-view').getElementsByTagName('img')[0];
            if (img) {
                playSilentAudio();

                navigator.mediaSession.metadata = new MediaMetadata({
                    title: `${title} - ${album}`,
                    artist: artist,
                    artwork: [
                        { sizes: '412x412', src: img.getAttribute('src') }
                    ]
                });
            }
        }, 100);
    }

    console.log('alexa-spa-global-media-controls is loaded');

    navigator.mediaSession.setActionHandler('pause', () => { document.getElementById('d-play-pause').click(); });
    navigator.mediaSession.setActionHandler('previoustrack', () => { document.getElementById('d-previous').click(); });
    navigator.mediaSession.setActionHandler('nexttrack', () => { document.getElementById('d-next').click(); });

    var titleObserver = null;

    const content = document.getElementById('d-main');
    const mainObserver = new MutationObserver(_mutations => {
        const infoGroup = document.getElementById('d-np-image-info-group');
        if (infoGroup && document.getElementById('d-info-text')) {
            if (titleObserver === null) {
                titleObserver = new MutationObserver(onTitleChange);
                titleObserver.observe(infoGroup, {
                    characterData: true,
                    childList: true,
                    subtree: true
                });
                onTitleChange([]);
            }
        } else {
            pauseSilentAudio();

            if (titleObserver) {
                titleObserver.disconnect();
                titleObserver = null;
            }
        }
    });
    mainObserver.observe(content, {
        characterData: true,
        childList: true,
        subtree: true
    });
})();
