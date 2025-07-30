window.onload = async () => {
    updateScreenInfo();
    updateWindowInfo();
    detectUserAgent();
    await getIpAddress();
    await getGeolocation();
    await getGeolocationFromAPI();
};

window.onresize = updateWindowInfo;

function updateScreenInfo() {
    const screenInfo = `Screen: ${screen.width} x ${screen.height}`;
    // Window: ${window.innerWidth} x ${window.innerHeight}`;
    document.getElementById("screen-info").innerText = screenInfo;
    console.log(window._rawData);
    window._rawData = {
        ...window._rawData,
        screenInfo: {
            width: screen.width,
            height: screen.height
        },
    };
    console.log(window._rawData);
}

function updateWindowInfo() {
    const screenInfo = `Window: ${window.innerWidth} x ${window.innerHeight}`;
    document.getElementById("window-info").innerText = screenInfo;
    window._rawData = {
        ...window._rawData,
        windowInfo: {
            width: window.innerWidth,
            height: window.innerHeight
        },
    };
}

// OS Detection
function getOS() {
    const userAgent = navigator.userAgent;
    if (/Windows NT 10/.test(userAgent)) return "Windows 10";
    if (/Windows NT 11/.test(userAgent)) return "Windows 11";
    if (/Mac OS X/.test(userAgent)) return "macOS";
    if (/Linux/.test(userAgent)) return "Linux";
    if (/Android/.test(userAgent)) return "Android";
    if (/iPhone|iPad/.test(userAgent)) return "iOS";
    return "Unknown OS";
}

async function getGeolocationFromAPI() {
    try {
        const res = await fetch("http://ip-api.com/json/?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query");
        const locationData = await res.json();
        console.log("api response", locationData);
        window._rawData = {
            ...window._rawData,
            locationDataFromAPI: locationData
        };
        const lat = locationData.lat.toFixed(5);
        const lon = locationData.lon.toFixed(5);
        document.getElementById("geolocation_ip").innerText = `Latitude: ${lat}, Longitude: ${lon}`;
        window._rawData = {
            ...window._rawData,
            location: { latitude: lat, longitude: lon }
        };
        renderMapIp(lat, lon);
        let locationCountry = locationData.country || "Unknown";
        let locationCountryCode = locationData.countryCode || "Unknown";
        let locationRegion = locationData.region || "Unknown";
        let locationRegionName = locationData.regionName || "Unknown";
        document.getElementById("location-country").innerText = `${locationCountry} (${locationCountryCode})`;
        // document.getElementById("location-country-code").innerText = locationData.countryCode || "Unknown";
        // document.getElementById("location-region").innerText = locationData.region || "Unknown";
        document.getElementById("location-region-name").innerText = `${locationRegionName} (${locationRegion})`;
        document.getElementById("location-city").innerText = locationData.city || "Unknown";
        document.getElementById("location-zip").innerText = locationData.zip || "Unknown";
        document.getElementById("location-timezone").innerText = locationData.timezone || "Unknown";
        document.getElementById("location-isp").innerText = locationData.isp || "Unknown";
        document.getElementById("location-as").innerText = locationData.as || "Unknown";
        document.getElementById("location-asname").innerText = locationData.asname || "Unknown";
        document.getElementById("location-coordinates").innerText = `Lat: ${lat}, Lon: ${lon}` || "Unknown";
        document.getElementById("location-district").innerText = locationData.district || "Unknown";
        // document.getElementById("location-currency").innerText = locationData.currency || "Unknown";
        return locationData;;
    } catch (err) {
        console.error("Error fetching location data", err);
    }
    return null;
}

async function getIpAddress() {
    try {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        document.getElementById("ip-address").innerText = data.ip;
    } catch (err) {
        document.getElementById("ip-address").innerText = "Error fetching IP";
    }

}

function getArchitectureInfo() {
    const ua = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    let arch = 'Unknown';

    // Detect 64-bit
    if (ua.includes('x86_64') || ua.includes('win64') || ua.includes('amd64') || platform.includes('x86_64') || ua.includes('wow64')) {
        arch = '64-bit';
    }
    // Detect 32-bit
    else if (ua.includes('i386') || ua.includes('i686') || ua.includes('x86') || platform.includes('x86')) {
        arch = '32-bit';
    }
    // Detect ARM (used in mobiles and some modern laptops)
    else if (ua.includes('arm') || platform.includes('arm')) {
        arch = 'ARM';
    }

    return arch;
}

function detectUserAgent() {
    const userAgent = navigator.userAgent;
    const parser = new UAParser();
    const os = parser.getOS();
    const browser = parser.getBrowser();
    const browserEngine = parser.getEngine();
    const device = parser.getDevice();
    // do not confuse between cpuArchitecture and osArchitecutre
    // These are approximate values calculated; exact values will not present in UA agent for security reasons.
    const cpuArchitecture = parser.getCPU().architecture ? parser.getCPU().architecture : "Unknown";
    const osArchitecture = getArchitectureInfo() ? getArchitectureInfo() : "Unknown";
    let osdetails = `${os.name} ${os.version}`;
    let browserDetails = `${browser.name} ${browser.version}`;
    let architecture = `${cpuArchitecture} ${osArchitecture}`;
    let parserResult = parser.getResult();
    if (os.name === "Windows" && os.version === "10") {
        osdetails = `Windows 10/11`;
    }
    if (!os.name) {
        osdetails = "Unknown OS";
    }
    if (!browser.name) {
        browserDetails = "Unknown";
    }
    if (!cpuArchitecture) {
        architecture == "Unknown"
    }
    device.vendor = device.vendor || "Unknown";
    device.model = device.model || "Unknown";
    if (!device.type) { 
        device.type = "Desktop/Computer";
    }
    browserEngine.name = browserEngine.name || "Unknown";
    browserEngine.version = browserEngine.version || "Unknown";
    // console.log(userAgent);
    // console.log(parser.getResult());
    document.getElementById("os-info").innerText = `${osdetails}`;
    document.getElementById("browser-info").innerText = `${browserDetails}`;
    document.getElementById("cpuarch-info").innerText = `${architecture}`;
    document.getElementById("device-vendor").innerText = `${device.vendor}`;
    document.getElementById("device-model").innerText = `${device.model}`;
    document.getElementById("device-type").innerText = `${device.type}`;
    document.getElementById("browser-engine").innerText = `${browserEngine.name} ${browserEngine.version}`;
    // document.getElementById("device-info").innerHTML = `<strong>Device Vendor:</strong> ${device.vendor}<hr>
    //  <strong>Device Model:</strong> ${device.model}<hr> 
    //  <strong>Device Type:</strong> ${device.type}`;

    // const myos = getOS();
    // document.getElementById("os-info").innerText = myos;

    // Store for raw data
    window._rawData = {
        userAgent: navigator.userAgent,
        nvaigationParser: parserResult
        // os: `${os.name} ${os.version}`,
        // browser: `${browser.name} ${browser.version}`
    };
}

// Load UAParser from CDN
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/UAParser.js/1.0.2/ua-parser.min.js';
script.onload = detectUserAgent;
document.head.appendChild(script);

function getGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(5);
                const lon = position.coords.longitude.toFixed(5);
                document.getElementById("geolocation").innerText = `Latitude: ${lat}, Longitude: ${lon}`;
                window._rawData = {
                    ...window._rawData,
                    location: { latitude: lat, longitude: lon }
                };
                renderMap(lat, lon);
            },
            () => {
                document.getElementById("geolocation").innerText = "Permission denied or unavailable.";
            }
        );
    } else {
        document.getElementById("geolocation").innerText = "Geolocation not supported.";
    }
}

function renderMap(lat, lon) {
    console.log("Rendering map at", lat, lon);
    const map = L.map('map').setView([lat, lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    L.marker([lat, lon]).addTo(map).bindPopup("You are here!").openPopup();
}

function renderMapIp(lat, lon) {
    console.log("Rendering map IP at", lat, lon);
    const map = L.map('map_ip').setView([lat, lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    L.marker([lat, lon]).addTo(map).bindPopup("You are here!").openPopup();
}

function toggleRawData() {
    const rawDataEl = document.getElementById("raw-data");
    if (rawDataEl.classList.contains("hidden")) {
        rawDataEl.textContent = JSON.stringify(window._rawData, null, 2);
        rawDataEl.classList.remove("hidden");
    } else {
        rawDataEl.classList.add("hidden");
    }
}
