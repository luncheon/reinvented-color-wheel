import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import ColorWheel from '.'

const App = () => {
  const [hex, setHex] = useState('#0000ff');
  const [wheelDiameter, setWheelDiameter] = useState(300)
  const [wheelThickness, setWheelThickness] = useState(30)
  const [handleDiameter, setHandleDiameter] = useState(20)
  const [wheelReflectsSaturation, setWheelReflectsSaturation] = useState(true)
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginRight: 32 }}>
        <label>hex</label>
        <input type="color" value={hex} onChange={e => setHex(e.target.value)} />
        <label style={{ marginTop: 16 }}>wheelDiameter</label>
        <input type="range" value={wheelDiameter} min={100} max={1000} onChange={e => setWheelDiameter(e.target.valueAsNumber)} />
        <label style={{ marginTop: 16 }}>wheelThickness</label>
        <input type="range" value={wheelThickness} min={2} max={wheelDiameter / 2} onChange={e => setWheelThickness(e.target.valueAsNumber)} />
        <label style={{ marginTop: 16 }}>handleDiameter</label>
        <input type="range" value={handleDiameter} min={2} max={wheelDiameter / 2} onChange={e => setHandleDiameter(e.target.valueAsNumber)} />
        <label style={{ marginTop: 16 }}>
          <input type="checkbox" checked={wheelReflectsSaturation} onChange={e => setWheelReflectsSaturation(e.target.checked)} />
          wheelReflectsSaturation
        </label>
      </div>
      <ColorWheel
        hex={hex}
        wheelDiameter={wheelDiameter}
        wheelThickness={wheelThickness}
        handleDiameter={handleDiameter}
        wheelReflectsSaturation={wheelReflectsSaturation}
        onChange={({ hex }) => setHex(hex)}
      />
    </div>
  )
}

ReactDOM.render(<App />, document.body.appendChild(document.createElement("div")))
