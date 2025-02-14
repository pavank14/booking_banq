const sheetURL = "https://script.google.com/macros/s/AKfycbxwU6VoAJ1d_0-T19AKqzr1nq7Qd62AHlyR8tYJdlCdtkiWpJMRX2MF-CLMeYdgpXfR3w/exec"; // Replace with your Google Apps Script Web App URL
const calendar = document.getElementById("calendar");
const hallSelect = document.getElementById("hallSelect");

let currentDate = new Date();
let bookings = {};

function generateCalendar() {
    calendar.innerHTML = ""; // Clear previous calendar
    let firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    let lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    document.getElementById("monthYear").innerText = 
        `${firstDay.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`;

    let selectedHall = hallSelect.value;

    // Add empty spaces before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
        let emptyCell = document.createElement("div");
        emptyCell.className = "empty";
        calendar.appendChild(emptyCell);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
        let dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        let dayElement = document.createElement("div");
        dayElement.className = "day";
        dayElement.innerText = day;
        dayElement.setAttribute("data-date", dateString);
        dayElement.onclick = () => openForm(dateString);

        // Check if date is booked for selected hall
        if (bookings[selectedHall] && bookings[selectedHall][dateString]) {
            dayElement.classList.add("booked");
            dayElement.onclick = () => showBookingDetails(bookings[selectedHall][dateString]);
        }

        calendar.appendChild(dayElement);
    }
}

function changeMonth(offset) {
    currentDate.setMonth(currentDate.getMonth() + offset);
    generateCalendar();
}

function openForm(date) {
    document.getElementById("bookingDate").value = date;
    document.getElementById("bookingForm").classList.remove("hidden");
}

function closeForm() {
    document.getElementById("bookingForm").classList.add("hidden");
}

function saveBooking() {
    let name = document.getElementById("name").value;
    let phone = document.getElementById("phone").value;
    let address = document.getElementById("address").value;
    let eventType = document.getElementById("eventType").value;
    let hallType = hallSelect.value;
    let date = document.getElementById("bookingDate").value;

    fetch(sheetURL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `date=${date}&name=${name}&phone=${phone}&address=${address}&event=${eventType}&hall=${hallType}`
    })
    .then(response => response.text())
    .then(data => {
        if (data === "Success") {
            alert("Booking saved!");
            closeForm();
            fetchBookings(); // Refresh calendar immediately
        }
    })
    .catch(error => console.error("Error:", error));
}

function fetchBookings() {
    fetch(sheetURL)
        .then(response => response.json())
        .then(data => {
            bookings = {};

            data.slice(1).forEach(row => {
                let date = row[0];
                let hall = row[5]; // Hall type
                let bookingDetails = {
                    date: row[0],
                    name: row[1],
                    phone: row[2],
                    address: row[3],
                    event: row[4],
                    hall: row[5]
                };

                if (!bookings[hall]) {
                    bookings[hall] = {};
                }

                bookings[hall][date] = bookingDetails;
            });

            generateCalendar(); // Update calendar after fetching bookings
        })
        .catch(error => console.error("Error fetching bookings:", error));
}

function showBookingDetails(booking) {
    alert(`📅 Date: ${booking.date}\n👤 Name: ${booking.name}\n📞 Phone: ${booking.phone}\n🏠 Address: ${booking.address}\n🎉 Event: ${booking.event}`);
}

document.addEventListener("DOMContentLoaded", fetchBookings);
hallSelect.addEventListener("change", generateCalendar);
