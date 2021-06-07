<script>
  import './index.js';

  let hex = '#ff3e00';
  let wheelDiameter = 300;
  let wheelThickness = 30;
  let handleDiameter = 20;
  let wheelReflectsSaturation = true;
</script>

<main style="display: flex">
  <div style="flex: none; display: flex; flex-direction: column; align-items: flex-start; margin-right: 32px">
    <label>
      hex<br />
      <input type="color" bind:value={hex} />
    </label>
    <label style="margin-top: 16px">
      wheelDiameter<br />
      <input type="range" bind:value={wheelDiameter} min={100} max={1000} />
    </label>
    <label style="margin-top: 16px">
      wheelThickness<br />
      <input type="range" bind:value={wheelThickness} min={2} max={wheelDiameter / 2} />
    </label>
    <label style="margin-top: 16px">
      handleDiameter<br />
      <input type="range" bind:value={handleDiameter} min={2} max={wheelDiameter / 2} />
    </label>
    <label style="margin-top: 16px">
      <input type="checkbox" bind:checked={wheelReflectsSaturation} />
      wheelReflectsSaturation
    </label>
  </div>
  <reinvented-color-wheel
    hex={hex}
    wheel-diameter={wheelDiameter}
    wheel-thickness={wheelThickness}
    handle-diameter={handleDiameter}
    wheel-reflects-saturation={wheelReflectsSaturation}
    on:change={e => hex = e.detail.hex}
  />
</main>
