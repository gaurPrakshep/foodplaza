// Read table number from URL ?table=5
function getTableFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('table') || null;
}

function showTableNumber(table) {
  const el = document.getElementById('table-indicator');
  if (table) el.textContent = 'Table: ' + table;
  else el.textContent = 'Table: —';
}

// Smooth scroll for index links
document.querySelectorAll('.index a').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({behavior:'smooth', block:'start'});
  });
});

// WhatsApp order button: builds message with table number
document.getElementById('whatsapp-order').addEventListener('click', () => {
  const table = getTableFromURL();
  const base = 'https://wa.me/'; // Add your restaurant phone number after the slash when deploying
  const phone = '919xxxxxxxxx'; // REPLACE with restaurant number in international format (no + or spaces), e.g. 919812345678
  // Build a basic message: table + visible items (for now just a free-text prompt)
  let message = `Hello! I want to place an order${table ? ' for Table ' + table : ''}.\n\nItems:\n- `;
  message += 'Please add your items here.';
  const encoded = encodeURIComponent(message);
  const url = `${base}${phone}?text=${encoded}`;
  window.open(url, '_blank');
});

// Optional: click on item to copy its name to clipboard (simple helper)
document.querySelectorAll('.menu-item').forEach(item => {
  item.addEventListener('click', () => {
    const name = item.dataset.name;
    const price = item.dataset.price;
    const text = `${name} - ₹${price}`;
    navigator.clipboard?.writeText(text).then(()=> {
      // small feedback
      const old = item.innerHTML;
      item.style.opacity = '0.8';
      setTimeout(()=> item.style.opacity='1', 300);
    }).catch(()=>{});
  });
});

// show table on load
showTableNumber(getTableFromURL());
