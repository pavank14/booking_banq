const calendarEl = document.getElementById('calendar');
const bookingFormEl = document.getElementById('booking-form');
const formEl = document.getElementById('form');
const hallTypeEl = document.getElementById('hall-type');
const monthYearEl = document.getElementById('month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

let selectedDate = null;
let currentDate = new Date(); // Tracks the currently displayed month and year

// Replace with your Google Apps Script Web App URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyipQvHSTavzXb7do4vOTedaikITBR4BBLDe4M-LBAhojMqcMrceJXD4fJJb_ZceXNxOw/exec';

// Fetch bookings from Google Sheets
async function fetchBookings() {
  const response = await fetch(SCRIPT_URL);
  const bookings = await response.json();
  return bookings;
}

// Render the calendar
function renderCalendar(year, month, bookings) {
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // Total days in the month
  const firstDay = new Date(year, month, 1).getDay(); // Day of the week for the first day of the month
  calendarEl.innerHTML = '';

  // Update the month and year display
  monthYearEl.textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;

  // Add empty cells for the days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    calendarEl.innerHTML += `<div class="day empty"></div>`;
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isBooked = bookings.some(booking => booking.Date === date && booking.HallType === hallTypeEl.value);
    calendarEl.innerHTML += `<div class="day ${isBooked ? 'booked' : ''}" data-date="${date}">${day}</div>`;
  }

  // Add event listeners to available days
  document.querySelectorAll('.day:not(.booked):not(.empty)').forEach(day => {
    day.addEventListener('click', () => {
      selectedDate = day.dataset.date;
      bookingFormEl.classList.remove('hidden');
      document.getElementById('date').value = selectedDate;
    });
  });
}

// Handle form submission
formEl.addEventListener('submit', async (e) => {
  e.preventDefault();
  const booking = {
    date: selectedDate,
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    eventType: document.getElementById('event-type').value,
    hallType: hallTypeEl.value,
  };

  // Save booking to Google Sheets
  await fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify(booking),
  });

  alert('Booking saved successfully!');
  window.location.reload();
});

// Navigate to the previous month
prevMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  init();
});

// Navigate to the next month
nextMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  init();
});

// Initialize the calendar
async function init() {
  const bookings = await fetchBookings();
  renderCalendar(currentDate.getFullYear(), currentDate.getMonth(), bookings);
}

// Reload calendar when hall type changes
hallTypeEl.addEventListener('change', init);

// Initialize on page load
init();