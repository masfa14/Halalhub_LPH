// GANTI DENGAN URL WEB APP TERBARU DARI APPS SCRIPT ANDA
const GAS_URL = "https://script.google.com/macros/s/AKfycbxYzd3uw5h1km_ZbKg7ultOF9INs8Uwo_RrS621c7YgEkkkR9HEG0PYy8cHDtd1_tFm/exec";

// ==========================================
// 1. FUNGSI NAVIGASI MENU (TAB)
// ==========================================
function switchTab(tabId) {
    // Sembunyikan semua konten tab
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    // Tampilkan tab yang dipilih
    document.getElementById('tab-' + tabId).classList.remove('hidden');
}

// ==========================================
// 2. FUNGSI LOAD & TAMPILKAN DATA (READ)
// ==========================================
async function loadData() {
    try {
        const response = await fetch(GAS_URL);
        const data = await response.json();
        
        if (data.status === "success") {
            // Render semua komponen
            renderDashboard(data.pengajuan);
            renderTablePengajuan(data.pengajuan);
            renderTable("table-konsultan", data.konsultan, ["ID Konsultan", "Nama Konsultan"]);
            renderTable("table-auditor", data.auditor, ["ID Auditor", "Nama Auditor"]);
        }
    } catch (error) {
        console.error("Gagal memuat data:", error);
    }
}

function renderDashboard(pengajuanData) {
    const total = pengajuanData.length;
    const selesai = pengajuanData.filter(p => p["Status SH"] === "Terbit SH").length;
    const proses = total - selesai; 

    document.getElementById('count-total').innerText = total;
    document.getElementById('count-proses').innerText = proses;
    document.getElementById('count-selesai').innerText = selesai;
}

function renderTablePengajuan(data) {
    const tbody = document.getElementById('table-pengajuan');
    tbody.innerHTML = "";
    
    if(data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-500">Belum ada data pengajuan</td></tr>`;
        return;
    }

    data.forEach(row => {
        const statusColor = row["Status SH"] === "Terbit SH" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
        tbody.innerHTML += `
            <tr class="border-b hover:bg-gray-50 transition">
                <td class="p-4 font-medium text-gray-900">${row["Nama Pelaku Usaha"]}</td>
                <td class="p-4 text-gray-600">${row["Nomor Daftar"] || '-'}</td>
                <td class="p-4">
                    <span class="px-2 py-1 rounded text-xs font-semibold ${statusColor}">
                        ${row["Status SH"] || 'Draf PU'}
                    </span>
                </td>
                <td class="p-4 text-gray-600">${row["Nama Auditor"] || 'Belum ditugaskan'}</td>
                <td class="p-4">
                    <button onclick="editData('${row["ID Pengajuan"]}')" class="text-blue-600 hover:underline text-sm">Update</button>
                </td>
            </tr>
        `;
    });
}

function renderTable(elementId, data, columns) {
    const tbody = document.getElementById(elementId);
    tbody.innerHTML = "";
    
    if(data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${columns.length}" class="p-4 text-center text-gray-500">Data kosong</td></tr>`;
        return;
    }
    
    data.forEach(row => {
        let tr = "<tr class='border-b hover:bg-gray-50 transition'>";
        columns.forEach(col => tr += `<td class="p-4 text-gray-700">${row[col] || '-'}</td>`);
        tr += "</tr>";
        tbody.innerHTML += tr;
    });
}

// ==========================================
// 3. FUNGSI TAMBAH PENGAJUAN (CREATE)
// ==========================================
// Pastikan id form ini sama dengan yang ada di index.html Anda
const formPengajuan = document.getElementById('formPengajuan');
if (formPengajuan) {
    formPengajuan.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Ambil elemen tombol untuk memberikan efek loading
        const btnSubmit = e.target.querySelector('button[type="submit"]');
        const namaUsaha = document.getElementById('namaUsaha').value;
        
        // Ubah teks tombol saat memproses
        const originalText = btnSubmit.innerText;
        btnSubmit.innerText = "Memproses...";
        btnSubmit.disabled = true;
        
        const formData = new URLSearchParams();
        formData.append('action', 'insert_awal');
        formData.append('nama_usaha', namaUsaha);

        try {
            await fetch(GAS_URL, {
                method: 'POST',
                body: formData,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            
            document.getElementById('namaUsaha').value = '';
            alert('Pengajuan berhasil ditambahkan!');
            
            // Otomatis refresh data di tabel dan dashboard
            loadData(); 
        } catch (error) {
            alert('Terjadi kesalahan saat mengirim data.');
            console.error(error);
        } finally {
            // Kembalikan tombol seperti semula
            btnSubmit.innerText = originalText;
            btnSubmit.disabled = false;
        }
    });
}

// Fungsi dummy untuk tombol update (akan kita buatkan form popup-nya nanti)
function editData(id) {
    alert("Fitur update untuk ID: " + id + " akan membuka form modal/popup. (Fitur sedang disiapkan)");
}

// ==========================================
// 4. JALANKAN SAAT HALAMAN DIBUKA
// ==========================================
window.onload = loadData;
