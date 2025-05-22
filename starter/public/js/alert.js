const hidealert = () => {
    const el = document.querySelector('.alert')
    el.parentElement.removeChild(el)
}
export const showAlert = (status, message) => {
    const markAlert = `<div class = 'alert alert--${status}'>${message}</div>`
    document.querySelector('body').insertAdjacentHTML('afterbegin', markAlert)
    setTimeout(hidealert,5000)
}
