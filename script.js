document.addEventListener("DOMContentLoaded", () => {
    
    // 1. BOOT SEQUENCE
    setTimeout(() => {
        document.getElementById("boot-screen").style.opacity = "0";
        setTimeout(() => document.getElementById("boot-screen").style.display = "none", 500);
        initSystem();
    }, 2000);

    function initSystem() {
        initParticles();
        fetchBTC();
        startClock();
        // Cargar datos por defecto
        filterData('ALL', document.querySelector('.filter.active'));
        updateStream();
    }

    // 2. SISTEMA DE TABS
    window.openTab = function(tabName) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('view-' + tabName).classList.add('active-view');
        
        // Match button
        const btns = document.querySelectorAll('.tab-btn');
        if(tabName === 'dashboard') btns[0].classList.add('active');
        if(tabName === 'analytics') btns[1].classList.add('active');
        if(tabName === 'network') btns[2].classList.add('active');
        if(tabName === 'security') btns[3].classList.add('active');
    };

    // 3. NETWORK: SELECCIONAR SERVIDOR
    window.selectServer = function(serverId, element) {
        // Reset visual styles
        document.querySelectorAll('.server-item').forEach(el => el.classList.remove('active-server'));
        document.querySelectorAll('.map-point').forEach(el => el.classList.remove('active-point'));

        // Activar el seleccionado
        element.classList.add('active-server');
        document.getElementById('point-' + serverId).classList.add('active-point');

        // Efecto en header y terminal
        document.getElementById('connection-status').innerText = `CONNECTED: ${element.querySelector('strong').innerText}`;
        document.getElementById('connection-status').style.color = "#00f3ff";
        
        // Log en terminal
        log(`Rerouting traffic to node ${serverId.toUpperCase()}... [SUCCESS]`);
        
        // Actualizar latencia global simulada
        const lat = element.querySelector('small').innerText.match(/Latency: (\d+ms)/)[1];
        document.getElementById('global-latency').innerText = lat;
    };

    // 4. ANALYTICS: FILTRAR TABLA
    window.filterData = function(type, btnElement) {
        // Activar botón visualmente
        document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
        if(btnElement) btnElement.classList.add('active');

        const tbody = document.getElementById("analytics-body");
        tbody.innerHTML = ""; // Limpiar tabla
        
        // Generar datos falsos basados en el filtro
        const count = 8;
        for(let i=0; i<count; i++) {
            let rowType = type === 'ALL' ? getRandomType() : type;
            // Si el filtro es ALL, aleatorio. Si no, forzar el tipo seleccionado.
            
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>0x${Math.random().toString(16).substr(2,6).toUpperCase()}...</td>
                <td>#${Math.floor(Math.random()*9000000)}</td>
                <td>${rowType}</td>
                <td style="color:#00f3ff">${(Math.random()*5).toFixed(4)} ETH</td>
                <td><span style="color:#0f0">CONFIRMED</span></td>
            `;
            // Pequeña animación de entrada
            tr.style.animation = `slideIn 0.3s ease-out ${i * 0.05}s forwards`;
            tr.style.opacity = "0";
            tbody.appendChild(tr);
        }
        if(btnElement) log(`Filtering ledger: Showing ${type} transactions.`);
    };

    function getRandomType() {
        const types = ['MINING', 'TRANSFER', 'CONTRACT', 'SWAP'];
        return types[Math.floor(Math.random() * types.length)];
    }

    // 5. SECURITY SCAN
    window.runScan = function() {
        const logPanel = document.getElementById("security-log");
        const bar = document.getElementById("scan-bar");
        const status = document.getElementById("threat-val");

        logPanel.innerHTML += "<div>> Starting Deep Scan...</div>";
        status.innerText = "SCANNING...";
        status.style.color = "#fa0";

        let w = 0;
        const int = setInterval(() => {
            w++;
            bar.style.width = w + "%";
            
            if(w === 30) logPanel.innerHTML += "<div>> Checking filesystem... [OK]</div>";
            if(w === 60) logPanel.innerHTML += "<div>> Analyzing memory... [OK]</div>";
            if(w === 80) logPanel.innerHTML += "<div>> Verifying signatures... [OK]</div>";
            
            logPanel.scrollTop = logPanel.scrollHeight;

            if(w >= 100) {
                clearInterval(int);
                status.innerText = "SAFE";
                status.style.color = "#0f0";
                logPanel.innerHTML += "<div style='color:#0f0'>> SCAN COMPLETE. NO THREATS.</div>";
                log("Security scan finished. System integrity 100%.");
            }
        }, 50);
    };

    // 6. TERMINAL & UTILS
    const termInput = document.getElementById("cmd-input");
    const termLog = document.getElementById("term-log");

    termInput.addEventListener("keydown", (e) => {
        if(e.key === "Enter") {
            const val = termInput.value.trim().toLowerCase();
            log(`root@nexus:~$ ${val}`, "#fff");
            
            if(val === "help") log("COMMANDS: dashboard, network, scan, clear", "#00f3ff");
            else if(val === "clear") termLog.innerHTML = "";
            else if(val === "scan") { runScan(); openTab('security'); }
            else if(val === "dashboard") openTab('dashboard');
            else if(val === "network") openTab('network');
            else log(`Error: Command '${val}' not found.`, "#f55");
            
            termInput.value = "";
        }
    });

    function log(txt, color="#aaa") {
        const d = document.createElement("div");
        d.style.color = color;
        d.innerText = `> ${txt}`;
        termLog.appendChild(d);
        termLog.scrollTop = termLog.scrollHeight;
    }

    function startClock() {
        setInterval(() => {
            document.getElementById("clock").innerText = new Date().toLocaleTimeString();
        }, 1000);
    }
    
    async function fetchBTC() {
        try {
            const r = await fetch("https://api.coindesk.com/v1/bpi/currentprice.json");
            const d = await r.json();
            document.getElementById("btc-price").innerText = "$" + d.bpi.USD.rate.substring(0,8);
        } catch { document.getElementById("btc-price").innerText = "OFFLINE"; }
    }

    function updateStream() {
        let val = 8.41;
        setInterval(() => {
            val += 0.001;
            document.getElementById("tx-val").innerText = val.toFixed(3) + "M";
            document.getElementById("nodes-val").innerText = 128 + Math.floor(Math.random()*5-2);
        }, 200);
    }

    // Particles
    function initParticles() {
        const c = document.getElementById("bg-canvas");
        const ctx = c.getContext("2d");
        c.width = window.innerWidth; c.height = window.innerHeight;
        const ps = Array.from({length:40}, () => ({x:Math.random()*c.width, y:Math.random()*c.height, vx:(Math.random()-.5), vy:(Math.random()-.5)}));
        function anim() {
            ctx.clearRect(0,0,c.width,c.height);
            ctx.fillStyle = "#00f3ff";
            ps.forEach(p => {
                p.x+=p.vx; p.y+=p.vy;
                if(p.x<0||p.x>c.width) p.vx*=-1;
                if(p.y<0||p.y>c.height) p.vy*=-1;
                ctx.beginPath(); ctx.arc(p.x,p.y,1,0,Math.PI*2); ctx.fill();
            });
            requestAnimationFrame(anim);
        }
        anim();
    }
});