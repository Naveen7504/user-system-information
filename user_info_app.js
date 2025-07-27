window.onload = () => {
    updateScreenInfo();
    updateWindowInfo();
    detectUserAgent();
    getIpAddress();
    getGeolocation();
};

window.onresize = updateScreenInfo;

function updateScreenInfo() {
    const screenInfo = `Screen: ${screen.width} x ${screen.height}`;
    // Window: ${window.innerWidth} x ${window.innerHeight}`;
    document.getElementById("screen-info").innerText = screenInfo;
}

function updateWindowInfo() {
    const screenInfo = `Window: ${window.innerWidth} x ${window.innerHeight}`;
    document.getElementById("window-info").innerText = screenInfo;
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
    // do not confuse between cpuArchitecture and osArchitecutre
    // These are approximate values calculated; exact values will not present in UA agent for security reasons.
    const cpuArchitecture = parser.getCPU().architecture;
    const osArchitecture = getArchitectureInfo();
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
        browserDetails = "Unknown Browser";
    }
    if (!cpuArchitecture) {
        architecture == "Unknown Architecture"
    }
    // console.log(userAgent);
    // console.log(parser.getResult());
    document.getElementById("os-info").innerText = `${osdetails}`;
    document.getElementById("browser-info").innerText = `${browserDetails}`;
    document.getElementById("cpuarch-info").innerText = `${architecture}`;

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
    const map = L.map('map').setView([lat, lon], 13);
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
