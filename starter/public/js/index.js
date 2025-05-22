import { displayMap } from "./mapBox";
import { login, logout } from "./login"
import { update } from "./updateSettings";
import { bookTour } from "./stripe";
const map = document.getElementById('map')
if (map) {
    const locations = JSON.parse(map.dataset.locations);
    displayMap(locations)
}
const form = document.querySelector('.form--login')
if (form) {
    form.addEventListener('submit', e => {
        e.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        login(email,password)
    })
}

const logoutbtn = document.querySelector('.nav__el--logout')
if (logoutbtn) {
    logoutbtn.addEventListener('click', logout)
}

const updateUser = document.querySelector('.form-user-data')
if (updateUser) {
    updateUser.addEventListener('submit', e => {
        e.preventDefault()
        const form = new FormData()
        form.append('name',document.getElementById('name').value)
        form.append('email',document.getElementById('email').value)
        form.append('photo',document.getElementById('photo').files[0])
        update(form,'data')
    })
}

const updatePassword = document.querySelector('.form-user-settings')
if (updatePassword) {
    updatePassword.addEventListener('submit', async e => {
        e.preventDefault()
        document.querySelector('.btn--save-password').textContent = 'Updating...';
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await update({ passwordCurrent, password, passwordConfirm }, 'password')
        document.querySelector('.btn--save-password').textContent = 'Save password';
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    })
}
const bookingbtn = document.getElementById('book-tour')
if (bookingbtn) {
    bookingbtn.addEventListener('click', e => {
        e.target.textContent = 'Processing...'
        const {tourId}=e.target.dataset
        bookTour(tourId)
    })
}
