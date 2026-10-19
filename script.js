const products = [
  {id:1,name:"Seragam Sekolah",price:75000,description:"Seragam sekolah yang nyaman dan rapi.",image:"images/product-1.svg"},
  {id:2,name:"Buku Tulis",price:12000,description:"Buku tulis untuk kebutuhan belajar sehari-hari.",image:"images/product-2.svg"},
  {id:3,name:"Alat Tulis",price:15000,description:"Perlengkapan alat tulis untuk siswa.",image:"images/product-3.svg"},
  {id:4,name:"Atribut Sekolah",price:25000,description:"Atribut sekolah untuk melengkapi kebutuhanmu.",image:"images/product-4.svg"}
];

const grid = document.getElementById("productGrid");
const cartCount = document.getElementById("cartCount");
const toast = document.getElementById("toast");
let cart = JSON.parse(localStorage.getItem("kc_cart") || "[]");
let currentProduct = null;
let qty = 1;

function rupiah(n){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n)}

function renderProducts(){
  grid.innerHTML = products.map(p => `
    <article class="product-card">
      <div class="product-image" data-id="${p.id}" title="Klik untuk mengganti gambar">
        <img id="img-${p.id}" src="${getSavedImage(p)}" alt="${p.name}">
        <div class="upload-hint">Klik gambar untuk ganti</div>
        <input class="image-input" type="file" accept="image/*" data-id="${p.id}" hidden>
      </div>
      <h3>${p.name}</h3>
      <div class="price">${rupiah(p.price)}</div>
      <div class="product-actions">
        <button class="btn btn-outline detail-btn" data-id="${p.id}">Detail</button>
        <button class="btn buy-btn" data-id="${p.id}">Beli Sekarang</button>
      </div>
    </article>
  `).join("");
  bindProductEvents();
}

function getSavedImage(p){
  return localStorage.getItem("kc_img_"+p.id) || p.image;
}

function bindProductEvents(){
  document.querySelectorAll(".product-image").forEach(box=>{
    box.addEventListener("click",()=>{
      box.querySelector(".image-input").click();
    });
  });
  document.querySelectorAll(".image-input").forEach(input=>{
    input.addEventListener("change",e=>{
      const file=e.target.files[0];
      if(!file) return;
      if(file.size > 2*1024*1024){showToast("Ukuran gambar maksimal 2 MB.");return;}
      const reader=new FileReader();
      reader.onload=()=>{
        try{
          localStorage.setItem("kc_img_"+input.dataset.id,reader.result);
          document.getElementById("img-"+input.dataset.id).src=reader.result;
          showToast("Gambar produk berhasil diganti.");
        }catch(err){showToast("Gambar terlalu besar untuk penyimpanan browser.");}
      };
      reader.readAsDataURL(file);
    });
  });
  document.querySelectorAll(".detail-btn,.buy-btn").forEach(btn=>{
    btn.addEventListener("click",()=>openProduct(Number(btn.dataset.id)));
  });
}

function openProduct(id){
  currentProduct=products.find(p=>p.id===id);
  qty=1;
  document.getElementById("modalProductImage").src=getSavedImage(currentProduct);
  document.getElementById("productTitle").textContent=currentProduct.name;
  document.getElementById("productDescription").textContent=currentProduct.description;
  document.getElementById("productPrice").textContent=rupiah(currentProduct.price);
  document.getElementById("qtyValue").textContent=qty;
  document.getElementById("productModal").classList.remove("hidden");
}

document.getElementById("minusQty").onclick=()=>{qty=Math.max(1,qty-1);document.getElementById("qtyValue").textContent=qty};
document.getElementById("plusQty").onclick=()=>{qty++;document.getElementById("qtyValue").textContent=qty};

document.getElementById("addCartBtn").onclick=()=>{
  if(!currentProduct)return;
  for(let i=0;i<qty;i++) cart.push(currentProduct.id);
  localStorage.setItem("kc_cart",JSON.stringify(cart));
  updateCart();
  closeModal("productModal");
  showToast(`${currentProduct.name} ditambahkan ke keranjang.`);
};

function updateCart(){cartCount.textContent=cart.length}
document.getElementById("cartFab").onclick=()=>{
  if(!cart.length){showToast("Keranjang masih kosong.");return;}
  const counts={};
  cart.forEach(id=>counts[id]=(counts[id]||0)+1);
  const summary=Object.entries(counts).map(([id,n])=>{
    const p=products.find(x=>x.id==id);return `${p.name} x${n}`;
  }).join(", ");
  if(confirm(`Keranjang:\n${summary}\n\nKosongkan keranjang?`)){
    cart=[];localStorage.setItem("kc_cart","[]");updateCart();showToast("Keranjang dikosongkan.");
  }
};

document.getElementById("contactForm").addEventListener("submit",e=>{
  e.preventDefault();
  const name=document.getElementById("contactName").value.trim();
  const email=document.getElementById("contactEmail").value.trim();
  const message=document.getElementById("contactMessage").value.trim();
  const text=encodeURIComponent(`Halo Koperasi SMK Cambridge,%0A%0ANama: ${name}%0AEmail: ${email}%0A%0APesan: ${message}`);
  window.open(`https://wa.me/6285794967287?text=${text}`,"_blank");
  document.getElementById("contactStatus").textContent="Pesan diteruskan ke WhatsApp.";
  e.target.reset();
});

const accountModal=document.getElementById("accountModal");
document.getElementById("accountBtn").onclick=()=>{
  const saved=localStorage.getItem("kc_user")||"";
  document.getElementById("username").value=saved;
  accountModal.classList.remove("hidden");
};
document.getElementById("saveAccount").onclick=()=>{
  const name=document.getElementById("username").value.trim();
  if(!name){showToast("Masukkan nama pengguna.");return;}
  localStorage.setItem("kc_user",name);
  document.getElementById("accountBtn").textContent=name.toUpperCase().slice(0,12);
  closeModal("accountModal");showToast("Akun demo tersimpan.");
};
document.getElementById("logoutBtn").onclick=()=>{
  localStorage.removeItem("kc_user");
  document.getElementById("accountBtn").textContent="ACCOUNT";
  closeModal("accountModal");showToast("Akun demo dikeluarkan.");
};

document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>closeModal(b.dataset.close));
document.querySelectorAll(".modal").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)m.classList.add("hidden")}));
function closeModal(id){document.getElementById(id).classList.add("hidden")}
function showToast(msg){
  toast.textContent=msg;toast.classList.add("show");
  clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>toast.classList.remove("show"),2400);
}

const menuToggle=document.getElementById("menuToggle");
const nav=document.getElementById("mainNav");
menuToggle.onclick=()=>nav.classList.toggle("open");
nav.querySelectorAll("a").forEach(a=>a.onclick=()=>nav.classList.remove("open"));

const savedUser=localStorage.getItem("kc_user");
if(savedUser) document.getElementById("accountBtn").textContent=savedUser.toUpperCase().slice(0,12);
document.getElementById("year").textContent=new Date().getFullYear();
renderProducts();
updateCart();
