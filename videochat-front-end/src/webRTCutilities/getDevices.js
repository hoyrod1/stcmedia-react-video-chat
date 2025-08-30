// This a utility function that fetches all available devices //
// Both video and audio //
const getDevices = () => {
  return new Promise(async (resolve, reject) => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    // console.log(devices);
    const videoDevices = devices.filter(
      (videoDevice) => videoDevice.kind === "videoinput"
    );
    const audioOutputDevices = devices.filter(
      (audioOutputDevice) => audioOutputDevice.kind === "audiooutput"
    );
    const audioInputDevices = devices.filter(
      (audioInputDevice) => audioInputDevice.kind === "audioinput"
    );
    resolve({
      videoDevices,
      audioOutputDevices,
      audioInputDevices,
    });
  });
};

export default getDevices;
