export default function loadImage(url, anonymous = false) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        if (anonymous) {
            image.crossOrigin = 'anonymous';
        }
        image.onload = function() {
            resolve(image);
        };
        image.onerror = reject;
        image.src = url;
    });
}
