// --- script.js: Logic Utama Toko Buku Online (FINAL CODE) ---

// --- Data & Konstanta Global ---
const LOGIN_KEY = 'isLoggedIn'; 

// --- Fungsi Umum ---

function getGreeting() {
    const jam = new Date().getHours();
    if (jam >= 4 && jam < 11) {
        return "Selamat Pagi 🌤️";
    } else if (jam >= 11 && jam < 15) {
        return "Selamat Siang ☀️";
    } else if (jam >= 15 && jam < 18) {
        return "Selamat Sore 🌥️";
    } else {
        return "Selamat Malam 🌙";
    }
}

function formatRupiah(angka) {
    const formatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    });
    return formatter.format(angka);
}

function parseRupiah(rupiahString) {
    const cleaned = rupiahString.replace(/[^0-9]/g, '');
    return parseInt(cleaned, 10) || 0;
}

function loadInitialData() {
    // Load Data Katalog
    const storedKatalog = localStorage.getItem('dataKatalogBuku');
    if (storedKatalog && storedKatalog !== 'undefined') {
        dataKatalogBuku = JSON.parse(storedKatalog);
    } 
    
    // Load Data Riwayat Order
    const storedRiwayat = localStorage.getItem('dataRiwayatOrder');
    if (storedRiwayat && storedRiwayat !== 'undefined') {
        dataRiwayatOrder = JSON.parse(storedRiwayat);
    } 
}

function saveKatalogToLocalStorage() {
    localStorage.setItem('dataKatalogBuku', JSON.stringify(dataKatalogBuku));
}

function saveRiwayatToLocalStorage() {
    localStorage.setItem('dataRiwayatOrder', JSON.stringify(dataRiwayatOrder));
}


// --- FUNGSI LOGIN & AUTENTIKASI ---

function checkLoginStatus() {
    const isLoggedIn = sessionStorage.getItem(LOGIN_KEY) === 'true';

    const restrictedPages = ['dashboard', 'stok', 'checkout', 'riwayat', 'tracking'];
    const currentPageId = document.body.id;

    if (restrictedPages.includes(currentPageId) && !isLoggedIn) {
        if (currentPageId !== 'loginPage') { 
            alert('Anda harus login terlebih dahulu!');
            window.location.href = 'index.html';
        }
    }
    
    if (currentPageId === 'loginPage' && isLoggedIn) {
        window.location.href = 'dashboard.html';
    }
}

function handleLogin(event) {
    event.preventDefault(); 
    
    // 🔥 Menggunakan ID 'username' dan 'password' dari index.html
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const errorMessage = document.getElementById('loginError');

    // Kosongkan pesan error sebelumnya
    errorMessage.style.display = 'none';

    // 🔥 Cek kredensial menggunakan userCredentials dari data.js
    if (usernameInput === userCredentials.username && passwordInput === userCredentials.password) {
        // Login Berhasil
        sessionStorage.setItem(LOGIN_KEY, 'true');
        alert('Login Berhasil! Selamat datang, Admin!');
        window.location.href = 'dashboard.html'; // PENGALIHAN KE DASHBOARD
    } else {
        // Login Gagal
        errorMessage.textContent = '❌ Username atau Password salah.';
        errorMessage.style.display = 'block';
    }
}

function handleLogout() {
    sessionStorage.removeItem(LOGIN_KEY);
    alert('Anda telah Logout.');
    window.location.href = 'index.html';
}


// --- Halaman Stok (CRUD) ---
let bukuModal; 

function renderKatalog() {
    const container = document.getElementById('katalogContainer');
    const emptyMessage = document.getElementById('emptyMessage');
    
    if (!container || typeof dataKatalogBuku === 'undefined') return;

    container.innerHTML = ''; 
    
    if (dataKatalogBuku.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    } else {
        emptyMessage.style.display = 'none';
    }

    dataKatalogBuku.forEach((buku, index) => {
        const cardHtml = `
            <div class="col">
                <div class="card h-100 shadow-sm">
                    <img src="${buku.cover}" class="card-img-top" alt="Cover ${buku.namaBarang}" style="height: 200px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${buku.namaBarang}</h5>
                        <p class="card-text small mb-1">
                            Kode: <strong>${buku.kodeBarang}</strong> | Edisi: ${buku.edisi}
                        </p>
                        <p class="card-text mb-2">
                            Jenis: ${buku.jenisBarang}
                        </p>
                        
                        <div class="mt-auto">
                            <h4 class="text-primary">${buku.harga}</h4>
                            <p class="text-success fw-bold">Stok Tersedia: ${buku.stok}</p>
                            
                            <div class="btn-group w-100" role="group">
                                <button class="btn btn-sm btn-warning" onclick="openBukuModal(${index})">✏️ Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="hapusBuku(${index})">🗑️ Hapus</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cardHtml;
    });
}

function openBukuModal(index = null) {
    const modalTitle = document.getElementById('bukuModalLabel');
    const form = document.getElementById('bukuForm');

    form.reset();
    document.getElementById('bukuIndex').value = '';
    
    if (index === null) {
        modalTitle.textContent = '➕ Tambah Buku Baru';
        document.getElementById('edisi').value = 1;
        document.getElementById('stok').value = 1;
        document.getElementById('cover').value = 'img/default.jpg'; 

    } else {
        modalTitle.textContent = '✏️ Edit Data Buku';
        
        const buku = dataKatalogBuku[index];
        
        document.getElementById('bukuIndex').value = index;
        document.getElementById('namaBarang').value = buku.namaBarang;
        document.getElementById('edisi').value = buku.edisi;
        document.getElementById('jenisBarang').value = buku.jenisBarang;
        document.getElementById('harga').value = buku.harga;
        buku.stok = typeof buku.stok === 'number' ? buku.stok : 0; // Pastikan stok adalah angka
        document.getElementById('stok').value = buku.stok;
        document.getElementById('cover').value = buku.cover;
    }
    
    bukuModal.show(); 
}

function saveBukuData(event) {
    event.preventDefault(); 
    
    const index = document.getElementById('bukuIndex').value;
    const namaBarang = document.getElementById('namaBarang').value;
    const edisi = document.getElementById('edisi').value;
    const jenisBarang = document.getElementById('jenisBarang').value;
    const harga = document.getElementById('harga').value;
    const stok = parseInt(document.getElementById('stok').value, 10);
    const cover = document.getElementById('cover').value;

    if (index === '') {
        const newKode = `NEW${(new Date()).getTime()}`; 
        const newBuku = { kodeBarang: newKode, namaBarang, jenisBarang, edisi, stok, harga, cover };
        dataKatalogBuku.push(newBuku);
        alert(`✅ Buku "${namaBarang}" berhasil ditambahkan!`);
    } else {
        const buku = dataKatalogBuku[parseInt(index, 10)];
        buku.namaBarang = namaBarang;
        buku.edisi = edisi;
        buku.jenisBarang = jenisBarang;
        buku.harga = harga;
        buku.stok = stok;
        buku.cover = cover;
        alert(`✏️ Buku "${namaBarang}" berhasil diupdate!`);
    }

    saveKatalogToLocalStorage(); 
    bukuModal.hide();
    renderKatalog(); 
}

function hapusBuku(index) {
    const namaBuku = dataKatalogBuku[index].namaBarang;
    const konfirmasi = confirm(`Yakin ingin menghapus buku "${namaBuku}" dari katalog?`);

    if (konfirmasi) {
        dataKatalogBuku.splice(index, 1);
        saveKatalogToLocalStorage(); 
        renderKatalog(); 
        alert(`🗑️ Buku "${namaBuku}" berhasil dihapus.`);
    }
}


// --- FUNGSI CHECKOUT ---

function populateBookDropdowns(container) {
    const selectElements = container.querySelectorAll('.item-select');
    
    selectElements.forEach(select => {
        select.innerHTML = '<option value="" data-harga="0">-- Pilih Buku --</option>';

        dataKatalogBuku.forEach(buku => {
            const cleanPrice = parseRupiah(buku.harga);
            const option = document.createElement('option');
            option.value = buku.namaBarang;
            option.textContent = `${buku.namaBarang} (${buku.stok} stok)`;
            option.setAttribute('data-harga', cleanPrice);
            select.appendChild(option);
        });
        
        select.addEventListener('change', updatePriceDisplay);
    });
}

function updatePriceDisplay(event) {
    const select = event.target;
    const selectedOption = select.options[select.selectedIndex];
    
    const row = select.closest('.order-item');
    const priceDisplay = row.querySelector('.item-harga-display');
    const priceInput = row.querySelector('.item-harga');
    
    const rawPrice = selectedOption.getAttribute('data-harga');
    
    priceDisplay.value = formatRupiah(parseInt(rawPrice, 10));
    priceInput.value = rawPrice; 
}

function addNewOrderItem() {
    const container = document.getElementById('orderItemsContainer');
    const newItemHtml = `
        <div class="row g-2 mb-3 border p-2 rounded order-item">
            <div class="col-md-6">
                <label class="form-label">Nama Buku</label>
                <select class="form-select item-select" required>
                    <option value="" data-harga="0">-- Pilih Buku --</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label">Harga Satuan</label>
                <input type="text" class="form-control item-harga-display" value="Rp 0" readonly>
                <input type="hidden" class="item-harga" value="0"> 
            </div>
            <div class="col-md-2">
                <label class="form-label">Qty</label>
                <input type="number" class="form-control item-qty" value="1" min="1" required>
            </div>
            <div class="col-md-1 d-flex align-items-end">
                <button type="button" class="btn btn-danger btn-sm w-100 remove-item" onclick="this.closest('.order-item').remove()" style="height: 38px;">X</button>
            </div>
        </div>
    `;
    const parser = new DOMParser();
    const doc = parser.parseFromString(newItemHtml, 'text/html');
    const newElement = doc.body.firstChild;

    container.appendChild(newElement);

    populateBookDropdowns(newElement); 
    
    newElement.querySelector('.item-harga-display').value = formatRupiah(0);
    newElement.querySelector('.item-harga').value = 0;
}

function generateNomorDO() {
    const now = new Date();
    const datePart = now.getFullYear().toString() + 
                     (now.getMonth() + 1).toString().padStart(2, '0') + 
                     now.getDate().toString().padStart(2, '0');
    const seq = (dataRiwayatOrder.length + 1).toString().padStart(4, '0');
    return datePart + seq;
}


function handleCheckoutSubmit(event) {
    event.preventDefault();

    const orderItems = [];
    let grandTotal = 0;
    
    const itemElements = document.querySelectorAll('#orderItemsContainer .order-item');
    
    itemElements.forEach(itemEl => {
        const selectElement = itemEl.querySelector('.item-select');
        const nama = selectElement.value; 
        const harga = parseInt(itemEl.querySelector('.item-harga').value, 10); 
        const qty = parseInt(itemEl.querySelector('.item-qty').value, 10);
        
        if (nama && harga > 0 && qty > 0) {
            const subtotal = harga * qty;
            grandTotal += subtotal;
            orderItems.push({
                namaBuku: nama,
                hargaSatuan: harga,
                qty: qty,
                subtotal: subtotal
            });
            
            const bukuIndex = dataKatalogBuku.findIndex(b => b.namaBarang === nama);
            if (bukuIndex !== -1 && dataKatalogBuku[bukuIndex].stok >= qty) {
                 dataKatalogBuku[bukuIndex].stok -= qty;
            } else if (bukuIndex !== -1 && dataKatalogBuku[bukuIndex].stok < qty) {
                 console.warn(`Peringatan: Stok buku "${nama}" sudah habis/minus.`);
            }
        }
    });

    if (orderItems.length === 0) {
        alert("Mohon pilih setidaknya satu buku dan masukkan kuantitas yang valid.");
        return;
    }

    const namaLengkap = document.getElementById('namaLengkap').value;
    const alamatPengiriman = document.getElementById('alamatPengiriman').value;

    const nomorDO = generateNomorDO();
    
    const newOrder = {
        nomorDO: nomorDO,
        tanggalPesan: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
        namaPenerima: namaLengkap,
        alamat: alamatPengiriman,
        items: orderItems,
        totalPembayaran: grandTotal,
        status: "Dikirim", 
        perjalanan: [{
            waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            keterangan: `Pesanan baru dibuat dengan Nomor DO ${nomorDO}. Paket sedang disiapkan.`
        },
        {
            waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            keterangan: `Pesanan telah dikirim dan dalam perjalanan menuju alamat Anda.`
        }]
    };
    
    dataRiwayatOrder.push(newOrder);
    saveRiwayatToLocalStorage();
    saveKatalogToLocalStorage(); 
    
    alert(`✅ Pesanan baru berhasil ditambahkan! Nomor DO Anda: ${nomorDO}. Silakan cek Riwayat Pesanan.`);
    
    window.location.href = 'riwayat.html';
}


// --- FUNGSI RIWAYAT & TRACKING ---

function markOrderAsCompleted(nomorDO) {
    const orderIndex = dataRiwayatOrder.findIndex(order => order.nomorDO === nomorDO);
    
    if (orderIndex !== -1) {
        const order = dataRiwayatOrder[orderIndex];

        if (order.status === 'Selesai') {
            alert(`Pesanan ${nomorDO} sudah ditandai Selesai sebelumnya.`);
            return;
        }

        order.status = "Selesai";
        
        const now = new Date();
        const waktuSelesai = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        
        order.perjalanan.push({
            waktu: waktuSelesai,
            keterangan: "Pesanan telah **Sampai** dan diterima oleh pelanggan. Transaksi Selesai. (100%)"
        });
        
        saveRiwayatToLocalStorage();
        
        alert(`🎉 Pesanan ${nomorDO} telah berhasil ditandai sebagai Selesai.`);
        
        renderRiwayatOrders();

    } else {
        alert("Nomor DO tidak ditemukan.");
    }
}

function hapusOrder(nomorDO) {
    const orderIndex = dataRiwayatOrder.findIndex(order => order.nomorDO === nomorDO);
    
    if (orderIndex === -1) {
        alert("Nomor DO tidak ditemukan.");
        return;
    }
    
    const order = dataRiwayatOrder[orderIndex];
    
    const konfirmasi = confirm(`Yakin ingin menghapus pesanan ${nomorDO}? Stok buku akan dikembalikan.`);
    
    if (konfirmasi) {
        // 1. Kembalikan Stok
        order.items.forEach(item => {
            const bukuIndex = dataKatalogBuku.findIndex(b => b.namaBarang === item.namaBuku);
            if (bukuIndex !== -1) {
                dataKatalogBuku[bukuIndex].stok += item.qty;
            }
        });
        
        // 2. Hapus Pesanan dari Riwayat
        dataRiwayatOrder.splice(orderIndex, 1);
        
        // 3. Simpan Perubahan
        saveRiwayatToLocalStorage();
        saveKatalogToLocalStorage();
        
        alert(`🗑️ Pesanan ${nomorDO} berhasil dihapus. Stok buku telah dikembalikan.`);
        
        // 4. Render Ulang
        renderRiwayatOrders();
    }
}


function renderRiwayatOrders() {
    const container = document.getElementById('riwayatContainer');
    const emptyMessage = document.getElementById('emptyRiwayat');
    
    if (!container || typeof dataRiwayatOrder === 'undefined') return;

    container.innerHTML = ''; 
    
    if (dataRiwayatOrder.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    } else {
        emptyMessage.style.display = 'none';
    }

    dataRiwayatOrder.slice().reverse().forEach(order => { 
        let statusBadgeClass;
        let actionButtonHtml = ''; 

        if (order.status === 'Diproses') {
            statusBadgeClass = 'bg-warning text-dark';
            actionButtonHtml = `<button class="btn btn-sm btn-secondary" disabled>Menunggu Dikirim</button>`;
        } else if (order.status === 'Dikirim' || order.status === 'Dalam Perjalanan') {
            statusBadgeClass = 'bg-primary';
            actionButtonHtml = `<button class="btn btn-sm btn-success mark-complete-btn me-2" data-do="${order.nomorDO}">✅ Pesanan Sampai</button>`;
        } else if (order.status === 'Selesai') {
            statusBadgeClass = 'bg-success';
            actionButtonHtml = `<button class="btn btn-sm btn-success" disabled>Telah Selesai</button>`;
        } else {
            statusBadgeClass = 'bg-secondary';
        }

        const itemsList = order.items.map(item => `
            <li>${item.namaBuku} (${item.qty} pcs) - ${formatRupiah(item.subtotal)}</li>
        `).join('');

        const orderCard = `
            <div class="col-12">
                <div class="card shadow-sm">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <strong>Nomor DO: ${order.nomorDO}</strong> 
                            <span class="badge ${statusBadgeClass}">${order.status}</span>
                        </div>
                        <small class="text-muted">Tanggal Pesan: ${order.tanggalPesan}</small>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6>Item Pesanan:</h6>
                                <ul>${itemsList}</ul>
                            </div>
                            <div class="col-md-6">
                                <h6>Info Pelanggan:</h6>
                                <p class="mb-1"><strong>Penerima:</strong> ${order.namaPenerima}</p>
                                <p class="mb-1"><strong>Alamat:</strong> ${order.alamat}</p>
                                <hr>
                                <h5 class="text-danger">TOTAL: ${formatRupiah(order.totalPembayaran)}</h5>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <div class="btn-group">
                            <a href="tracking.html?do=${order.nomorDO}" class="btn btn-sm btn-info">Lacak Pesanan</a>
                            ${actionButtonHtml}
                        </div>
                        
                        <button class="btn btn-sm btn-danger delete-order-btn" data-do="${order.nomorDO}">🗑️ Hapus</button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += orderCard;
    });
}

function cariTracking() {
    const noDoInput = document.getElementById('noDoInput').value.trim();
    const trackingResultDiv = document.getElementById('trackingResult');
    trackingResultDiv.innerHTML = ''; 

    let data = dataTracking[noDoInput];
    if (!data) {
        data = dataRiwayatOrder.find(order => order.nomorDO === noDoInput);
    }

    if (data) {
        let statusColor = 'bg-warning'; 
        let progress = 33;

        if (data.status === 'Dalam Perjalanan' || data.status === 'Dikirim') {
            statusColor = 'bg-primary';
            progress = 66;
        } else if (data.status === 'Selesai') { 
            statusColor = 'bg-success';
            progress = 100; 
        }
        
        const totalHarga = data.totalPembayaran ? formatRupiah(data.totalPembayaran) : (data.total || 'N/A');

        let htmlContent = `
            <div class="card p-3 mb-4 shadow-sm">
                <h4>Hasil Tracking untuk Nomor DO: ${data.nomorDO}</h4>
                <p><strong>Nama Pemesan:</strong> ${data.namaPenerima || data.nama}</p>
                <p><strong>Status Pengiriman:</strong> <span class="badge ${statusColor}">${data.status}</span></p>
                
                <h5>Simulasi Progress</h5>
                <div class="progress mb-3" style="height: 25px;">
                    <div class="progress-bar ${statusColor}" role="progressbar" style="width: ${progress}%" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">${data.status} (${progress}%)</div>
                </div>

                <h5>Detail Pengiriman</h5>
                <table class="table table-bordered table-sm mb-4">
                    <tr><td>Total Pembayaran</td><td>${totalHarga}</td></tr>
                </table>
                
                <h5>Histori Perjalanan</h5>
                <div class="table-responsive">
                    <table class="table table-striped table-sm">
                        <thead class="table-light">
                            <tr>
                                <th>Waktu</th>
                                <th>Keterangan</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.perjalanan.map(item => `
                                <tr>
                                    <td>${item.waktu}</td>
                                    <td>${item.keterangan}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        trackingResultDiv.innerHTML = htmlContent;

    } else {
        trackingResultDiv.innerHTML = '<div class="alert alert-danger" role="alert">Nomor Delivery Order tidak ditemukan.</div>';
    }
}


// --- Inisialisasi pada load halaman ---

document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus(); 
    loadInitialData(); 
    
    // --- Inisialisasi Per Halaman ---
    
    if (document.body.id === 'loginPage') {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
    } else if (document.body.id === 'stok') {
        const modalElement = document.getElementById('bukuModal');
        if (modalElement) {
            bukuModal = new bootstrap.Modal(modalElement); 
        }
        renderKatalog();
        const bukuForm = document.getElementById('bukuForm');
        if (bukuForm) {
            bukuForm.addEventListener('submit', saveBukuData);
        }
    } else if (document.body.id === 'checkout') {
        const initialItem = document.querySelector('#orderItemsContainer .order-item');
        populateBookDropdowns(initialItem);
        document.getElementById('addItemBtn').addEventListener('click', addNewOrderItem);
        document.getElementById('checkoutForm').addEventListener('submit', handleCheckoutSubmit);
        const initialRemoveBtn = initialItem.querySelector('.remove-item');
        if(initialRemoveBtn) {
            initialRemoveBtn.addEventListener('click', () => initialItem.remove());
        }
        
    } else if (document.body.id === 'riwayat') {
        renderRiwayatOrders();
        
        const riwayatContainer = document.getElementById('riwayatContainer');
        if(riwayatContainer) {
            riwayatContainer.addEventListener('click', function(event) {
                const completeButton = event.target.closest('.mark-complete-btn');
                if (completeButton) {
                    const nomorDO = completeButton.getAttribute('data-do');
                    if (nomorDO) {
                        markOrderAsCompleted(nomorDO);
                    }
                }
                
                const deleteButton = event.target.closest('.delete-order-btn');
                if (deleteButton) {
                    const nomorDO = deleteButton.getAttribute('data-do');
                    if (nomorDO) {
                        hapusOrder(nomorDO);
                    }
                }
            });
        }
        
    } else if (document.body.id === 'tracking') {
        const cariBtn = document.getElementById('cariTrackingBtn');
        if (cariBtn) {
            cariBtn.addEventListener('click', cariTracking);
        }
    }
});