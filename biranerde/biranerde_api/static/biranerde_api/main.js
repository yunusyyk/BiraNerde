// Harita oluştur
const map = L.map('map').setView([39.925, 32.866], 6); // Türkiye koordinatları
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Mekanları çek
fetch('/api/mekanlar/')
.then(res => res.json())
.then(data => {
    let mekanlar = data.features;

    // Marker ekle
    mekanlar.forEach(m => {
        const coords = m.geometry.coordinates; // [lon, lat]
        const props = m.properties;
        const marker = L.marker([coords[1], coords[0]]).addTo(map);
        marker.bindPopup(`<b>${props.ad}</b><br>Fiyat: ${props.fiyat_araligi}`);
    });

    // Sidebar listele
    const listEl = document.getElementById('mekan-list');
    function renderList(items) {
        listEl.innerHTML = '';
        items.forEach(m => {
            const li = document.createElement('li');
            li.textContent = `${m.properties.ad} - ${m.properties.fiyat_araligi} - ⭐${m.properties.puan}`;
            li.onclick = () => alert(`${m.properties.ad}\nFiyat: ${m.properties.fiyat_araligi}\nPuan: ${m.properties.puan}`);
            listEl.appendChild(li);
        });
    }

    renderList(mekanlar);

    // Sıralama fonksiyonları
    window.sortPrice = () => {
        const sorted = mekanlar.slice().sort((a,b)=>{
            // ucuzdan pahalıya
            const getPrice = p => {
                if(!p) return 0;
                const match = p.match(/\d+/);
                return match ? parseInt(match[0]) : 0;
            }
            return getPrice(a.properties.fiyat_araligi) - getPrice(b.properties.fiyat_araligi);
        });
        renderList(sorted);
    }

    window.sortPuan = () => {
        const sorted = mekanlar.slice().sort((a,b)=>b.properties.puan - a.properties.puan);
        renderList(sorted);
    }
});
