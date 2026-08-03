// GANTI DENGAN URL WEB APP DARI APPS SCRIPT ANDA
const GAS_URL = "https://script.google.com/macros/s/AKfycbxYzd3uw5h1km_ZbKg7ultOF9INs8Uwo_RrS621c7YgEkkkR9HEG0PYy8cHDtd1_tFm/exec";

// Fetch dan Tampilkan Data ke Tabel
async function loadData() {
    try {
        const response = await fetch(GAS_URL);
        const data = await response.json();
        
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = "";
        
        if (data.status === "success" && data.data.length > 0) {
            data.data.forEach(row => {
                // Mewarnai badge status
                const statusColor = row["Status SH"] === "Terbit SH" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
                
                const tr = document.createElement('tr');
                tr.className = "border-b hover:bg-gray-50 transition";
                tr.innerHTML = `
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
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error("Gagal memuat data:", error);
    }
}

// Handle Form Submit (Pengajuan Awal)
document.getElementById('formPengajuan').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nama = document.getElementById('namaUsaha').value;
    
    // Gunakan URLSearchParams untuk form data
    const formData = new URLSearchParams();
    formData.append('action', 'insert_awal');
    formData.append('nama_usaha', nama);

    try {
        await fetch(GAS_URL, {
            method: 'POST',
            body: formData,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        document.getElementById('namaUsaha').value = '';
        loadData(); // Refresh tabel
        alert('Pengajuan berhasil ditambahkan!');
    } catch (error) {
        alert('Terjadi kesalahan saat mengirim data.');
    }
});

// Panggil fungsi saat halaman dimuat
window.onload = loadData;

function editData(id) {
    // Nantinya fungsi ini bisa memunculkan Modal/Popup 
    // berisi form lengkap dari Nomor Daftar hingga Fee
    alert("Fitur update untuk ID: " + id + " akan membuka form modal.");
}
