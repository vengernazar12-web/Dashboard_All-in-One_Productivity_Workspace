const unitConverterUnits = {
  length: {
    mm: 0.001,
    cm: 0.01,
    dm: 0.1,
    m: 1,
    km: 1000,

    inch: 0.0254,
    ft: 0.3048,
    yd: 0.9144,
    mile: 1609.344,
    naut_mile: 1852
  },

  mass: {
    mg: 0.001,
    g: 1,
    kg: 1000,
    t: 1000000,

    oz: 28.349523125,
    lb: 453.59237,
    stone: 6350.29318
  },

  time: {
    ms: 0.001,
    s: 1,
    min: 60,
    h: 3600,
    day: 86400,
    week: 604800,
    month: 2629800, // ~30.44 days
    year: 31557600  // ~365.25 days
  },

  area: {
    mm2: 0.000001,
    cm2: 0.0001,
    m2: 1,
    km2: 1000000,

    hectare: 10000,
    acre: 4046.8564224,
    ft2: 0.09290304,
    yd2: 0.83612736,
    mile2: 2589988.110336
  },

  volume: {
    ml: 0.001,
    l: 1,
    m3: 1000,

    tsp: 0.00492892,
    tbsp: 0.0147868,
    cup: 0.236588,
    pint: 0.473176,
    gallon: 3.78541,
    quart: 0.946353
  },

  speed: {
    "m/s": 1,
    "km/h": 0.277777778,
    mph: 0.44704,
    knot: 0.514444,
    "ft/s": 0.3048
  },

  data: {
    B: 1,
    KB: 1000,
    MB: 1000000,
    GB: 1000000000,
    TB: 1000000000000,

    KiB: 1024,
    MiB: 1048576,
    GiB: 1073741824,
    TiB: 1099511627776,

    bit: 0.125,
    Kbit: 125,
    Mbit: 125000,
    Gbit: 125000000
  },

  energy: {
    J: 1,
    kJ: 1000,
    cal: 4.184,
    kcal: 4184,
    Wh: 3600,
    kWh: 3600000
  },

  pressure: {
    Pa: 1,
    kPa: 1000,
    bar: 100000,
    atm: 101325,
    psi: 6894.757,
    mmHg: 133.322368,
    torr: 133.322368
  }
};
const temperatureUnitConverters = {
  c: {
    c: v => v,
    k: v => v + 273.15,
    f: v => v * 9 / 5 + 32
  },

  k: {
    c: v => v - 273.15,
    k: v => v,
    f: v => (v - 273.15) * 9 / 5 + 32
  },

  f: {
    c: v => (v - 32) * 5 / 9,
    k: v => (v - 32) * 5 / 9 + 273.15,
    f: v => v
  }
};

const unitConverterWrap = document.querySelector('.unit-converter-wrap');
// Open
const openUnitConverterBtn = allDashboardItem.querySelector('.open-unit-converter-wrap');
openUnitConverterBtn.addEventListener('click', () => {
  closeAllWraps();
  if(needPushState) history.pushState({}, null, '#unit-converter');
  unitConverterWrap.classList.add('show');

  if(!unitConverterSelectType.childElementCount) {
    unitConverterSelectType.innerHTML = Object.keys(unitConverterUnits).map(v => `<option value=${v}>${v}</option>`).join('') + '<option value="temperature">temperature</option>';

    const allItems = Object.keys(unitConverterUnits[unitConverterSelectType.value]);
    const allTemps = Object.keys(temperatureUnitConverters);
    unitConverterSelectFromItem.innerHTML = allItems.map(v => `<option value='${v}'>${v}</option>`).join('') + allTemps.map(t => `<option value='${t}'>${t}</option>`);
    unitConverterSelectTo.innerHTML = allItems.map(v => `<option value='${v}'>${v}</option>`).join('') + allTemps.map(t => `<option value='${t}'>${t}</option>`);

    setUnitConvertResult();
  }
})

function setUnitConvertResult() {
  const raw = unitConverterInput.value.trim();
  const value = isNaN(raw) ? 0 : +raw;

  const type = unitConverterSelectType.value,
        fromItem = unitConverterSelectFromItem.value,
        to = unitConverterSelectTo.value;

  if(type === 'temperature') unitConverterResultP.textContent = `${value} ${fromItem} = ${temperatureUnitConverters[fromItem][to](value)} ${to}`;
  else unitConverterResultP.textContent = `${value} ${fromItem} = ${(unitConverterUnits[type][fromItem] * value) / unitConverterUnits[type][to]} ${to}`;
}

const unitConverterInput = unitConverterWrap.querySelector('input');
unitConverterInput.addEventListener('input', () => setUnitConvertResult());

const unitConverterResultP = unitConverterWrap.querySelector('p.result');

const unitConverterSelectType = unitConverterWrap.querySelector('select.from-type');
unitConverterSelectType.addEventListener('change', () => {
  const allItems = Object.keys(unitConverterUnits[unitConverterSelectType.value] || {});
  const allTemps = Object.keys(temperatureUnitConverters || {});
  unitConverterSelectFromItem.innerHTML = allItems.map(v => `<option value='${v}'>${v}</option>`).join('') + allTemps.map(t => `<option value='${t}'>${t}</option>`);
  unitConverterSelectTo.innerHTML = allItems.map(v => `<option value='${v}'>${v}</option>`).join('') + allTemps.map(t => `<option value='${t}'>${t}</option>`);

  setUnitConvertResult();
});

const unitConverterSelectFromItem = unitConverterWrap.querySelector('select.from-item');
unitConverterSelectFromItem.addEventListener('change', () => setUnitConvertResult());

const unitConverterSelectTo = unitConverterWrap.querySelector('select.to');
unitConverterSelectTo.addEventListener('change', () => setUnitConvertResult());