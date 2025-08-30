const CaretDropDown = ({ defaultValue, changeHandler, deviceList, type }) => {
  let dropDownEl;
  if (type === "video") {
    // console.log(deviceList);
    dropDownEl = deviceList.map((videoDevice) => (
      <option key={videoDevice.deviceId} value={videoDevice.deviceId}>
        {videoDevice.label}
      </option>
    ));
  } else if (type === "audio") {
    // console.log(deviceList);
    const audioInputEl = [];
    const audioOutputEl = [];
    deviceList.forEach((aD, index) => {
      if (aD.kind === "audioinput") {
        // console.log(aD);
        audioInputEl.push(
          <option key={`input${aD.deviceId}`} value={`input${aD.deviceId}`}>
            {aD.label}
          </option>
        );
      } else if (aD.kind === "audiooutput") {
        audioOutputEl.push(
          <option key={`output${aD.deviceId}`} value={`ouput${aD.deviceId}`}>
            {aD.label}
          </option>
        );
      }
    });
    const uniqueId1 = Math.random();
    const uniqueId2 = Math.random();
    audioInputEl.unshift(<optgroup key={uniqueId1} label='Input Devices' />);
    audioOutputEl.unshift(<optgroup key={uniqueId2} label='Output Devices' />);
    dropDownEl = audioInputEl.concat(audioOutputEl);
  }
  return (
    <div className='caret-dropdown' style={{ top: "-25px" }}>
      <select defaultValue={defaultValue} onChange={changeHandler}>
        {dropDownEl}
        {/* <option>Hello</option> */}
      </select>
    </div>
  );
};

export default CaretDropDown;
