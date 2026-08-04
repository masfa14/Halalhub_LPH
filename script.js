// GANTI DENGAN URL WEB APP TERBARU ANDA (Setelah deploy ulang)
const GAS_URL = "https://script.google.com/macros/s/AKfycbwzPuEeO-CVoha2cmzS8txqw5o7rPYy6CxUboifSlY2m7DtMZQFuGsqCaLOYRqfaEq-/exec";

let globalData = { pengajuan: [], konsultan: [], auditor: [] };

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

function switchTab(tabId, clickedBtn = null) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById('tab-' + tabId).classList.remove('hidden');
    
    if (clickedBtn) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('text-green-700');
            btn.classList.add('text-gray-400');
        });
        clickedBtn.classList.remove('text-gray-400');
        clickedBtn.classList.add('text-green-700');
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// LOGIKA BUAT ID UNIK & BUKA MODAL TAMBAH PENGAJUAN
function openModalTambah() {
    const uniqueId = "REQ-" + new Date().getTime();
    document.getElementById('idPengajuanBaru').value = uniqueId;
    document.getElementById('namaUsahaBaru').value = '';
    document.getElementById('modal-tambah-pengajuan').classList.remove('hidden');
}

async function loadData() {
    showLoading(true);
    try {
        const response = await fetch(GAS_URL);
        const data = await response.json();
        
        if (data.status === "success") {
            globalData = data;
            renderDashboard();
            renderTablePengajuan(); // Merender seluruh data pengajuan
            renderTableMaster("konsultan", "table-konsultan", ["ID Konsultan", "Nama Konsultan"]);
            renderTableMaster("auditor", "table-auditor", ["ID Auditor", "Nama Auditor"]);
        }
    } catch (error) {
        alert("Gagal memuat data dari server.");
    }
    showLoading(false);
}

function renderDashboard() {
    const data = globalData.pengajuan;
    const selesai = data.filter(p => p["Status SH"] === "Terbit SH").length;
    document.getElementById('count-total').innerText = data.length;
    document.getElementById('count-selesai').innerText = selesai;
    document.getElementById('count-proses').innerText = data.length - selesai;
}

// FUNGSI SEARCH (PENCARIAN NAMA USAHA)
function cariPengajuan() {
    const keyword = document.getElementById('searchPengajuan').value.toLowerCase();
    const filteredData = globalData.pengajuan.filter(row => 
        row["Nama Pelaku Usaha"].toLowerCase().includes(keyword)
    );
    renderTablePengajuan(filteredData);
}

// RENDER TABEL PENGAJUAN DENGAN PARAMETER FLEKSIBEL (Untuk Search)
function renderTablePengajuan(dataList = globalData.pengajuan) {
    const tbody = document.getElementById('table-pengajuan');
    tbody.innerHTML = "";
    
    if (dataList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-gray-500">Data tidak ditemukan</td></tr>`;
        return;
    }

    dataList.forEach(row => {
        const color = row["Status SH"] === "Terbit SH" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700";
        tbody.innerHTML += `
            <tr class="border-b border-gray-100 hover:bg-gray-50 text-sm md:text-base">
                <td class="p-3 md:p-4 whitespace-nowrap">
                    <p class="font-bold text-gray-800">${row["Nama Pelaku Usaha"]}</p>
                    <p class="text-xs text-gray-500">${row["Nomor Daftar"] || 'Belum ada No Daftar'}</p>
                </td>
                <td class="p-3 md:p-4 whitespace-nowrap"><span class="px-2 py-1 rounded-full text-xs font-semibold ${color}">${row["Status SH"] || 'Draf PU'}</span></td>
                <td class="p-3 md:p-4 whitespace-nowrap text-gray-600">${row["Nama Auditor"] || '-'}</td>
                <td class="p-3 md:p-4 whitespace-nowrap flex gap-3">
                    <button onclick="editPengajuan('${row["ID Pengajuan"]}')" class="text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full">Edit</button>
                    <button onclick="hapusData('delete_pengajuan', '${row["ID Pengajuan"]}')" class="text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full">Hapus</button>
                </td>
            </tr>
        `;
    });
}

function renderTableMaster(type, elementId, columns) {
    const tbody = document.getElementById(elementId);
    tbody.innerHTML = `<thead><tr class="text-gray-500 text-sm border-b"><th class="p-3 md:p-4 font-medium whitespace-nowrap">ID</th><th class="p-3 md:p-4 font-medium whitespace-nowrap">Nama</th><th class="p-3 md:p-4 font-medium w-32 whitespace-nowrap">Aksi</th></tr></thead>`;
    globalData[type].forEach(row => {
        const id = row[columns[0]];
        const nama = row[columns[1]];
        tbody.innerHTML += `
            <tr class="border-b border-gray-100 hover:bg-gray-50 text-sm md:text-base">
                <td class="p-3 md:p-4 whitespace-nowrap text-gray-600">${id}</td>
                <td class="p-3 md:p-4 whitespace-nowrap font-semibold text-gray-800">${nama}</td>
                <td class="p-3 md:p-4 whitespace-nowrap flex gap-2">
                    <button onclick="openModalMaster('${type}', 'update', '${id}', '${nama}')" class="text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full">Edit</button>
                    <button onclick="hapusData('delete_${type}', '${id}')" class="text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full">Hapus</button>
                </td>
            </tr>
        `;
    });
}

async function sendAction(formData) {
    showLoading(true);
    try {
        await fetch(GAS_URL, {
            method: 'POST',
            body: formData,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        await loadData();
    } catch (e) { alert("Terjadi kesalahan sistem"); }
    showLoading(false);
}

function hapusData(action, id) {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
        const fd = new URLSearchParams();
        fd.append('action', action);
        fd.append('id', id);
        sendAction(fd);
    }
}

// PERBAIKAN FORM SUBMIT PENGAJUAN BARU
document.getElementById('formPengajuanBaru').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new URLSearchParams();
    fd.append('action', 'create_pengajuan');
    fd.append('id', document.getElementById('idPengajuanBaru').value); // Kirim ID
    fd.append('nama', document.getElementById('namaUsahaBaru').value);
    sendAction(fd);
    closeModal('modal-tambah-pengajuan');
    e.target.reset();
});

function editPengajuan(id) {
    const data = globalData.pengajuan.find(p => p["ID Pengajuan"] === id);
    if (!data) return;
    
    document.getElementById('u_idPengajuan').value = id;
    document.getElementById('u_namaUsaha').innerText = "- " + data["Nama Pelaku Usaha"];
    document.getElementById('u_noDaftar').value = data["Nomor Daftar"] || '';
    document.getElementById('u_statusSH').value = data["Status SH"] || 'Draf PU';
    document.getElementById('u_bayarVia').value = data["Bayar Via"] || 'SiHalal';
    document.getElementById('u_statusBayar').value = data["Status Bayar"] || 'Belum Bayar';
    document.getElementById('u_idKonsultan').value = data["ID Konsultan"] || '';
    document.getElementById('u_namaKonsultan').value = data["Nama Konsultan"] || '';
    document.getElementById('u_idAuditor').value = data["ID Auditor"] || '';
    document.getElementById('u_namaAuditor').value = data["Nama Auditor"] || '';
    document.getElementById('u_keterangan').value = data["Keterangan"] || '';
    document.getElementById('u_fee').value = data["Fee"] || 'Belum Bayar';
    
    document.getElementById('modal-pengajuan').classList.remove('hidden');
}

document.getElementById('formUpdatePengajuan').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new URLSearchParams();
    fd.append('action', 'update_pengajuan');
    fd.append('id', document.getElementById('u_idPengajuan').value);
    fd.append('no_daftar', document.getElementById('u_noDaftar').value);
    fd.append('status_sh', document.getElementById('u_statusSH').value);
    fd.append('bayar_via', document.getElementById('u_bayarVia').value);
    fd.append('status_bayar', document.getElementById('u_statusBayar').value);
    fd.append('id_konsultan', document.getElementById('u_idKonsultan').value);
    fd.append('nama_konsultan', document.getElementById('u_namaKonsultan').value);
    fd.append('id_auditor', document.getElementById('u_idAuditor').value);
    fd.append('nama_auditor', document.getElementById('u_namaAuditor').value);
    fd.append('keterangan', document.getElementById('u_keterangan').value);
    fd.append('fee', document.getElementById('u_fee').value);
    
    sendAction(fd);
    closeModal('modal-pengajuan');
});

// LOGIKA OTOMATIS ID UNTUK KONSULTAN & AUDITOR
function openModalMaster(type, action, id = '', nama = '') {
    document.getElementById('master-title').innerText = action === 'add' ? `Tambah ${type}` : `Edit ${type}`;
    document.getElementById('m_type').value = type;
    document.getElementById('m_action').value = action === 'add' ? `create_${type}` : `update_${type}`;
    
    // Otomatis generate ID Unik jika action-nya Add
    if (action === 'add') {
        const prefix = type === 'konsultan' ? 'KON-' : 'AUD-';
        document.getElementById('m_id').value = prefix + new Date().getTime();
    } else {
        document.getElementById('m_id').value = id;
    }
    
    document.getElementById('m_nama').value = nama;
    document.getElementById('modal-master').classList.remove('hidden');
}

document.getElementById('formMaster').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new URLSearchParams();
    fd.append('action', document.getElementById('m_action').value);
    fd.append('id', document.getElementById('m_id').value); // Akan mengirim ID yang di-generate
    fd.append('nama', document.getElementById('m_nama').value);
    
    sendAction(fd);
    closeModal('modal-master');
});

window.onload = loadData;
