/* -------------------------
   Part 2 script: polished UI
   - table detection
   - smooth scrolling for index
   - lazy-friendly image reveal (minor)
   - whatsapp button (basic)
   ------------------------- */

/** Helpers **/
function getTableFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('table') || null;
}

function showTableNumber(table) {
  const el = document.getElementById('table-indicator');
  el.textContent = table ? `Table: ${table}` : 'Table: —';
}

/** Smooth scroll for index links */
document.addEventListener('click', (e) => {
  const a = e.target.closest('.index a');
  if (!a) return;
  e.preventDefault();
  const id = a.getAttribute('href').slice(1);
  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // focus for a11y
    setTimeout(()=> target.focus({preventScroll:true}), 350);
  }
});

/** Simple image reveal for lazy images (no library) */
function revealLazyImages() {
  const imgs = document.querySelectorAll('img[loading="lazy"]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(ent => {
      if (ent.isIntersecting) {
        const img = ent.target;
        // small visual reveal
        img.style.opacity = '0';
        img.onload = () => img.style.opacity = '1';
        // ensure image loads (browser already starts because of src)
        io.unobserve(img);
      }
    });
  }, { rootMargin: '200px 0px' });
  imgs.forEach(i => io.observe(i));
}

/** WhatsApp order button - builds a basic message with table number.
 * Replace `phone` variable with your number (international format, no +).
 */
document.getElementById('whatsapp-order').addEventListener('click', () => {
  const table = getTableFromURL();
  const phone = '919xxxxxxxxx'; // <-- REPLACE with restaurant number e.g. 919812345678
  let message = `Hello! I'd like to place an order${table ? ' for Table ' + table : ''}.\n\nItems:\n- `;
  message += 'Please add your items here.';
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
});

/** Init on DOM ready */
document.addEventListener('DOMContentLoaded', () => {
  showTableNumber(getTableFromURL());
  revealLazyImages();
});
