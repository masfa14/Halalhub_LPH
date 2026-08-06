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
            // Ganti renderTableMaster menjadi renderCardMaster
            renderCardMaster("konsultan", "list-konsultan");
            renderCardMaster("auditor", "list-auditor");
        }
    } catch (error) {
        alert("Gagal memuat data dari server.");
    }
    showLoading(false);
}

function renderDashboard() {
    const pData = globalData.pengajuan;
    const totalPengajuan = pData.length;
    
    // --- 1. MENAMPILKAN TANGGAL HARI INI ---
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const dateToday = new Date().toLocaleDateString('id-ID', options);
    document.getElementById('current-date').innerText = "Today, " + dateToday;

    // --- 2. LOGIKA OVERVIEW ---
    const selesai = pData.filter(p => p["Status SH"] === "Terbit SH").length;
    const batal = pData.filter(p => p["Status SH"] === "Dibatalkan" || p["Status SH"] === "Dikembalikan PU").length;
    // Dalam Proses = Total dikurangi yang sudah Selesai & Batal
    const proses = totalPengajuan - selesai - batal; 

    // --- 3. LOGIKA ALERTS ---
    // Belum Daftar = Nomor daftarnya kosong, strip (-), atau tidak ada nilai sama sekali
    const belumDaftar = pData.filter(p => !p["Nomor Daftar"] || p["Nomor Daftar"].toString().trim() === "" || p["Nomor Daftar"] === "-").length;
    // Draf = Status SH-nya "Draf PU"
    const draf = pData.filter(p => p["Status SH"] === "Draf PU").length;

    // --- 4. MEMASUKKAN NILAI KE HTML ---
    document.getElementById('count-total').innerText = totalPengajuan;
    document.getElementById('count-proses').innerText = proses;
    document.getElementById('count-selesai').innerText = selesai;
    document.getElementById('count-batal').innerText = batal;
    
    document.getElementById('count-belum-daftar').innerText = belumDaftar;
    document.getElementById('count-draf').innerText = draf;
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
        tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-gray-500 py-10">Data tidak ditemukan</td></tr>`;
        return;
    }

    dataList.forEach(row => {
        const colorSH = row["Status SH"] === "Terbit SH" ? "bg-green-100 text-green-700" : (row["Status SH"] === "Draf PU" ? "bg-gray-100 text-gray-600" : "bg-yellow-100 text-yellow-700");
        const colorBayar = row["Status Bayar"] === "Sudah Bayar" ? "text-teal-600 bg-teal-50" : "text-red-600 bg-red-50";
        
        tbody.innerHTML += `
            <tr class="border-b border-gray-100 hover:bg-gray-50 align-middle transition">
                <!-- Info Usaha -->
                <td class="p-4 whitespace-normal break-words">
                    <p class="font-bold text-gray-800 text-[15px] leading-tight mb-1">${row["Nama Pelaku Usaha"]}</p>
                    <p class="text-[11px] text-gray-500 font-mono">No: ${row["Nomor Daftar"] || 'Belum ada'}</p>
                </td>
                
                <!-- Status & Keuangan (Bayar Via dihapus) -->
                <td class="p-4 whitespace-nowrap">
                    <div class="flex flex-col items-start gap-1.5">
                        <span class="px-2.5 py-1 rounded-md text-[11px] font-bold ${colorSH}">${row["Status SH"] || 'Draf PU'}</span>
                        <span class="px-2.5 py-1 rounded-md text-[11px] font-bold ${colorBayar}">${row["Status Bayar"] || 'Belum Bayar'}</span>
                    </div>
                </td>
                
                <!-- Pendamping (Tata letak lebih modern) -->
                <td class="p-4 whitespace-nowrap">
                    <div class="flex flex-col gap-1.5">
                        <p class="text-xs text-gray-700 bg-gray-50/80 px-2 py-1 rounded border border-gray-100"><span class="font-bold text-gray-400 mr-1">K:</span> ${row["Nama Konsultan"] || '-'}</p>
                        <p class="text-xs text-gray-700 bg-gray-50/80 px-2 py-1 rounded border border-gray-100"><span class="font-bold text-gray-400 mr-1">A:</span> ${row["Nama Auditor"] || '-'}</p>
                    </div>
                </td>
                
                <!-- Aksi (Hanya Icon, Teks dihapus) -->
                <td class="p-4 whitespace-nowrap">
                    <div class="flex gap-2">
                        <button onclick="editPengajuan('${row["ID Pengajuan"]}')" class="text-blue-500 hover:bg-blue-50 p-2.5 rounded-xl transition flex items-center justify-center" title="Edit Data">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                        <button onclick="hapusData('delete_pengajuan', '${row["ID Pengajuan"]}')" class="text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition flex items-center justify-center" title="Hapus Data">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function renderCardMaster(type, containerId, dataList = null) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    
    const list = dataList || globalData[type];
    const nameKey = type === 'konsultan' ? 'Nama Konsultan' : 'Nama Auditor';
    const idKey = type === 'konsultan' ? 'ID Konsultan' : 'ID Auditor';
    
    if (list.length === 0) {
        container.innerHTML = `<div class="text-center text-gray-500 py-8 bg-white rounded-3xl border border-dashed border-gray-200">Data tidak ditemukan.</div>`;
        return;
    }

    const completedCounts = {};
    globalData.pengajuan.forEach(p => {
        if (p["Status SH"] === "Terbit SH") {
            const personName = p[nameKey];
            if (personName) completedCounts[personName] = (completedCounts[personName] || 0) + 1;
        }
    });

    list.forEach(row => {
        const id = row[idKey];
        const nama = row[nameKey];
        const totalSelesai = completedCounts[nama] || 0; 
        
        const iconBg = type === 'konsultan' ? 'bg-blue-50 text-blue-500' : 'bg-indigo-50 text-indigo-500';
        const labelText = type === 'konsultan' ? 'Konsultan' : 'Auditor';
        
        // Pemilihan Ikon sesuai menu navigasi bawah
        const svgIcon = type === 'konsultan' 
            ? `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>`
            : `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>`;

        container.innerHTML += `
            <div class="bg-white rounded-[1.5rem] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col md:flex-row gap-4 transition hover:shadow-md relative">
                <div class="absolute top-4 right-4 text-gray-300 hidden md:block">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                </div>

                <div class="flex items-center gap-4 flex-1">
                    <div class="w-[70px] h-[70px] rounded-[1.2rem] ${iconBg} flex items-center justify-center shrink-0 cursor-pointer" onclick="viewRiwayat('${type}', '${id}', '${nama}')">
                        ${svgIcon}
                    </div>
                    
                    <div class="flex-1 cursor-pointer" onclick="viewRiwayat('${type}', '${id}', '${nama}')">
                        <h3 class="font-bold text-gray-800 text-[16px] mb-0.5 leading-tight pr-6 md:pr-0">${nama}</h3>
                        <div class="flex items-center text-[11px] text-gray-500 mb-2 gap-2"><span class="font-medium">${labelText}</span><span class="w-0.5 h-3 bg-gray-300"></span><span>ID: ${id}</span></div>
                        <div class="flex items-center text-[12px] font-semibold text-gray-700">
                            <svg class="w-4 h-4 text-yellow-400 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                            <span>${totalSelesai} <span class="text-gray-400 font-normal">(PU Diselesaikan)</span></span>
                        </div>
                    </div>
                </div>

                <div class="flex flex-row md:flex-col gap-2 md:border-l border-gray-100 md:pl-3 pt-3 md:pt-0 border-t md:border-t-0 justify-end md:justify-center">
                    <button onclick="openModalMaster('${type}', 'update', '${id}', '${nama}')" class="text-blue-500 hover:bg-blue-50 p-2 rounded-xl transition flex items-center justify-center gap-1 text-xs font-bold" title="Edit">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg> <span class="md:hidden">Edit</span>
                    </button>
                    <button onclick="hapusData('delete_${type}', '${id}')" class="text-red-500 hover:bg-red-50 p-2 rounded-xl transition flex items-center justify-center gap-1 text-xs font-bold" title="Hapus">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> <span class="md:hidden">Hapus</span>
                    </button>
                </div>
            </div>
        `;
    });
}

// FUNGSI SEARCH (Untuk mencari nama konsultan / auditor)
function cariMaster(type) {
    const inputId = type === 'konsultan' ? 'searchKonsultan' : 'searchAuditor';
    const containerId = type === 'konsultan' ? 'list-konsultan' : 'list-auditor';
    const nameKey = type === 'konsultan' ? 'Nama Konsultan' : 'Nama Auditor';
    
    const keyword = document.getElementById(inputId).value.toLowerCase();
    const filteredData = globalData[type].filter(row => 
        row[nameKey].toLowerCase().includes(keyword)
    );
    
    renderCardMaster(type, containerId, filteredData);
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

// FUNGSI AUTO-FILL ID BERDASARKAN NAMA YANG DIPILIH
function autoFillKonsultan() {
    const select = document.getElementById('u_namaKonsultan');
    const selectedOption = select.options[select.selectedIndex];
    document.getElementById('u_idKonsultan').value = selectedOption.getAttribute('data-id') || '';
}

function autoFillAuditor() {
    const select = document.getElementById('u_namaAuditor');
    const selectedOption = select.options[select.selectedIndex];
    document.getElementById('u_idAuditor').value = selectedOption.getAttribute('data-id') || '';
}

function editPengajuan(id) {
    const data = globalData.pengajuan.find(p => p["ID Pengajuan"] === id);
    if (!data) return;
    
    // 1. Muat data ke Dropdown Nama Konsultan
    const selKonsultan = document.getElementById('u_namaKonsultan');
    selKonsultan.innerHTML = '<option value="" data-id="">-- Pilih Konsultan --</option>';
    globalData.konsultan.forEach(k => {
        selKonsultan.innerHTML += `<option value="${k["Nama Konsultan"]}" data-id="${k["ID Konsultan"]}">${k["Nama Konsultan"]}</option>`;
    });

    // 2. Muat data ke Dropdown Nama Auditor
    const selAuditor = document.getElementById('u_namaAuditor');
    selAuditor.innerHTML = '<option value="" data-id="">-- Pilih Auditor --</option>';
    globalData.auditor.forEach(a => {
        selAuditor.innerHTML += `<option value="${a["Nama Auditor"]}" data-id="${a["ID Auditor"]}">${a["Nama Auditor"]}</option>`;
    });

    // 3. Isi nilai form dengan data yang sudah ada sebelumnya
    document.getElementById('u_idPengajuan').value = id;
    document.getElementById('u_namaUsaha').innerText = "- " + data["Nama Pelaku Usaha"];
    document.getElementById('u_editNamaUsaha').value = data["Nama Pelaku Usaha"]; // Tambahkan baris ini
    document.getElementById('u_noDaftar').value = data["Nomor Daftar"] || '';
    document.getElementById('u_statusSH').value = data["Status SH"] || 'Draf PU';
    document.getElementById('u_bayarVia').value = data["Bayar Via"] || 'SiHalal';
    document.getElementById('u_statusBayar').value = data["Status Bayar"] || 'Belum Bayar';
    document.getElementById('u_keterangan').value = data["Keterangan"] || '';
    document.getElementById('u_fee').value = data["Fee"] || 'Belum Bayar';
        // Set nilai untuk dropdown dan text ID-nya
    document.getElementById('u_namaKonsultan').value = data["Nama Konsultan"] || '';
    document.getElementById('u_idKonsultan').value = data["ID Konsultan"] || '';
    document.getElementById('u_namaAuditor').value = data["Nama Auditor"] || '';
    document.getElementById('u_idAuditor').value = data["ID Auditor"] || '';
    
    document.getElementById('modal-pengajuan').classList.remove('hidden');
}

document.getElementById('formUpdatePengajuan').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new URLSearchParams();
    fd.append('action', 'update_pengajuan');
    fd.append('id', document.getElementById('u_idPengajuan').value);
    fd.append('nama', document.getElementById('u_editNamaUsaha').value); // Tambahkan baris ini
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

// SOLUSI: MEMBUAT ID MENJADI 5 DIGIT ANGKA
function openModalMaster(type, action, id = '', nama = '') {
    document.getElementById('master-title').innerText = action === 'add' ? `Tambah ${type}` : `Edit ${type}`;
    document.getElementById('m_type').value = type;
    document.getElementById('m_action').value = action === 'add' ? `create_${type}` : `update_${type}`;
    
    if (action === 'add') {
        const prefix = type === 'konsultan' ? 'KON-' : 'AUD-';
        // Generate angka acak 5 digit (antara 10000 - 99999)
        const random5Digit = Math.floor(10000 + Math.random() * 90000);
        document.getElementById('m_id').value = prefix + random5Digit;
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

// FUNGSI UNTUK MENAMPILKAN RIWAYAT KONSULTAN / AUDITOR
function viewRiwayat(type, id, nama) {
    document.getElementById('r_namaMaster').innerText = nama;
    const tbody = document.getElementById('table-riwayat');
    tbody.innerHTML = "";
    
    // Filter data pengajuan untuk mencari nama usaha berdasarkan ID Konsultan/Auditor
    const filterKey = type === 'konsultan' ? 'ID Konsultan' : 'ID Auditor';
    const riwayatData = globalData.pengajuan.filter(p => p[filterKey] === id);
    
    if (riwayatData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-gray-500">Belum ada riwayat pendampingan</td></tr>`;
    } else {
        riwayatData.forEach(row => {
            const color = row["Status SH"] === "Terbit SH" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700";
            tbody.innerHTML += `
                <tr class="border-b border-gray-100 hover:bg-gray-50">
                    <td class="p-3 text-sm text-gray-600">${row["Nomor Daftar"] || '-'}</td>
                    <td class="p-3 font-semibold text-gray-800">${row["Nama Pelaku Usaha"]}</td>
                    <td class="p-3"><span class="px-2 py-1 rounded-full text-xs font-semibold ${color}">${row["Status SH"] || 'Draf PU'}</span></td>
                    <td class="p-3">
                        <button onclick="viewDetailPengajuan('${row["ID Pengajuan"]}')" class="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full">Detail Usaha</button>
                    </td>
                </tr>
            `;
        });
    }
    
    document.getElementById('modal-riwayat').classList.remove('hidden');
}

// FUNGSI UNTUK MELIHAT DETAIL PENGAJUAN (VIEW ONLY) DARI RIWAYAT
function viewDetailPengajuan(id) {
    const data = globalData.pengajuan.find(p => p["ID Pengajuan"] === id);
    if (!data) return;
    
    const content = document.getElementById('view-pengajuan-content');
    content.innerHTML = `
        <div class="grid grid-cols-2 border-b py-2"><span class="text-gray-500">ID Pengajuan</span><span class="font-medium text-right">${data["ID Pengajuan"]}</span></div>
        <div class="grid grid-cols-2 border-b py-2"><span class="text-gray-500">Nama Usaha</span><span class="font-medium text-right text-green-700">${data["Nama Pelaku Usaha"]}</span></div>
        <div class="grid grid-cols-2 border-b py-2"><span class="text-gray-500">Nomor Daftar</span><span class="font-medium text-right">${data["Nomor Daftar"] || '-'}</span></div>
        <div class="grid grid-cols-2 border-b py-2"><span class="text-gray-500">Status SH</span><span class="font-medium text-right">${data["Status SH"] || '-'}</span></div>
        <div class="grid grid-cols-2 border-b py-2"><span class="text-gray-500">Konsultan</span><span class="font-medium text-right">${data["Nama Konsultan"] || '-'}</span></div>
        <div class="grid grid-cols-2 border-b py-2"><span class="text-gray-500">Auditor</span><span class="font-medium text-right">${data["Nama Auditor"] || '-'}</span></div>
        <div class="grid grid-cols-2 border-b py-2"><span class="text-gray-500">Bayar Via</span><span class="font-medium text-right">${data["Bayar Via"] || '-'}</span></div>
        <div class="grid grid-cols-2 border-b py-2"><span class="text-gray-500">Status Bayar</span><span class="font-medium text-right">${data["Status Bayar"] || '-'}</span></div>
        <div class="grid grid-cols-2 border-b py-2"><span class="text-gray-500">Fee</span><span class="font-medium text-right">${data["Fee"] || '-'}</span></div>
        <div class="grid grid-cols-2 pt-2"><span class="text-gray-500">Keterangan</span><span class="font-medium text-right">${data["Keterangan"] || '-'}</span></div>
    `;
    
    document.getElementById('modal-view-pengajuan').classList.remove('hidden');
}

window.onload = loadData;
