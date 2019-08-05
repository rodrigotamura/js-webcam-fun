const video = document.querySelector('.player'); 
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');

function getVideo() {
    /**
     * This function will get access and throw the image captured
     * at video element.
     * 
     * The following has been depreceated by major browsers as of Chrome and Firefox.
     * video.src = window.URL.createObjectURL(localMediaStream);
     */
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(localMediaStream => {
            // main line to throw the captured images 
            // from webcam to the video element:
            video.srcObject = localMediaStream; 
            video.play(); // if we do not put this line the image will be static
        })
        .catch(err => {
            console.error(`OH NO!!!`, err);
        });
}

function paintToCanvas() {
    // This function will mirror video elemento
    // into canvas element in order to make the
    // effects

    // actual video element size
    const width = video.videoWidth;
    const height = video.videoHeight;

    // canvas size will be video's size
    canvas.width = width;
    canvas.height = height;

    // now we will take the frame from video el into
    // canvas element in a period of time.
    // return to get the reference to stop it.
    return setInterval(() => {
        // drawing video's frame on position 0x0 (top x left)
        ctx.drawImage(video, 0, 0, width, height);
        // takes the pixels out
        let pixels = ctx.getImageData(0, 0, width, height);
        // mess with them
        // pixels = redEffect(pixels);
        // pixels = rgbSplit(pixels);
        // ctx.globalAlpha = 0.1;
        pixels = greenScreen(pixels);
        // put them  back
        ctx.putImageData(pixels, 0, 0);
    }, 16);
}

function redEffect(pixels) {
    for(let i = 0; i < pixels.data.length; i += 4){
        pixels.data[i + 0] = pixels.data[i + 0] + 200; // RED
        pixels.data[i + 1] = pixels.data[i + 1] - 50; // GREEN
        pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // Blue
    }

    return pixels;
}

function rgbSplit(pixels) {
    for(let i = 0; i < pixels.data.length; i += 4){
        pixels.data[i + 150] = pixels.data[i + 0] + 200; // RED
        pixels.data[i + 500] = pixels.data[i + 1] - 50; // GREEN
        pixels.data[i + 550] = pixels.data[i + 2] * 0.5; // Blue
    }

    return pixels;
}

function greenScreen(pixels) {
    const levels = {};

  document.querySelectorAll('.rgb input').forEach((input) => {
    levels[input.name] = input.value;
  });

  for (i = 0; i < pixels.data.length; i = i + 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];

    if (red >= levels.rmin
      && green >= levels.gmin
      && blue >= levels.bmin
      && red <= levels.rmax
      && green <= levels.gmax
      && blue <= levels.bmax) {
      // take it out!
      pixels.data[i + 3] = 0;
    }
  }

  return pixels;
}

function takePhoto() {
    // played the sound
    snap.currentTime = 0; // sound reseting
    snap.play();

    // take the data out of the canvas
    const data = canvas.toDataURL('image/jpeg'); // generating base64
    const link = document.createElement('a');
    link.href = data;
    link.setAttribute('download', 'handsome');
    link.innerHTML = `<img src='${data}' alt='This is the shot!'>`;
    strip.insertBefore(link, strip.firstChild);
}

getVideo();

// once the video is playing, will execute function
video.addEventListener('canplay', paintToCanvas);

