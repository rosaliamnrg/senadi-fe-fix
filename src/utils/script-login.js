document.addEventListener("DOMContentLoaded", function() {
    const modal = document.getElementById("registerModal");
    const openModalBtn = document.getElementById("openModal");
    const closeModalBtns = document.querySelectorAll(".close");

    // Buka modal registrasi
    openModalBtn.addEventListener("click", function(event) {
        event.preventDefault();
        modal.style.display = "flex";
    });

    // Tutup modal saat tombol close diklik
    closeModalBtns.forEach(btn => {
        btn.addEventListener("click", function() {
            modal.style.display = "none";
        });
    });

    // Tutup modal saat klik di luar modal
    window.addEventListener("click", function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const provinsiSelect = document.querySelector("select[name='provinsi']");
    const kabupatenSelect = document.querySelector("select[name='kabupaten']");

    // Data Kabupaten/Kota berdasarkan Provinsi
    const kabupatenData = {
        "Aceh": ["Kota Banda Aceh", "Kota Lhokseumawe", "Kota Langsa", "Sabang"],
        "Sumatera Utara": ["Kota Medan", "Kota Binjai", "Kota Pematang Siantar", "Tebing Tinggi"],
        "Sumatera Barat": ["Kota Padang", "Kota Bukittinggi", "Kabupaten Solok"],
        "Riau": ["Kota Pekanbaru", "Kota Dumai", "Kabupaten Rokan Hilir"],
        "Jawa Barat": ["Kota Bandung", "Kabupaten Tasikmalaya", "Kabupaten Sukabumi", "Kubupaten Subang"],
        "Jawa Tengah": ["Kabupaten Pemalang", "Kabupaten Tegal", "Kota Magelang", "Kota Pekalongan"],
        "Jawa Timur": ["Kota Surabaya", "Kabupaten Ngawi", "Kabupaten Malang", "Kabupaten Ponorogo"],
        "Bali": ["Kota Denpasar", "Kabupaten Badung", "Kabupaten Gianyar"],
        "Papua": ["Kota Jayapura", "Kabupaten Kepulauan Yapen", "Kabupaten Biak Numfor"],
        "Papua Barat": ["Kabupaten Manokwari", "Kabupaten Manokwari Selatan"]
        // Tambahkan provinsi lainnya sesuai kebutuhan
    };

    // Event saat provinsi dipilih
    provinsiSelect.addEventListener("change", function () {
        const provinsiTerpilih = provinsiSelect.value;
        kabupatenSelect.innerHTML = `<option value="">::Pilih Kabupaten/Kota::</option>`; // Reset pilihan

        if (provinsiTerpilih && kabupatenData[provinsiTerpilih]) {
            kabupatenData[provinsiTerpilih].forEach(function (kabupaten) {
                const option = document.createElement("option");
                option.value = kabupaten;
                option.textContent = kabupaten;
                kabupatenSelect.appendChild(option);
            });
        }
    });
});

document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    if (result.success) {
        alert('Login berhasil!');
        window.location.href = 'chat.html';
    } else {
        alert('Login gagal: ' + result.message);
    }
});
